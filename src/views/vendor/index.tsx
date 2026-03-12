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
  getMasterVendors,
  toggleMasterVendorStatus,
} from "@/services/vendor";
import type { MasterVendor } from "@/types";
import { PagingSize } from "@/types/enum";
import { ClipboardPlus, Filter, Search, UserCheck, UserX, X } from "lucide-react";
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { toast } from "sonner";
import CreateVendorForm from "@/components/form/create-vendor";
import { EditVendorDialog } from "@/components/dialog/edit-vendor";
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
//import { vendorCache } from "@/services/vendor-cache";
import { useMemo } from "react";
import { useAuth } from "@/context/AuthContext";

export default function MasterVendorPage() {
  const [refresh, setRefresh] = useState<boolean>(false);
// const [vendors, setVendors] = useState<MasterVendor[]>(
//   vendorCache.data ?? []
// );
const [vendors, setVendors] = useState<MasterVendor[]>([]);

const {user } = useAuth();

useEffect(() => {
  async function fetchVendors() {
    try {
      const res = await getMasterVendors();
      if (res) {
       // vendorCache.data = res; // ⬅️ SIMPAN CACHE
        setVendors(res);
      }
    } catch {
      toast.error("Gagal mengambil data vendor");
    }
  }

  fetchVendors();
}, [refresh]);


  return (
    <WithSidebar>
      {/* =======================
          DATA MASTER VENDOR
      ======================== */}
      <DataMasterVendorSection
        vendors={vendors}
        setVendors={setVendors} 
        setRefresh={setRefresh}
      />

      {/* =======================
          TAMBAH VENDOR
      ======================== */}
      {(user?.role === "purchasing" || user?.role === "superadmin") && (
      <SectionContainer span={12}>
        <SectionHeader>Tambah Vendor</SectionHeader>
        <SectionBody className="grid grid-cols-12 gap-2">
          <div className="col-span-12 rounded-sm">
            <CreateVendorForm setRefresh={setRefresh} />
          </div>
        </SectionBody>
       <SectionFooter>
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="submit"
          form="create-vendor-form"
          className="w-full !bg-green-600 hover:!bg-green-700 !text-white "
        >
           <ClipboardPlus className="h-4 w-4" />
          <span>Tambah</span>
        </Button>
      </TooltipTrigger>
      
    </Tooltip>
  </TooltipProvider>
</SectionFooter>

      </SectionContainer>
      )}
    </WithSidebar>
  );
}

