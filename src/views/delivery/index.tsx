import SectionContainer, {
  SectionHeader,
  SectionBody,
  SectionFooter,
} from "@/components/content-container";
import CreateDeliveryForm from "@/components/form/create-delivery";
import WithSidebar from "@/components/layout/WithSidebar";
import { MyPagination } from "@/components/my-pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"; // <-- Impor
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
} from "@/components/ui/select"; // <-- Impor
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/context/AuthContext";
import { getAllDelivery, downloadDeliveryExcel } from "@/services/delivery";
import type { DeliveryReceive} from "@/types";
import { PagingSize } from "@/types/enum";
import { Plus, FileSpreadsheet, Info, Search, Filter, X, Clock, CheckCircle, Truck, Archive, Package } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DatePicker } from "@/components/date-picker";

export default function DeliveryPage() {
  const [refresh, setRefresh] = useState<boolean>(false);
  const { user } = useAuth();
  const [deliveries, setDeliveries] = useState<DeliveryReceive[]>([]);
  const [filteredDeliveries, setFilteredDeliveries] = useState<DeliveryReceive[]>([]);
  const [deliveriesToShow, setDeliveriesToShow] = useState<DeliveryReceive[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // --- State untuk Filtering ---
  const [kodeIt, setKodeIt] = useState<string>("");
  const [kodeMr, setKodeMr] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [dariGudang, setDariGudang] = useState<string>("");
  const [keGudang, setKeGudang] = useState<string>("");
  const [resi, setResi] = useState<string>("");
  const [tanggal, setTanggal] = useState<Date | undefined>(undefined);
  const filters = {
  kode_it: kodeIt,
  kode_mr: kodeMr,
  status,
  dari_gudang: dariGudang,
  ke_gudang: keGudang,
  resi,
  tanggal: tanggal
    ? tanggal.toISOString().split("T")[0]
    : null,
};



  useEffect(() => {
    async function fetchAllDeliveries() {
      try {
        const deliveryResult = await getAllDelivery();
        setDeliveries(deliveryResult);
      } catch (error) {
        toast.error(
          `Gagal mengambil data Delivery: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    }

    fetchAllDeliveries();
  }, [refresh]);

  // --- useEffect untuk Filtering Otomatis ---
  useEffect(() => {
    let filtered = deliveries;
    
    if (user?.lokasi) {
      const userLokasi = user.lokasi.toLowerCase();

      filtered = filtered.filter((d) => {
        const dari = d.dlv_dari_gudang?.toLowerCase();
        const ke = d.dlv_ke_gudang?.toLowerCase();

        return dari === userLokasi || ke === userLokasi;
      });
    }

    if (kodeIt) {
      filtered = filtered.filter((d) =>
        d.dlv_kode.toLowerCase().includes(kodeIt.toLowerCase())
      );
    }
    if (kodeMr) {
      filtered = filtered.filter((d) =>
        d.mr?.mr_kode?.toLowerCase().includes(kodeMr.toLowerCase())
      );
    }
    if (status) {
      filtered = filtered.filter((d) => d.dlv_status === status);
    }
    if (dariGudang) {
      filtered = filtered.filter((d) =>
        d.dlv_dari_gudang.toLowerCase().includes(dariGudang.toLowerCase())
      );
    }
    if (keGudang) {
      filtered = filtered.filter((d) =>
        d.dlv_ke_gudang.toLowerCase().includes(keGudang.toLowerCase())
      );
    }
    if (resi) {
      filtered = filtered.filter((d) =>
        d.dlv_no_resi.toLowerCase().includes(resi.toLowerCase())
      );
    }

    if (tanggal) {
      filtered = filtered.filter((r) => {
        if (!r.dlv_tanggal && !r.created_at) return false;

        const itemDate = new Date(r.dlv_tanggal ?? r.created_at);

        return (
          itemDate.getFullYear() === tanggal.getFullYear() &&
          itemDate.getMonth() === tanggal.getMonth() &&
          itemDate.getDate() === tanggal.getDate()
        );
      });
    }

    setFilteredDeliveries(filtered);
    setCurrentPage(1);
  }, [deliveries, kodeIt, kodeMr, status, dariGudang, keGudang, resi,tanggal]);

  // --- useEffect untuk Mengatur Paginasi ---
  useEffect(() => {
    const startIndex = (currentPage - 1) * PagingSize;
    const endIndex = startIndex + PagingSize;
    setDeliveriesToShow(filteredDeliveries.slice(startIndex, endIndex));
  }, [filteredDeliveries, currentPage]);

  function resetFilters() {
    setKodeIt("");
    setKodeMr("");
    setStatus("");
    setDariGudang("");
    setKeGudang("");
    setResi("");
    toast.success("Filter telah direset.");
  }
  function StatusBadge({ status }: { status: string }) {
    const map: Record<
      string,
      {
        label: string;
        className: string;
        icon: React.ElementType;
      }
    > = {
      pending: {
        label: "Pending",
        className: "bg-gray-100 text-gray-700 border-gray-300",
        icon: Clock,
      },
      packing: {
        label: "Packing",
        className: "bg-blue-100 text-blue-700 border-blue-300",
        icon: Package,
      },
      "ready to pickup": {
        label: "Ready to Pickup",
        className: "bg-purple-100 text-purple-700 border-purple-300",
        icon: Archive,
      },
      "on delivery": {
        label: "On Delivery",
        className: "bg-orange-100 text-orange-700 border-orange-300",
        icon: Truck,
      },
      delivered: {
        label: "Delivered",
        className: "bg-green-100 text-green-700 border-green-300",
        icon: CheckCircle,
      },
    };

    const data =
      map[status?.toLowerCase()] ?? {
        label: status,
        className: "bg-gray-100 text-gray-700 border-gray-300",
        icon: Clock,
      };

    const Icon = data.icon;

    return (
      <span
        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${data.className}`}
      >
        <Icon className="h-4 w-4" />
        {data.label}
      </span>
    );
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

  return (
    <WithSidebar>
      {/* Data Delivery */}
      <SectionContainer span={12}>
        <SectionHeader>Daftar Delivery</SectionHeader>
        <SectionBody className="grid grid-cols-12 gap-2">
          {/* FILTER BAR */}
          <div className="col-span-12 flex flex-wrap items-center gap-2">

            {/* SEARCH */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="search-kode-it"
                placeholder="Ketik kode IT untuk memfilter..."
                value={kodeIt}
                onChange={(e) => setKodeIt(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* FILTER POPOVER */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-80 space-y-4">
                <div className="space-y-1">
                  <h4 className="font-medium">Filter Lanjutan</h4>
                  <p className="text-sm text-muted-foreground">
                    Saring data pengiriman.
                  </p>
                </div>

                <div className="grid gap-3">
                  <div className="grid gap-1">
                    <Label htmlFor="filter-kode-mr">Kode MR</Label>
                    <Input
                      id="filter-kode-mr"
                      placeholder="Cari kode MR..."
                      value={kodeMr}
                      onChange={(e) => setKodeMr(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                      <Label>Tanggal</Label>
                      <DatePicker value={tanggal} onChange={setTanggal} />
                    </div>                  

                  <div className="grid gap-1">
                    <Label htmlFor="filter-resi">No. Resi Pengiriman</Label>
                    <Input
                      id="filter-resi"
                      placeholder="Cari no. resi..."
                      value={resi}
                      onChange={(e) => setResi(e.target.value)}
                    />
                  </div>

                  {/* STATUS — TIDAK DIUBAH */}
                  <div className="grid gap-1">
                    <Label htmlFor="filter-status">Status</Label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Pilih Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="ready to pickup">Ready to Pickup</SelectItem>
                        <SelectItem value="on delivery">On Delivery</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-1">
                    <Label htmlFor="filter-dari-gudang">Dari Gudang</Label>
                    <Input
                      id="filter-dari-gudang"
                      placeholder="Cari gudang asal..."
                      value={dariGudang}
                      onChange={(e) => setDariGudang(e.target.value)}
                    />
                  </div>

                  <div className="grid gap-1">
                    <Label htmlFor="filter-ke-gudang">Ke Gudang</Label>
                    <Input
                      id="filter-ke-gudang"
                      placeholder="Cari gudang tujuan..."
                      value={keGudang}
                      onChange={(e) => setKeGudang(e.target.value)}
                    />
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* RESET FILTER */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={resetFilters}
                  >
                    <X className="h-4 w-4 text-red-500" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Hapus Filter</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* EXPORT EXCEL */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => downloadDeliveryExcel(filters)}
                  >
                    <FileSpreadsheet className="h-4 w-4 text-green-600" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Export Excel</TooltipContent>
              </Tooltip>
            </TooltipProvider>

          </div>
          <div className="col-span-12 border rounded-sm overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="p-2 border">No</TableHead>
                  <TableHead className="p-2 border">Kode IT</TableHead>
                  <TableHead className="p-2 border">Kode MR</TableHead>
                  <TableHead className="p-2 border">Dari Gudang</TableHead>
                  <TableHead className="p-2 border">Ke Gudang</TableHead>
                  <TableHead className="p-2 border">Ekspedisi</TableHead>
                  <TableHead className="p-2 border">Jumlah Koli</TableHead>
                  <TableHead className="p-2 border">Status</TableHead>
                  <TableHead className="p-2 border">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deliveriesToShow.length > 0 ? (
                  deliveriesToShow.map((deliv, index) => (
                    <TableRow 
                      key={deliv.dlv_id ?? `${deliv.dlv_kode}-${index}`}>
                      <TableCell className="p-2 border">
                        {PagingSize * (currentPage - 1) + (index + 1)}
                      </TableCell>
                      <TableCell className="p-2 border">
                        {deliv.dlv_kode}
                      </TableCell>
                      <TableCell className="p-2 border">
                        {deliv.mr?.mr_kode}
                      </TableCell>
                      <TableCell className="p-2 border">
                        {deliv.dlv_dari_gudang}
                      </TableCell>
                      <TableCell className="p-2 border">
                        {deliv.dlv_ke_gudang}
                      </TableCell>
                      <TableCell className="p-2 border">
                        {deliv.dlv_ekspedisi}
                      </TableCell>
                      <TableCell className="p-2 border">
                        {deliv.dlv_jumlah_koli}
                      </TableCell>
                      <TableCell className="p-2 border text-center">
                        <StatusBadge status={deliv.dlv_status} />
                      </TableCell>
                      <TableCell className="p-2 border">
                        <Button
                          size="icon"
                          variant="outline"
                          className="border-sky-400 text-sky-600 hover:bg-sky-50"
                          asChild
                        >
                          <Link
                            to={`/deliveries/kode/${encodeURIComponent(
                              deliv.dlv_kode
                            )}`}
                          >
                            <Info className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="p-4 text-center text-muted-foreground"
                    >
                      Tidak ada data pengiriman ditemukan.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </SectionBody>
        <SectionFooter>
          <MyPagination
            data={filteredDeliveries}
            triggerNext={nextPage}
            triggerPageChange={pageChange}
            triggerPrevious={previousPage}
            currentPage={currentPage}
          />
        </SectionFooter>
      </SectionContainer>

      {/* Tambah */}
      {user?.role === "warehouse" || user?.role === "purchasing" ? (
        <SectionContainer span={12}>
          <SectionHeader>Tambah Delivery Baru</SectionHeader>
          <SectionBody>
            <div className="col-span-12 border border-border rounded-sm p-2 text-center">
              <CreateDeliveryForm setRefresh={setRefresh} user={user} />
            </div>
          </SectionBody>
          <SectionFooter>
            <Button
              className="w-full !bg-green-600 hover:!bg-green-700 !text-white flex items-center justify-center gap-2 h-11"
              type="submit"
              form="create-delivery-form">
              Tambah
              <Plus />
            </Button>
          </SectionFooter>
        </SectionContainer>
      ) : (
        ""
      )}
    </WithSidebar>
  );
}