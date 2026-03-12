import SectionContainer, {
  SectionHeader,
  SectionBody,
  SectionFooter,
} from "@/components/content-container";
import { useAuth } from "@/context/AuthContext";
import WithSidebar from "@/components/layout/WithSidebar";
import { Button } from "@/components/ui/button";
import type {MRReceive } from "@/types";
import { AlertTriangle, ClipboardPlus, Filter, Info, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import CreateMRForm from "@/components/form/create-mr";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Link } from "react-router-dom";
import { getAllMr } from "@/services/material-request";
import { MyPagination } from "@/components/my-pagination";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/date-picker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatTanggal } from "@/lib/utils";
import { PagingSize } from "@/types/enum";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CheckCircle, Clock } from "lucide-react";
import { mrCache } from "@/services/mr-cache";
import { FileSpreadsheet } from "lucide-react";
import { downloadMrExcel } from "@/services/material-request";


export default function MaterialRequest() {
  const {user} = useAuth()
  const [refresh, setRefresh] = useState<boolean>(false);
const [mrs, setMrs] = useState<MRReceive[]>(mrCache.data ?? []);
const [filteredMrs, setFilteredMrs] = useState<MRReceive[]>(mrCache.data ?? []);
const [mrToShow, setMrToShow] = useState<MRReceive[]>(
  mrCache.data ? mrCache.data.slice(0, PagingSize) : []
);
const [hasFetched, setHasFetched] = useState<boolean>(
  Boolean(mrCache.data)
);


  // Filtering
  const [tanggalMr, setTanggalMr] = useState<Date>();
  const [pic, setPic] = useState<string>("");
  const [kode, setKode] = useState<string>("");
  const [dueDate, setDueDate] = useState<Date>();
  const [lokasi, setLokasi] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [priority, setPriority] = useState<string>("");
  const [dariTanggal, setDariTanggal] = useState<Date>();
  const [sampaiTanggal, setSampaiTanggal] = useState<Date>();
  const [currentPage, setCurrentPage] = useState<number>(1);

useEffect(() => {
async function fetchMr() {
  try {
    const mrResult = await getAllMr();
    if (mrResult) {
      mrCache.data = mrResult;
      setMrs(mrResult);
      setFilteredMrs(mrResult);
      setMrToShow(mrResult.slice(0, PagingSize));
    }
  } catch (error) {
    toast.error("Gagal mengambil data Material Request");
  } finally {
    setHasFetched(true); // ⬅️ WAJIB
  }
}

  fetchMr(); // background
}, [refresh]);



function renderMrStatus(mr: MRReceive) {
  const status = mr.mr_status?.toLowerCase();

  if (mr.details && mr.details.length > 0) {

    const allProcessed = mr.details.every(
      (d) =>
        Number(d.dtl_mr_approved) === 1 ||
        Number(d.dtl_mr_rejected) === 1
    );

    if (!allProcessed) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 bg-yellow-100 text-yellow-700">
          <Clock className="h-3 w-3" />
          PENDING
        </span>
      );
    }
  }

  if (status === "open") {
    return (
      <span className="px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 bg-red-100 text-red-700">
        <Clock className="h-3 w-3" />
        OPEN
      </span>
    );
  }

  if (status === "partial") {
    return (
      <span className="px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 bg-orange-100 text-orange-700">
        <AlertTriangle className="h-3 w-3" />
        PARTIAL
      </span>
    );
  }

  if (status === "closed" || status === "close") {
    return (
      <span className="px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 bg-green-100 text-green-700">
        <CheckCircle className="h-3 w-3" />
        CLOSED
      </span>
    );
  }

  return (
    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
      {mr.mr_status?.toUpperCase()}
    </span>
  );
}
  function filterMrs() {
    let filtered = mrs;

    if (tanggalMr) {
      filtered = filtered.filter(
        (mr) =>
          new Date(mr.mr_tanggal).toDateString() === tanggalMr.toDateString()
      );
    }
    if (dueDate) {
      filtered = filtered.filter(
        (mr) => new Date(mr.mr_due_date).toDateString() === dueDate.toDateString()
      );
    }
    if (lokasi) {
      filtered = filtered.filter((mr) =>
        mr.mr_lokasi.toLowerCase().includes(lokasi.toLowerCase())
      );
    }
    if (pic) {
      filtered = filtered.filter((mr) =>
        mr.mr_pic.toLowerCase().includes(pic.toLowerCase())
      );
    }
    if (status) {
      filtered = filtered.filter((mr) =>
        mr.mr_status.toLowerCase().includes(status.toLowerCase())
      );
    }

    if (kode) {
      filtered = filtered.filter((mr) =>
        mr.mr_kode.toLowerCase().includes(kode.toLowerCase())
      );
    }
    if (dariTanggal && sampaiTanggal) {
      const dari = new Date(dariTanggal);
      const sampai = new Date(sampaiTanggal);
      filtered = filtered.filter(
        (mr) =>
          new Date(mr.mr_tanggal) >= dari && new Date(mr.mr_tanggal) <= sampai
      );
    }

    setFilteredMrs(filtered);
    setCurrentPage(1); // Reset to first page after filtering
    setMrToShow(filtered.slice(0, PagingSize));
    if (filtered.length === 0) {
      toast.info("Tidak ada Material Request yang sesuai dengan filter.");
    } else {
      toast.success("Filter berhasil diterapkan.");
    }
  }

  function resetFilters() {
    setTanggalMr(undefined);
    setPic("");
    setKode("");
    setDueDate(undefined);
    setLokasi("");
    setStatus("");
    setPriority("");
    setDariTanggal(undefined);
    setSampaiTanggal(undefined);
    setFilteredMrs(mrs);
    setCurrentPage(1);
    setMrToShow(mrs.slice(0, PagingSize));
    toast.success("Filter telah direset.");
  }

