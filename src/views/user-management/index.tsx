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
import {
  getAllUsers,
  approveUser,
  rejectUser,
  activateUser,
  deactivateUser,
} from "@/services/user";

import type { UserDb } from "@/types";
import { PagingSize } from "@/types/enum";

import {
  UserCheck,
  UserX,
  Search,
  Filter,
  X,
  Check,
  Clock,
  XCircle,
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
  accessorKey: "approval_status",
  cell: (_: any, row: UserDb) => {

    // ===== PENDING =====
    if (row.approval_status === "pending") {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
          <Clock className="h-3 w-3" />
          PENDING
        </span>
      );
    }

    // ===== REJECTED =====
    if (row.approval_status === "rejected") {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
          <XCircle className="h-3 w-3" />
          DITOLAK
        </span>
      );
    }

    // ===== APPROVED =====
    return row.is_active ? (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
        <UserCheck className="h-3 w-3" />
        AKTIF
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-gray-200 text-gray-700">
        <UserX className="h-3 w-3" />
        NONAKTIF
      </span>
    );
  },
},

{

  header: "Aksi",
  accessorKey: "aksi",
  cell: (_: any, row: UserDb) => (
    <div className="flex gap-2">

      {/* ================= PENDING ================= */}
      {row.approval_status === "pending" && (
        <>
          {/* APPROVE */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="outline" className="border-green-600 text-green-600">
                <Check className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Terima user?</AlertDialogTitle>
                <AlertDialogDescription>
                  Yakin terima <b>{row.nama}</b>?
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={async () => {
                    try {
                      await approveUser(row.id);
                      toast.success("User di-approve");
                      setRefresh((p) => !p);
                    } catch {
                      toast.error("Gagal approve");
                    }
                  }}
                >
                  Ya
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* REJECT */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="outline" className="border-red-600 text-red-600">
                <X className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Tolak user?</AlertDialogTitle>
                <AlertDialogDescription>
                  Yakin tolak <b>{row.nama}</b>?
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-600 hover:bg-red-700 text-white"
                  onClick={async () => {
                    try {
                      await rejectUser(row.id);
                      toast.success("User di-reject");
                      setRefresh((p) => !p);
                    } catch {
                      toast.error("Gagal reject");
                    }
                  }}
                >
                  Ya
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}

      {/* ================= APPROVED & ACTIVE ================= */}
      {row.approval_status === "approved" && row.is_active && (
        <>
          {/* EDIT hanya muncul kalau AKTIF */}
          <EditUserDialog user={row} refresh={setRefresh} />

          {/* NONAKTIF */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="outline" className="border-red-600 text-red-600">
                <UserX className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Nonaktifkan user?</AlertDialogTitle>
                <AlertDialogDescription>
                  User <b>{row.nama}</b> akan dinonaktifkan dan
                tidak bisa digunakan untuk transaksi.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-600 hover:bg-red-700 text-white"
                  onClick={async () => {
                    try {
                      await deactivateUser(row.id);
                      toast.success("User dinonaktifkan");
                      setRefresh((p) => !p);
                    } catch {
                      toast.error("Gagal nonaktifkan");
                    }
                  }}
                >
                  Ya
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}

      {/* ================= APPROVED & INACTIVE ================= */}
      {row.approval_status === "approved" && !row.is_active && (
        <>
          {/* ❗ EDIT HILANG kalau NONAKTIF */}

          {/* AKTIFKAN */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="outline" className="border-green-600 text-green-600">
                <UserCheck className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Aktifkan user?</AlertDialogTitle>
                <AlertDialogDescription>
                  User <b>{row.nama}</b> akan diaktifkan kembali.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={async () => {
                    try {
                      await activateUser(row.id);
                      toast.success("User diaktifkan");
                      setRefresh((p) => !p);
                    } catch {
                      toast.error("Gagal aktifkan");
                    }
                  }}
                >
                  Ya
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}

      {/* ================= REJECTED ================= */}
      {row.approval_status === "rejected" && (
        <span className="text-xs text-gray-400 italic"></span>
      )}
    </div>
  ),
}

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