/* =========================
   COLUMNS
========================= */
function VendorColumnsGenerator(
  setRefresh: Dispatch<SetStateAction<boolean>>,
  setVendors: Dispatch<SetStateAction<MasterVendor[]>>
) {
  return [
    {
      header: "No Vendor",
      accessorKey: "vendor_no",
    },
    {
      header: "Nama Vendor",
      accessorKey: "vendor_name",
    },
    {
      header: "Telepon",
      accessorKey: "telephone",
    },
    {
      header: "Kontak",
      accessorKey: "contact_name",
    },
    {
      header: "Status",
      accessorKey: "is_active",
      cell: (_: any, row: MasterVendor) => {
        const active = Boolean(row.is_active);


        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 ${
              active
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {active ? (
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
        );
      },
    },


    // {
    //   header: "Created At",
    //   accessorKey: "created_at",
    //   cell: (value: any) => formatTanggal(value),
    // },
{
  header: "Aksi",
  accessorKey: "aksi",
  cell: (_: any, row: MasterVendor) => (
    <div className="flex gap-2">

      {/* =====================
          EDIT — hanya muncul kalau AKTIF
      ====================== */}
{/* EDIT — hanya muncul kalau AKTIF */}
{row.is_active ? (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <div>
          <EditVendorDialog vendor={row} refresh={setRefresh} />
        </div>
      </TooltipTrigger>
    </Tooltip>
  </TooltipProvider>
) : null}

      {/* =====================
          AKTIF / NONAKTIF (PAKAI KONFIRMASI)
      ====================== */}
      {row.is_active ? (
        /* ---------- NONAKTIFKAN ---------- */
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
                    <UserX className="h-4 w-4 mr-1" />
                  </Button>
                </AlertDialogTrigger>
              </TooltipTrigger>
            </Tooltip>
          </TooltipProvider>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Nonaktifkan Vendor?</AlertDialogTitle>
              <AlertDialogDescription>
                Vendor <b>{row.vendor_name}</b> akan dinonaktifkan dan
                tidak bisa digunakan untuk transaksi.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={async () => {
                  try {
                    await toggleMasterVendorStatus(row.vendor_id!);
                    setVendors(prev =>
                      prev.map(v =>
                        v.vendor_id === row.vendor_id
                          ? { ...v, is_active: !v.is_active }
                          : v
                      )
                    );
                    toast.success("Vendor berhasil dinonaktifkan");
                  } catch {
                    toast.error("Gagal menonaktifkan vendor");
                  }
                }}
              >
                Ya, Nonaktifkan
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : (
        /* ---------- AKTIFKAN ---------- */
        <AlertDialog>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <AlertDialogTrigger asChild>
                  <Button
                    size="sm"
                    className="!bg-green-600 hover:!bg-green-700 text-white"
                  >
                    <UserCheck className="h-4 w-4 mr-1 text-white" />
                  </Button>
                </AlertDialogTrigger>
              </TooltipTrigger>
            </Tooltip>
          </TooltipProvider>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Aktifkan Vendor?</AlertDialogTitle>
              <AlertDialogDescription>
                Vendor <b>{row.vendor_name}</b> akan diaktifkan kembali.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction
                className="!bg-green-600 hover:!bg-green-700 text-white"
                onClick={async () => {
                  try {
                    await toggleMasterVendorStatus(row.vendor_id!);
                    setVendors(prev =>
                      prev.map(v =>
                        v.vendor_id === row.vendor_id
                          ? { ...v, is_active: !v.is_active }
                          : v
                      )
                    );
                    toast.success("Vendor berhasil diaktifkan kembali");
                  } catch {
                    toast.error("Gagal mengaktifkan vendor");
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
function DataMasterVendorSection({
  vendors,
  setVendors, // ✅ FIX
  setRefresh,
}: {
  vendors: MasterVendor[];
  setRefresh: Dispatch<SetStateAction<boolean>>;
  setVendors: Dispatch<SetStateAction<MasterVendor[]>>;
}) {

  const { user } = useAuth();
  const [filteredVendors, setFilteredVendors] =
    useState<MasterVendor[]>([]);
  const [tableVendors, setTableVendors] =
    useState<MasterVendor[]>([]);

  const pageSize = PagingSize;
  const [currentPage, setCurrentPage] = useState<number>(1);

  // filter state
  const [vendorNo, setVendorNo] = useState("");
  const [vendorName, setVendorName] = useState("");
const columns = useMemo(() => {
  const cols = VendorColumnsGenerator(setRefresh, setVendors);

  if (user?.role !== "purchasing") {
    return cols.filter((col: any) => col.accessorKey !== "aksi");
  }

  return cols;
}, [setRefresh, setVendors, user?.role]);
  useEffect(() => {
    setFilteredVendors(vendors);
    setTableVendors(vendors.slice(0, pageSize));
    setCurrentPage(1);
  }, [vendors]);

  useEffect(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    setTableVendors(filteredVendors.slice(start, end));
  }, [currentPage, filteredVendors]);

  function filterVendor() {
    let filtered = vendors;

    if (vendorNo) {
      filtered = filtered.filter((v) =>
        v.vendor_no.toLowerCase().includes(vendorNo.toLowerCase())
      );
    }

    if (vendorName) {
      filtered = filtered.filter((v) =>
        v.vendor_name.toLowerCase().includes(vendorName.toLowerCase())
      );
    }

    setFilteredVendors(filtered);
    setCurrentPage(1);
  }

  function resetFilter() {
    setVendorNo("");
    setVendorName("");
    setFilteredVendors(vendors);
    setCurrentPage(1);
  }

return (
  <SectionContainer span={12}>
    <SectionHeader>Daftar Vendor</SectionHeader>

    <SectionBody className="grid grid-cols-12 gap-2">
      <div className="flex flex-col gap-4 col-span-12">

        {/* =====================
            FILTER (SAMA DENGAN CUSTOMER)
        ====================== */}
        <div className="flex flex-col md:flex-row md:items-end gap-3">
          {/* SEARCH INPUT */}
          <div className="flex-1">
            <Input
              placeholder="Cari berdasarkan no vendor"
              value={vendorNo}
              onChange={(e) => setVendorNo(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && filterVendor()}
            />
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex items-center gap-2">
            {/* SEARCH */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    onClick={filterVendor}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Cari Vendor</TooltipContent>
              </Tooltip>
            </TooltipProvider>

    {/* FILTER */}
    <Popover>
      <PopoverTrigger asChild>
<TooltipProvider>
  <Tooltip>
    <Popover>
      <PopoverTrigger asChild>
        <TooltipTrigger asChild>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
      </PopoverTrigger>

      <PopoverContent className="w-80 space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Nama Customer</label>
          <Input
            placeholder="Cari nama customer"
            value={vendorName}
            onChange={(e) => setVendorName(e.target.value)}
          />
        </div>
      </PopoverContent>
    </Popover>

    <TooltipContent>Filter Tambahan</TooltipContent>
  </Tooltip>
</TooltipProvider>

      </PopoverTrigger>
<PopoverContent className="w-80 space-y-4">
  <div className="space-y-2">
    <label className="text-sm font-medium">Nama Customer</label>
    <Input
      placeholder="Cari nama customer"
      value={vendorName}
      onChange={(e) => setVendorName(e.target.value)}
    />
  </div>

  {/* ACTION */}
  <div className="flex justify-end gap-2 pt-2">
    <Button
      variant="outline"
      size="sm"
      onClick={() => {
        setVendorName("");
        setFilteredVendors(vendors);
        setCurrentPage(1);
      }}
    >
      Reset
    </Button>

    <Button
      size="sm"
      onClick={() => {
        filterVendor();
      }}
    >
      Terapkan
    </Button>
  </div>
</PopoverContent>

    </Popover>

            {/* RESET */}
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
        </div>

        {/* =====================
            TABLE
        ====================== */}
      <QuickTable
  data={tableVendors}
  columns={columns}
  page={currentPage}
/>

      </div>
    </SectionBody>

    <SectionFooter>
      <MyPagination
        data={filteredVendors}
        currentPage={currentPage}
        triggerNext={() => setCurrentPage((p) => p + 1)}
        triggerPrevious={() => setCurrentPage((p) => p - 1)}
        triggerPageChange={(page) => setCurrentPage(page)}
      />
    </SectionFooter>
  </SectionContainer>
);

}