useEffect(() => {
  setMrToShow(
    filteredMrs.slice(
      (currentPage - 1) * PagingSize,
      currentPage * PagingSize
    )
  );
}, [currentPage, filteredMrs]);


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
      {/* Data MR */}
      <SectionContainer span={12}>
        <SectionHeader>Daftar Material Request</SectionHeader>
      <SectionBody className="grid grid-cols-12 gap-2">
        <div className="flex flex-col gap-4 col-span-12">
  {/* =====================
      FILTER TOOLBAR MR
  ====================== */}
<div className="col-span-12 flex items-end gap-3">

  {/* INPUT SEARCH – FLEKSIBEL, MENTOK */}
  <div className="flex-1">
      <Input
        placeholder="Cari berdasarkan kode MR"
        value={kode}
        onChange={(e) => setKode(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && filterMrs()}
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
              onClick={filterMrs}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Search className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Cari MR</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* FILTER (STABIL) */}
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

          {/* TANGGAL MR */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Tanggal MR</label>
            <DatePicker value={tanggalMr} onChange={setTanggalMr} />
          </div>

          {/* DUE DATE */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Due Date</label>
            <DatePicker value={dueDate} onChange={setDueDate} />
          </div>

          {/* LOKASI */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Lokasi</label>
            <Input
              placeholder="Lokasi"
              value={lokasi}
              onChange={(e) => setLokasi(e.target.value)}
            />
          </div>

          {/* PIC */}
          <div className="space-y-2">
            <label className="text-sm font-medium">PIC</label>
            <Input
              placeholder="PIC"
              value={pic}
              onChange={(e) => setPic(e.target.value)}
            />
          </div>

          {/* STATUS */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Input
              placeholder="open / partial / closed"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            />
          </div>

          {/* PRIORITY */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Priority</label>
            <Input
              placeholder="1 / 2 / 3 / 4"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            />
          </div>

          {/* ACTION */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={resetFilters}
            >
              Reset
            </Button>
            <Button
              size="sm"
              onClick={filterMrs}
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
        onClick={downloadMrExcel}
      >
        <FileSpreadsheet className="h-4 w-4 text-green-600" />
      </Button>
    </TooltipTrigger>
    <TooltipContent>Export Excel</TooltipContent>
  </Tooltip>
</TooltipProvider>

    </div>
  </div>
  
    </div>

          <div className="col-span-12 border rounded-sm overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="border p-2">No</TableHead>
                  <TableHead className="border p-2">Kode</TableHead>
                  <TableHead className="border p-2">Tanggal MR</TableHead>
                  <TableHead className="border p-2">Due Date</TableHead>
                  <TableHead className="border p-2">Lokasi</TableHead>
                  <TableHead className="border p-2">PIC</TableHead>
                  <TableHead className="border p-2">Status</TableHead>
                  <TableHead className="border p-2">Jumlah Barang</TableHead>
                  <TableHead className="border p-2">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mrToShow.length > 0 &&
                  mrToShow.map((mr, index) => (
                    <TableRow key={mr.mr_id}>
                      <TableCell className="border p-2">
                        {PagingSize * (currentPage - 1) + (index + 1)}
                      </TableCell>
                      <TableCell className="border p-2">{mr.mr_kode}</TableCell>
                      <TableCell className="border p-2">
                        {formatTanggal(mr.mr_tanggal)}
                      </TableCell>
                      <TableCell className="border p-2">
                        {formatTanggal(mr.mr_due_date)}
                      </TableCell>
                      <TableCell className="border p-2">{mr.mr_lokasi}</TableCell>
                      <TableCell className="border p-2">{mr.mr_pic}</TableCell>
<TableCell className="border p-2 text-center">
{renderMrStatus(mr)}
</TableCell>


                      <TableCell className="border p-2">
                        {mr.details?.length || 0}
                      </TableCell>
                      <TableCell className="border p-2">
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
                      to={`/mr/kode/${encodeURIComponent(mr.mr_kode)}`}
                      state={{ mr }}  
                    >

                              <Info className="h-4 w-4" />
                            </Link>
                          </Button>
                        </TooltipTrigger>
                      </Tooltip>
                    </TooltipProvider>

                      </TableCell>
                    </TableRow>
                 ))}
               {hasFetched && mrToShow.length === 0 && (
  <TableRow>
    <TableCell
      colSpan={8}
      className="p-4 text-center text-muted-foreground"
    >
      Tidak ada Material Request ditemukan.
    </TableCell>
  </TableRow>
)}
              </TableBody>
            </Table>
          </div>
        </SectionBody>

        <SectionFooter>
          <MyPagination
            data={filteredMrs}
            triggerNext={nextPage}
            triggerPageChange={(e) => {
              pageChange(e);
            }}
            triggerPrevious={previousPage}
            currentPage={currentPage}
          />
        </SectionFooter>
      </SectionContainer>

      {/* Tambah MR (Hanya untuk role warehouse) */}
      {user?.role === "warehouse" || user?.role === "superadmin" && (
        <SectionContainer span={12}>
          <SectionHeader>Tambah MR Baru</SectionHeader>
          <SectionBody className="grid grid-cols-12 gap-2">
            <div className="col-span-12 border border-border rounded-sm p-2 text-center">
              <CreateMRForm user={user} setRefresh={setRefresh} />
            </div>
          </SectionBody>
         <SectionFooter>
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="submit"
          form="create-mr-form"
          className="w-full !bg-green-600 hover:!bg-green-700 !text-white"
        >
          <ClipboardPlus className="h-4 w-4" />
          <span>Tambah MR</span>
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