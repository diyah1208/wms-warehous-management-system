import SectionContainer, {
  SectionHeader,
  SectionBody,
  SectionFooter,
} from "@/components/content-container";
import WithSidebar from "@/components/layout/WithSidebar";
import { MyPagination } from "@/components/my-pagination";
import { QuickTable } from "@/components/quick-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { getAllUsers, updateUserStatus } from "@/services/user";
import type { UserDb } from "@/types";
import { PagingSize } from "@/types/enum";

import {
  UserCheck,
  UserX,
  Search,
  Filter,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";

import { toast } from "sonner";
import { EditUserDialog } from "@/components/dialog/edit-user";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { userCache } from "@/services/user-cache";
import { useMemo } from "react";



/* =========================
   PAGE
========================= */
export default function UserManagementPage() {
  const [refresh, setRefresh] = useState(false);
const [users, setUsers] = useState<UserDb[]>(
  userCache.data ?? []
);
useEffect(() => {
  async function fetchUsers() {
    try {
      const res = await getAllUsers();
      if (res) {
        userCache.data = res; // ⬅️ SIMPAN CACHE
        setUsers(res);
      }
    } catch {
      toast.error("Gagal mengambil data user");
    }
  }

  fetchUsers(); // background
}, [refresh]);


  return (
    <WithSidebar>
      <DataUserSection users={users} setRefresh={setRefresh} />
    </WithSidebar>
  );
}

/* =========================
   COLUMNS
========================= */
function UserColumnsGenerator(
  setRefresh: Dispatch<SetStateAction<boolean>>
) {
  return [
    {
      header: "Nama",
      accessorKey: "nama",
    },
    {
      header: "Email",
      accessorKey: "email",
    },
    {
      header: "Role",
      accessorKey: "role",
    },
    {
      header: "Lokasi",
      accessorKey: "lokasi",
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (value: string) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1
            ${
              value === "active"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
        >
          {value === "active" ? (
            <>
              <UserCheck className="h-3 w-3" />
              AKTIF
            </>
          ) : (
            <>
              <UserX className="h-3 w-3" />
              NON AKTIF
            </>
          )}
        </span>
      ),
    },
    {
      header: "Aksi",
      accessorKey: "aksi",
      cell: (_: any, row: UserDb) => (
        <div className="flex gap-2">
          {/* EDIT */}
          <EditUserDialog user={row} refresh={setRefresh} />

          {/* AKTIF / NON AKTIF */}
          {row.status === "active" ? (
            <AlertDialog>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-600 text-red-600 hover:bg-red-50"
                      >
                        <UserX className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                  </TooltipTrigger>
                  
                </Tooltip>
              </TooltipProvider>

              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Nonaktifkan User?</AlertDialogTitle>
                  <AlertDialogDescription>
                    User <b>{row.nama}</b> akan dinonaktifkan.
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-red-600 hover:bg-red-700 text-white"
                    onClick={async () => {
  try {
    await updateUserStatus(row.id, "inactive");
    toast.success("User berhasil dinonaktifkan");
    setRefresh((p) => !p);
  } catch {
    toast.error("Gagal menonaktifkan user");
  }
}}

                  >
                    Ya, Nonaktifkan
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : (
            <AlertDialog>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        className="!bg-green-600 hover:!bg-green-700 text-white"
                      >
                        <UserCheck className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                  </TooltipTrigger>
                  
                </Tooltip>
              </TooltipProvider>

              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Aktifkan User?</AlertDialogTitle>
                  <AlertDialogDescription>
                    User <b>{row.nama}</b> akan diaktifkan kembali.
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction
                    className="!bg-green-600 hover:!bg-green-700 text-white"
                   onClick={async () => {
  try {
    await updateUserStatus(row.id, "active");
    toast.success("User berhasil diaktifkan kembali");
    setRefresh((p) => !p);
  } catch {
    toast.error("Gagal mengaktifkan user");
  }
}}

                  >
                    Ya, Aktifkan
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      ),
    },
  ];
}

/* =========================
   SECTION TABLE
========================= */
function DataUserSection({
  users,
  setRefresh,
}: {
  users: UserDb[];
  setRefresh: Dispatch<SetStateAction<boolean>>;
}) {
  const pageSize = PagingSize;
  const [filteredUsers, setFilteredUsers] = useState<UserDb[]>([]);
  const [tableUsers, setTableUsers] = useState<UserDb[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  // filter
  const [email, setEmail] = useState("");
  const [nama, setNama] = useState("");
const columns = useMemo(
  () => UserColumnsGenerator(setRefresh),
  [setRefresh]
);

  useEffect(() => {
    setFilteredUsers(users);
    setTableUsers(users.slice(0, pageSize));
    setCurrentPage(1);
  }, [users]);

  useEffect(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    setTableUsers(filteredUsers.slice(start, end));
  }, [currentPage, filteredUsers]);

  function filterUser() {
    let data = users;

    if (email)
      data = data.filter((u) =>
        u.email.toLowerCase().includes(email.toLowerCase())
      );

    if (nama)
      data = data.filter((u) =>
        u.nama.toLowerCase().includes(nama.toLowerCase())
      );

    setFilteredUsers(data);
    setCurrentPage(1);
  }

  function resetFilter() {
    setEmail("");
    setNama("");
    setFilteredUsers(users);
    setCurrentPage(1);
  }

  return (
    <SectionContainer span={12}>
      <SectionHeader>Daftar Pengguna</SectionHeader>

      <SectionBody className="grid grid-cols-12 gap-2">
        <div className="flex flex-col gap-4 col-span-12">
          {/* FILTER */}
          <div className="flex gap-2">
            <Input
              placeholder="Cari email pengguna"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && filterUser()}
            />

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    onClick={filterUser}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Cari User</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72 space-y-3">
                <Input
                  placeholder="Nama"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={resetFilter}>
                    Reset
                  </Button>
                  <Button size="sm" onClick={filterUser}>
                    Terapkan
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={resetFilter}
                    className="border-red-300 text-red-600 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Reset Filter</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* TABLE */}
         <QuickTable
  data={tableUsers}
  columns={columns}
  page={currentPage}
/>

        </div>
      </SectionBody>

      <SectionFooter>
        <MyPagination
          data={filteredUsers}
          currentPage={currentPage}
          triggerNext={() => setCurrentPage((p) => p + 1)}
          triggerPrevious={() => setCurrentPage((p) => p - 1)}
          triggerPageChange={(p) => setCurrentPage(p)}
        />
      </SectionFooter>
    </SectionContainer>
  );
}