import SectionContainer, {
  SectionHeader,
  SectionBody,
  SectionFooter,
} from "@/components/content-container";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatTanggal } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { getPurchasedPO, downloadReceiveExcel } from "@/services/receive-item";
import { getAllRi } from "@/services/receive-item";
import type { POReceive, RI } from "@/types";
import { PagingSize } from "@/types/enum";
import { Plus, FileSpreadsheet, Info, Search, Filter, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import CreateRIForm from "@/components/form/create-ri";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DatePicker } from "@/components/date-picker";

export default function ReceiveItem() {
  const {user} = useAuth();
  const [refresh, setRefresh] = useState<boolean>(false);
  const [pos, setPos] = useState<POReceive[]>([]);
  const [filteredPos, setFilteredPos] = useState<POReceive[]>([]);
  const [poToShow, setPoToShow] = useState<POReceive[]>([]);
  const [currentPagePo, setCurrentPagePo] = useState<number>(1);
  const [kodePo, setKodePo] = useState<string>("");
  const [kodePr, setKodePr] = useState<string>("");
  const [statusPo, setStatusPo] = useState<string>("");
  const [ris, setRis] = useState<RI[]>([]);
  const [filteredRis, setFilteredRis] = useState<RI[]>([]);
  const [riToShow, setRiToShow] = useState<RI[]>([]);
  const [currentPageRi, setCurrentPageRi] = useState<number>(1);
  const [kodeRi, setKodeRi] = useState<string>("");
  const [kodePoRi, setKodePoRi] = useState<string>(""); 
  const [gudang, setGudang] = useState<string>("");
  const [picRi, setPicRi] = useState<string>("");
  const [tanggal, setTanggal] = useState<Date | undefined>(undefined);
  const filters = {
  kodeRi,
  kodePoRi,
  gudang,
  picRi,
  tanggal: tanggal
    ? tanggal.toISOString().split("T")[0]
    : null,
};


  useEffect(() => {
    async function fetchInitialData() {
      try {
        const [poResult, riResult] = await Promise.all([
          getPurchasedPO(),
          getAllRi(),
        ]);
        setPos(poResult);
        setRis(riResult);
      } catch (error) {
        toast.error(
          `Gagal mengambil data awal: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    }
    fetchInitialData();
  }, [refresh]);

  useEffect(() => {
    let filtered = pos;
    if (kodePo) {
      filtered = filtered.filter((p) =>
        p.po_kode.toLowerCase().includes(kodePo.toLowerCase())
      );
    }
    if (kodePr) {
      filtered = filtered.filter((p) =>
        p.purchase_request?.pr_kode.toLowerCase().includes(kodePr.toLowerCase())
      );
    }
    if (statusPo) {
      filtered = filtered.filter((p) => p.po_status === statusPo);
    }
    

    setFilteredPos(filtered);
    setCurrentPagePo(1);
  }, [pos, kodePo, kodePr, statusPo]);



  useEffect(() => {
    const startIndex = (currentPagePo - 1) * PagingSize;
    const endIndex = startIndex + PagingSize;
    setPoToShow(filteredPos?.slice(startIndex, endIndex) ?? []);

  }, [filteredPos, currentPagePo]);

  useEffect(() => {
    let filtered = ris;

    if (kodeRi) {
      filtered = filtered.filter((r) =>
        r.ri_kode.toLowerCase().includes(kodeRi.toLowerCase())
      );
    }
    if (kodePoRi) {
      filtered = filtered.filter((r) =>
        r.purchase_order.po_kode.toLowerCase().includes(kodePoRi.toLowerCase())
      );
    }
    if (gudang) {
      filtered = filtered.filter((r) =>
        r.ri_lokasi.toLowerCase().includes(gudang.toLowerCase())
      );
    }
    if (picRi) {
      filtered = filtered.filter((r) =>
        r.ri_pic?.toLowerCase().includes(picRi.toLowerCase())
      );
    }
    
    if (tanggal) {
      filtered = filtered.filter((r) => {
        if (!r.ri_tanggal && !r.created_at) return false;

        const itemDate = new Date(r.ri_tanggal ?? r.created_at);

        return (
          itemDate.getFullYear() === tanggal.getFullYear() &&
          itemDate.getMonth() === tanggal.getMonth() &&
          itemDate.getDate() === tanggal.getDate()
        );
      });
    }

    setFilteredRis(filtered);
    setCurrentPageRi(1);
  }, [ris, kodeRi, kodePoRi, gudang, picRi, tanggal]);

  // --- useEffect untuk paginasi Tabel RI ---
  useEffect(() => {
    const startIndex = (currentPageRi - 1) * PagingSize;
    const endIndex = startIndex + PagingSize;
    setRiToShow(filteredRis.slice(startIndex, endIndex));
  }, [filteredRis, currentPageRi]);

  // --- Fungsi Helper untuk Tabel PO ---
  function resetFiltersPo() {
    setKodePo("");
    setKodePr("");
    setStatusPo("");
    toast.success("Filter PO telah direset.");
  }
  function nextPagePo() {
    setCurrentPagePo((prev) => prev + 1);
  }
  function previousPagePo() {
    setCurrentPagePo((prev) => (prev > 1 ? prev - 1 : 1));
  }
  function pageChangePo(page: number) {
    setCurrentPagePo(page);
  }

  // --- Fungsi Helper untuk Tabel RI ---
  function resetFiltersRi() {
    setKodeRi("");
    setKodePoRi("");
    setGudang("");
    setPicRi("");
    toast.success("Filter RI telah direset.");
  }
  function nextPageRi() {
    setCurrentPageRi((prev) => prev + 1);
  }
  function previousPageRi() {
    setCurrentPageRi((prev) => (prev > 1 ? prev - 1 : 1));
  }
  function pageChangeRi(page: number) {
    setCurrentPageRi(page);
  }

  return (
    <WithSidebar>
      <SectionContainer span={12}>
        <SectionHeader>Daftar PO Purchased (Siap Diterima)</SectionHeader>
        <SectionBody className="grid grid-cols-12 gap-2">
          {/* Filtering PO */}
          <div className="col-span-12 flex items-center gap-2">

            {/* SEARCH */}
            <div className="relative flex-1">
              <Input
                id="search-kode-po"
                placeholder="Cari berdasarkan kode PO"
                value={kodePo}
                onChange={(e) => setKodePo(e.target.value)}
                className="pr-10"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>

            {/* FILTER */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-80 space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Filter PO</h4>
                  <p className="text-sm text-muted-foreground">
                    Searching PO berdasarkan kriteria.
                  </p>
                </div>

                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label>Kode PR</Label>
                    <Input
                      placeholder="Cari kode PR..."
                      value={kodePr}
                      onChange={(e) => setKodePr(e.target.value)}
                    />
                  </div>
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
                    onClick={resetFiltersPo}
                    className="border-red-300 text-red-600 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Hapus Filter</TooltipContent>
              </Tooltip>
            </TooltipProvider>

          </div>
          {/* Tabel PO */}
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
                    <TableRow key={po.po_id}>
                      <TableCell className="p-2 border">
                        {PagingSize * (currentPagePo - 1) + (index + 1)}
                      </TableCell>
                      <TableCell className="p-2 border">{po.po_kode}</TableCell>
                      <TableCell className="p-2 border">{po.purchase_request?.pr_kode ?? "-"}</TableCell>
                      <TableCell className="p-2 border">
                        {formatTanggal(po.created_at)}
                      </TableCell>
                      <TableCell className="p-2 border">
                        {formatTanggal(po.po_estimasi)}
                      </TableCell>
                      <TableCell className="p-2 border">{po.po_status}</TableCell>
                      <TableCell className="p-2 border">
                       <Button
                          size="icon"
                          variant="edit"
                          className="border-sky-400 text-sky-600 hover:bg-sky-50"
                          asChild
                        >
                          <Link
                            to={`/po/kode/${encodeURIComponent(po.po_kode)}`}
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
                      colSpan={7}
                      className="p-4 text-center text-muted-foreground"
                    >
                      Tidak ada PO ditemukan.
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
            triggerNext={nextPagePo}
            triggerPageChange={pageChangePo}
            triggerPrevious={previousPagePo}
            currentPage={currentPagePo}
          />
        </SectionFooter>
      </SectionContainer>
      {user?.role === "warehouse" || user?.role === "superadmin"&& (
      <SectionContainer span={12}>
        <SectionHeader>Buat Receive Item (RI) Baru</SectionHeader>
        <SectionBody>
          <div className="col-span-12 border border-border rounded-sm p-2 text-center">
            {user && <CreateRIForm setRefresh={setRefresh} user={user} />}
          </div>
        </SectionBody>
        <SectionFooter>
          <Button
            className="w-full !bg-green-600 hover:!bg-green-700 !text-white flex items-center justify-center gap-2 h-11"
            type="submit"
            form="create-ri-form"
          >
            Buat RI <Plus />
          </Button>
        </SectionFooter>
      </SectionContainer>
      )}
      {/* ==================== BAGIAN TABEL RI ==================== */}
      <SectionContainer span={12}>
        <SectionHeader>Daftar History Receive Item</SectionHeader>
        <SectionBody className="grid grid-cols-12 gap-2">
          {/* Filtering RI */}
          <div className="col-span-12 flex items-center gap-2">

            {/* SEARCH */}
            <div className="relative flex-1">
              <Input
                id="search-kode-ri"
                placeholder="Cari berdasarkan part number"
                value={kodeRi}
                onChange={(e) => setKodeRi(e.target.value)}
                className="pr-10"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>

            {/* FILTER */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-80 space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">
                    Filter History RI
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Searching histori berdasarkan kriteria.
                  </p>
                </div>

                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label>Kode PO</Label>
                    <Input
                      placeholder="Cari kode PO..."
                      value={kodePoRi}
                      onChange={(e) => setKodePoRi(e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label>Tanggal</Label>
                    <DatePicker value={tanggal} onChange={setTanggal} />
                  </div>

                  <div className="grid gap-2">
                    <Label>Gudang Penerima</Label>
                    <Input
                      placeholder="Cari gudang..."
                      value={gudang}
                      onChange={(e) => setGudang(e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label>PIC</Label>
                    <Input
                      placeholder="Cari PIC..."
                      value={picRi}
                      onChange={(e) => setPicRi(e.target.value)}
                    />
                  </div>
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
                    onClick={resetFiltersRi}
                    className="border-red-300 text-red-600 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Hapus Filter</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* EXPORT */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                     onClick={() => downloadReceiveExcel(filters)}
                  >
                    <FileSpreadsheet className="h-4 w-4 text-green-600" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Export Excel</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          {/* Tabel RI */}
          <div className="col-span-12 border rounded-sm overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="p-2 border">No</TableHead>
                  <TableHead className="p-2 border">Kode RI</TableHead>
                  <TableHead className="p-2 border">Kode PO</TableHead>
                  <TableHead className="p-2 border">Tanggal RI</TableHead>
                  <TableHead className="p-2 border">Gudang Penerima</TableHead>
                  <TableHead className="p-2 border">PIC</TableHead>
                  <TableHead className="p-2 border">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {riToShow.length > 0 ? (
                  riToShow.map((ri, index) => (
                    <TableRow key={ri.ri_id}>
                      <TableCell className="p-2 border">
                        {PagingSize * (currentPageRi - 1) + (index + 1)}
                      </TableCell>
                      <TableCell className="p-2 border">{ri.ri_kode}</TableCell>
                      <TableCell className="p-2 border">{ri.purchase_order.po_kode}</TableCell>
                      <TableCell className="p-2 border">
                        {formatTanggal(ri.created_at)}
                      </TableCell>
                      <TableCell className="p-2 border">
                        {ri.ri_lokasi}
                      </TableCell>
                      <TableCell className="p-2 border">{ri.ri_pic}</TableCell>
                      <TableCell className="p-2 border">
                        <Button
                            size="icon"
                            variant="outline"
                            className="border-sky-400 text-sky-600 hover:bg-sky-50"
                            asChild
                          >
                            <Link
                              to={`/receive/kode/${encodeURIComponent(ri.ri_kode)}`}
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
                      colSpan={7}
                      className="p-4 text-center text-muted-foreground"
                    >
                      Tidak ada RI ditemukan.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </SectionBody>
        <SectionFooter>
          <MyPagination
            data={filteredRis}
            triggerNext={nextPageRi}
            triggerPageChange={pageChangeRi}
            triggerPrevious={previousPageRi}
            currentPage={currentPageRi}
          />
        </SectionFooter>
      </SectionContainer>
    </WithSidebar>
  );
}
