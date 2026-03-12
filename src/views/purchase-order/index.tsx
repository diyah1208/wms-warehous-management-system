import SectionContainer, {
  SectionHeader,
  SectionBody,
  SectionFooter,
} from "@/components/content-container";
import CreatePOForm from "@/components/form/create-po";
import WithSidebar from "@/components/layout/WithSidebar";
import { MyPagination } from "@/components/my-pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatTanggal } from "@/lib/utils";
import { getCurrentUser } from "@/services/auth";
import { getPo } from "@/services/purchase-order";
import type { POHeader, UserComplete } from "@/types";
import { PagingSize } from "@/types/enum";
import { ClipboardPlus } from "lucide-react";
import { useEffect, useState, Component } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Search, Filter, X, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Clock, ShoppingCart, CheckCircle } from "lucide-react";
import { poCache } from "@/services/po-cache";
import { userAuthCache } from "@/services/user-auth-cache";
import { FileSpreadsheet } from "lucide-react";
import { downloadPoExcel } from "@/services/purchase-order";



// Error Boundary Component
class ErrorBoundary extends Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 border border-red-300 bg-red-50 rounded-sm">
          <p className="text-red-800 font-semibold mb-2">
            ⚠️ Error loading form
          </p>
          <p className="text-sm text-red-600 mb-2">
            {this.state.error?.message || "Unknown error"}
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Coba Lagi
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function PurchaseOrder() {
  const [refresh, setRefresh] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
const [pos, setPos] = useState<POHeader[]>(poCache.data ?? []);
const [filteredPos, setFilteredPos] = useState<POHeader[]>(poCache.data ?? []);
const [poToShow, setPoToShow] = useState<POHeader[]>(
  poCache.data ? poCache.data.slice(0, PagingSize) : []
);
  // State untuk Filtering
  const [kodePo, setKodePo] = useState<string>("");
  const [kodePr, setKodePr] = useState<string>("");
  const [status, setStatus] = useState<string>("");

const [user, setUser] = useState<UserComplete | null>(
  userAuthCache.data
);

function formatDateLocal(date?: string | null) {
  if (!date) return "-";

  // kalau formatnya YYYY-MM-DD
  if (date.length === 10) {
    const [year, month, day] = date.split("-");
    return `${day}/${month}/${year}`;
  }

  // fallback kalau ada time
  const d = new Date(date);
  if (isNaN(d.getTime())) return "-";

  return d.toLocaleDateString("id-ID");
}
useEffect(() => {
  async function fetchUser() {
    try {
      const userData = await getCurrentUser();
      if (userData) {
        userAuthCache.data = userData; // ⬅️ SIMPAN CACHE
        setUser(userData);
      }
    } catch {
      toast.error("Gagal mengambil data user");
    }
  }

  // ❗ kalau sudah ada cache, UI langsung jalan
  fetchUser();
}, []);

useEffect(() => {
  async function fetchAllPOs() {
    try {
      const poResult = await getPo();
      if (poResult) {
        poCache.data = poResult; // ⬅️ SIMPAN CACHE
        setPos(poResult);
        setFilteredPos(poResult);
      }
    } catch (error) {
      setPos([]);
      setFilteredPos([]);
      toast.error(
        `Gagal mengambil data PO: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  fetchAllPOs(); // background
}, [refresh]);


  useEffect(() => {
    let filtered = pos;

    if (kodePo) {
      filtered = filtered.filter((po) =>
        po.kode.toLowerCase().includes(kodePo.toLowerCase())
      );
    }

    if (kodePr) {
      filtered = filtered.filter((po) =>
        po.kode_pr.toLowerCase().includes(kodePr.toLowerCase())
      );
    }

    if (status) {
      filtered = filtered.filter((po) => po.status === status);
    }

    setFilteredPos(filtered);
    setCurrentPage(1);
  }, [pos, kodePo, kodePr, status]);

  useEffect(() => {
    if (!filteredPos || !Array.isArray(filteredPos)) {
      setPoToShow([]);
      return;
    }

    const startIndex = (currentPage - 1) * PagingSize;
    const endIndex = startIndex + PagingSize;
    setPoToShow(filteredPos.slice(startIndex, endIndex));
  }, [filteredPos, currentPage]);

  function resetFilters() {
    setKodePo("");
    setKodePr("");
    setStatus("");
    toast.success("Filter telah direset.");
  }

  function nextPage() {
    setCurrentPage((prev) => prev + 1);
  }

  function previousPage() {
    setCurrentPage((prev) => (prev > 1 ? prev - 1 : 1));
  }

  function pageChange(page: number) {
    setCurrentPage(page);
  }
function renderPoStatus(status: string) {
  const value = status?.toLowerCase();

  switch (value) {
    case "pending":
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 bg-yellow-100 text-yellow-800">
          <Clock className="h-3 w-3" />
          PENDING
        </span>
      );

    case "purchased":
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 bg-blue-100 text-blue-700">
          <ShoppingCart className="h-3 w-3" />
          PURCHASED
        </span>
      );

    case "received":
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 bg-green-100 text-green-700">
          <CheckCircle className="h-3 w-3" />
          RECEIVED
        </span>
      );

    default:
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
          {status?.toUpperCase()}
        </span>
      );
  }
}

  return (
    <WithSidebar>
      {/* Data PO */}
      <SectionContainer span={12}>
        <SectionHeader>Daftar Purchase Order</SectionHeader>
        <SectionBody className="grid grid-cols-12 gap-2">
          <div className="flex flex-col gap-4 col-span-12">
<div className="col-span-12 flex items-end gap-3">

  <div className="flex-1">
    <Input
      placeholder="Cari berdasarkan kode PO"
      value={kodePo}
      onChange={(e) => setKodePo(e.target.value)}
      onKeyDown={(e) => e.key === "Enter" && resetFilters()}
    />
  </div>

  {/* ACTION BUTTONS */}
  <div className="col-span-12 md:col-span-3 flex items-center gap-2">

    {/* SEARCH */}
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon"
            onClick={resetFilters}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Search className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Cari PO</TooltipContent>
      </Tooltip>
    </TooltipProvider>

    {/* FILTER */}
    <Popover>
      <TooltipProvider>
        <Tooltip>
          <PopoverTrigger asChild>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
          </PopoverTrigger>
          <TooltipContent>Filter Tambahan</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <PopoverContent className="w-80 space-y-4">
        {/* KODE PR */}
        <div className="space-y-2">
          <Label>Kode PR</Label>
          <Input
            placeholder="Pilih PR"
            value={kodePr}
            onChange={(e) => setKodePr(e.target.value)}
          />
        </div>

        {/* STATUS */}
        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="purchased">Purchased</SelectItem>
              <SelectItem value="received">Received</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* ACTION */}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={resetFilters}>
            Reset
          </Button>
          <Button size="sm" onClick={resetFilters}>
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
            onClick={resetFilters}
            className="border-red-300 text-red-600 hover:bg-red-50"
          >
            <X className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Reset Filter</TooltipContent>
      </Tooltip>
    </TooltipProvider>
{/* EXPORT EXCEL */}
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button
        variant="outline"
        size="icon"
        onClick={downloadPoExcel}
      >
        <FileSpreadsheet className="h-4 w-4 text-green-600" />
      </Button>
    </TooltipTrigger>
    <TooltipContent>Download Excel PO</TooltipContent>
  </Tooltip>
</TooltipProvider>

  </div>
</div>
</div>
          <div className="col-span-12 border rounded-sm overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="p-2 border">No</TableHead>
                  <TableHead className="p-2 border">Kode PO</TableHead>
                  <TableHead className="p-2 border">Kode PR</TableHead>
                  <TableHead className="p-2 border">Tanggal PO</TableHead>
                  <TableHead className="p-2 border">Tanggal Estimasi</TableHead>
                  <TableHead className="p-2 border">Status</TableHead>
                  <TableHead className="p-2 border">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {poToShow.length > 0 ? (
                  poToShow.map((po, index) => (
                    <TableRow key={po.id}>
                      <TableCell className="p-2 border">
                        {PagingSize * (currentPage - 1) + (index + 1)}
                      </TableCell>
                      <TableCell className="p-2 border">{po.kode}</TableCell>
                      <TableCell className="p-2 border">
                        {po.kode_pr || '-'}
                      </TableCell>
                      <TableCell className="p-2 border">
                        {formatDateLocal(po.tanggal)}
                      </TableCell>
                      <TableCell className="p-2 border">
                        {formatDateLocal(po.tanggal_estimasi)}
                      </TableCell>
                   <TableCell className="p-2 border text-center">
  {renderPoStatus(po.status)}
</TableCell>

                      <TableCell className="p-2 border">
                      <TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button
        size="icon"
        variant="outline"
        className="border-sky-400 text-sky-600 hover:bg-sky-50"
        asChild
      >
      <Link
  to={`/po/kode/${encodeURIComponent(po.kode)}`}
  state={{ po }}
>

          <Info className="h-4 w-4" />
        </Link>
      </Button>
    </TooltipTrigger>
  </Tooltip>
</TooltipProvider>

                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="p-4 text-center text-muted-foreground"
                    >
                      Tidak ada Purchase Order ditemukan.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </SectionBody>

        <SectionFooter>
          <MyPagination
            data={filteredPos}
            triggerNext={nextPage}
            triggerPageChange={pageChange}
            triggerPrevious={previousPage}
            currentPage={currentPage}
          />
        </SectionFooter>
      </SectionContainer>
            {/* Tambah PO - DENGAN ERROR HANDLING */}
   {user?.role === "purchasing" || user?.role === "superadmin" && (
  <SectionContainer span={12}>
    <SectionHeader>Tambah PO Baru</SectionHeader>
    <SectionBody className="grid grid-cols-12 gap-2">
      <div className="col-span-12 border border-border rounded-sm p-2">
        <ErrorBoundary>
          <CreatePOForm setRefresh={setRefresh} user={user} />
        </ErrorBoundary>
      </div>
    </SectionBody>
    <SectionFooter>
      <Button
        type="submit"
        form="create-po-form"
        className="w-full !bg-green-600 hover:!bg-green-700 !text-white"
      >
        <ClipboardPlus className="h-4 w-4" />
        <span>Tambah PO</span>
      </Button>
    </SectionFooter>
  </SectionContainer>
)}

    </WithSidebar>
  );
}