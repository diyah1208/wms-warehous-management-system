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
  getMasterCustomers,
  toggleMasterCustomerStatus,
} from "@/services/customer";
import type { MasterCustomer } from "@/types";
import { PagingSize } from "@/types/enum";
import { Filter, Search, X, UserX, UserCheck, ClipboardPlus } from "lucide-react";
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { toast } from "sonner";
import CreateCustomerForm from "@/components/form/create-customer";
import { EditCustomerDialog } from "@/components/dialog/edit-customer";
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
import { useMemo } from "react";

// import { customerCache } from "@/services/customer-cache";
import { useAuth } from "@/context/AuthContext";

export default function MasterCustomerPage() {
  // const [customers, setCustomers] = useState<MasterCustomer[]>(
  //   customerCache.data ?? [] // ⬅️ LANGSUNG ISI
  // );
  const [customers, setCustomers] = useState<MasterCustomer[]>([]);
  const [refresh, setRefresh] = useState(false);
  const {user} = useAuth();

  useEffect(() => {
    async function fetchCustomers() {
      try {
        const res = await getMasterCustomers();
        if (res) {
          //customerCache.data = res; // ⬅️ SIMPAN CACHE
          setCustomers(res);
        }
      } catch {
        toast.error("Gagal mengambil data customer");
      }
    }

    fetchCustomers(); // background
  }, [refresh]);


  return (
    <WithSidebar>
      {/* =======================
          DATA MASTER CUSTOMER
      ======================== */}
    <DataMasterCustomerSection
  customers={customers}
  setRefresh={setRefresh}
  setCustomers={setCustomers}
/>

      {/* =======================
          TAMBAH CUSTOMER
      ======================== */}
      {user?.role === "purchasing" && (
      <SectionContainer span={12}>
        <SectionHeader>Tambah Customer</SectionHeader>
        <SectionBody className="grid grid-cols-12 gap-2">
          <div className="col-span-12 rounded-sm">
            <CreateCustomerForm setRefresh={setRefresh} />
          </div>
</SectionBody>

<SectionFooter>
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button 
          type="submit"
          form="create-customer-form"
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
function CustomerColumnsGenerator(
  setRefresh: Dispatch<SetStateAction<boolean>>,
  setCustomers: Dispatch<SetStateAction<MasterCustomer[]>>
) {
  return [
    {
      header: "No Customer",
      accessorKey: "customer_no",
    },
    {
      header: "Nama Customer",
      accessorKey: "customer_name",
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
  cell: (_: any, row: MasterCustomer) => {
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

{
  header: "Aksi",
  accessorKey: "aksi",
  cell: (_: any, row: MasterCustomer) => (
    <div className="flex gap-2">

      {/* =====================
          EDIT — hanya muncul kalau AKTIF
      ====================== */}
      {row.is_active ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <EditCustomerDialog customer={row} refresh={setRefresh} />
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
              <AlertDialogTitle>Nonaktifkan Customer?</AlertDialogTitle>
              <AlertDialogDescription>
                Customer <b>{row.customer_name}</b> akan dinonaktifkan dan
                tidak bisa digunakan untuk transaksi.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={async () => {
                  try {
                    await toggleMasterCustomerStatus(row.customer_id!);
                    setCustomers(prev =>
                      prev.map(c =>
                        c.customer_id === row.customer_id
                          ? { ...c, is_active: !c.is_active }
                          : c
                      )
                    );
                    toast.success("Customer berhasil dinonaktifkan");
                  } catch {
                    toast.error("Gagal menonaktifkan customer");
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
              <AlertDialogTitle>Aktifkan Customer?</AlertDialogTitle>
              <AlertDialogDescription>
                Customer <b>{row.customer_name}</b> akan diaktifkan kembali.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction
                className="!bg-green-600 hover:!bg-green-700 text-white"
                onClick={async () => {
                  try {
                    await toggleMasterCustomerStatus(row.customer_id!);
                    setCustomers(prev =>
                      prev.map(c =>
                        c.customer_id === row.customer_id
                          ? { ...c, is_active: !c.is_active }
                          : c
                      )
                    );
                    toast.success("Customer berhasil diaktifkan kembali");
                  } catch {
                    toast.error("Gagal mengaktifkan customer");
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
function DataMasterCustomerSection({
  customers,
  setCustomers, // ✅ FIX
  setRefresh,
}: {
  customers: MasterCustomer[];
  setCustomers: Dispatch<SetStateAction<MasterCustomer[]>>; // ✅ FIX
  setRefresh: Dispatch<SetStateAction<boolean>>;
}) {

  const [filteredCustomers, setFilteredCustomers] =
    useState<MasterCustomer[]>([]);
  const [tableCustomers, setTableCustomers] =
    useState<MasterCustomer[]>([]);

  const pageSize = PagingSize;
  const [currentPage, setCurrentPage] = useState<number>(1);
const columns = useMemo(
  () => CustomerColumnsGenerator(setRefresh,setCustomers),
  [setRefresh,setCustomers]
);
  // filter state
  const [customerNo, setCustomerNo] = useState("");
  const [customerName, setCustomerName] = useState("");
useEffect(() => {
 // if (customers.length === 0) return;

  setFilteredCustomers(customers);
  setTableCustomers(customers.slice(0, pageSize));
  setCurrentPage(1);
}, [customers]);


  useEffect(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    setTableCustomers(filteredCustomers.slice(start, end));
  }, [currentPage, filteredCustomers]);

  function filterCustomer() {
    let filtered = customers;

    if (customerNo) {
      filtered = filtered.filter((c) =>
        c.customer_no.toLowerCase().includes(customerNo.toLowerCase())
      );
    }

    if (customerName) {
      filtered = filtered.filter((c) =>
        c.customer_name.toLowerCase().includes(customerName.toLowerCase())
      );
    }

    setFilteredCustomers(filtered);
    setCurrentPage(1);
  }

  function resetFilter() {
    setCustomerNo("");
    setCustomerName("");
    setFilteredCustomers(customers);
    setCurrentPage(1);
  }

  return (
    <SectionContainer span={12}>
      <SectionHeader>Daftar Customer</SectionHeader>
      <SectionBody className="grid grid-cols-12 gap-2">
        <div className="flex flex-col gap-4 col-span-12">
{/* FILTER */}
<div className="flex flex-col md:flex-row md:items-end gap-3">
  {/* INPUT SEARCH */}
  <div className="flex-1">
    <Input
      placeholder="Cari berdasarkan no customer"
      value={customerNo}
      onChange={(e) => setCustomerNo(e.target.value)}
      onKeyDown={(e) => e.key === "Enter" && filterCustomer()}
    />
  </div>

  {/* BUTTON GROUP */}
  <div className="flex items-center gap-2">
    {/* SEARCH */}
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon"
            onClick={filterCustomer}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Search className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Cari Customer</TooltipContent>
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
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
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
      value={customerName}
      onChange={(e) => setCustomerName(e.target.value)}
    />
  </div>

  {/* ACTION */}
  <div className="flex justify-end gap-2 pt-2">
    <Button
      variant="outline"
      size="sm"
      onClick={() => {
        setCustomerName("");
        setFilteredCustomers(customers);
        setCurrentPage(1);
      }}
    >
      Reset
    </Button>

    <Button
      size="sm"
      onClick={() => {
        filterCustomer();
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


<QuickTable
  data={tableCustomers}
  columns={columns}
  page={currentPage}
/>

        </div>
      </SectionBody>

    <SectionFooter>
<MyPagination
  data={filteredCustomers}
  currentPage={currentPage}
  triggerNext={() => setCurrentPage((p) => p + 1)}
  triggerPrevious={() => setCurrentPage((p) => p - 1)}
  triggerPageChange={(page) => setCurrentPage(page)}
/>

</SectionFooter>

    </SectionContainer>
  );
}