import SectionContainer, {
  SectionHeader,
  SectionBody,
  SectionFooter,
} from "@/components/content-container";
import CreatePRForm from "@/components/form/create-pr";
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
import { getCurrentUser } from "@/services/auth";
import { getPr } from "@/services/purchase-request";
import type { PurchaseRequest, UserComplete } from "@/types";
import { PagingSize } from "@/types/enum";
import { ClipboardPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Search, Filter, X, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Clock, CheckCircle } from "lucide-react";
import { prCache } from "@/services/pr-cache";

import { FileSpreadsheet } from "lucide-react";
import { downloadPrExcel } from "@/services/purchase-request";

// Fungsi untuk format tanggal ke bahasa Indonesia
function formatTanggalIndonesia(tanggal: string | Date): string {
  const bulanIndonesia = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  const date = typeof tanggal === 'string' ? new Date(tanggal) : tanggal;
  
  const hari = date.getDate();
  const bulan = bulanIndonesia[date.getMonth()];
  const tahun = date.getFullYear();

  return `${hari} ${bulan} ${tahun}`;
}

export default function PurchaseRequest() {
  const [refresh, setRefresh] = useState<boolean>(false);
  const [user, setUser] = useState<UserComplete | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
const [prs, setPrs] = useState<PurchaseRequest[]>(prCache.data ?? []);
const [filteredPrs, setFilteredPrs] = useState<PurchaseRequest[]>(prCache.data ?? []);
const [prToShow, setPrToShow] = useState<PurchaseRequest[]>(
  prCache.data ? prCache.data.slice(0, PagingSize) : []
);

  // --- State untuk Filtering ---
  const [kode, setKode] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [lokasi, setLokasi] = useState<string>("");
  const [pic, setPic] = useState<string>("");
  const [partNumber, setPartNumber] = useState<string>(""); // Filter tambahan

  useEffect(() => {
    async function fetchUser() {
      const user = await getCurrentUser();
      setUser(user);
    }
    fetchUser();
  }, []);

useEffect(() => {
  async function fetchAllPRs() {
    try {
      const prResult = await getPr();
      if (prResult) {
        prCache.data = prResult; // ⬅️ SIMPAN CACHE
        setPrs(prResult);
      }
    } catch (error) {
      toast.error(
        `Gagal mengambil data PR: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  fetchAllPRs(); // background
}, [refresh]);


  // --- useEffect untuk Filtering Otomatis ---
  useEffect(() => {
    let filtered = prs;

    if (kode) {
      filtered = filtered.filter((pr) =>
        pr.pr_kode.toLowerCase().includes(kode.toLowerCase())
      );
    }
    if (status) {
      filtered = filtered.filter((pr) => pr.pr_status === status);
    }
    if (lokasi) {
      filtered = filtered.filter((pr) =>
        pr.pr_lokasi.toLowerCase().includes(lokasi.toLowerCase())
      );
    }
    if (pic) {
      filtered = filtered.filter((pr) =>
        pr.pr_pic.toLowerCase().includes(pic.toLowerCase())
      );
    }
    // Filter berdasarkan part number di dalam order_item
    if (partNumber) {
      filtered = filtered.filter(
        (pr) =>
          Array.isArray(pr.details) &&
          pr.details.some((item) =>
            item.dtl_pr_part_number
              ?.toLowerCase()
              .includes(partNumber.toLowerCase())
          )
      );
    }

    setFilteredPrs(filtered);
    setCurrentPage(1); // Reset ke halaman pertama setiap kali filter berubah
  }, [prs, kode, status, lokasi, pic, partNumber]); // <-- Semua state filter jadi dependensi

  // --- useEffect untuk Mengatur Paginasi ---
  useEffect(() => {
     if (!Array.isArray(filteredPrs) || filteredPrs.length === 0) {
    setPrToShow([]);
    return;
  }
    const startIndex = (currentPage - 1) * PagingSize;
    const endIndex = startIndex + PagingSize;
    setPrToShow(filteredPrs.slice(startIndex, endIndex));
  }, [filteredPrs, currentPage]);

function renderPrStatus(status: string) {
  const value = status?.toLowerCase();

  switch (value) {
    case "open":
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 bg-red-100 text-red-700">
          <Clock className="h-3 w-3" />
          OPEN
        </span>
      );

    case "closed":
    case "close":
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 bg-green-100 text-green-700">
          <CheckCircle className="h-3 w-3" />
          CLOSED
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
  function resetFilters() {
    setKode("");
    setStatus("");
    setLokasi("");
    setPic("");
    setPartNumber("");
    toast.success("Filter telah direset.");
  }

  // Fungsi paginasi tidak perlu diubah
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
      {/* Data PR */}
      <SectionContainer span={12}>
        <SectionHeader>Daftar Purchase Request</SectionHeader>
        <SectionBody className="grid grid-cols-12 gap-2">
                  <div className="flex flex-col gap-4 col-span-12">
<div className="col-span-12 flex items-end gap-3">

  <div className="flex-1">
    <Input
      placeholder="Cari berdasarkan kode PR"
      value={kode}
      onChange={(e) => setKode(e.target.value)}

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
        <TooltipContent>Cari PR</TooltipContent>
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

        {/* PART NUMBER */}
        <div className="space-y-2">
          <Label>Nomor Part</Label>
          <Input
            placeholder="Cari nomor part "
            value={partNumber}
            onChange={(e) => setPartNumber(e.target.value)}
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
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* LOKASI */}
        <div className="space-y-2">
          <Label>Lokasi</Label>
          <Input
            placeholder="Lokasi"
            value={lokasi}
            onChange={(e) => setLokasi(e.target.value)}
          />
        </div>

        {/* PIC */}
        <div className="space-y-2">
          <Label>PIC</Label>
          <Input
            placeholder="PIC"
            value={pic}
            onChange={(e) => setPic(e.target.value)}
          />
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
        onClick={downloadPrExcel}
      >
        <FileSpreadsheet className="h-4 w-4 text-green-600" />
      </Button>
    </TooltipTrigger>
    <TooltipContent>Download Excel PR</TooltipContent>
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
                  <TableHead className="p-2 border">Tanggal</TableHead>
                  <TableHead className="p-2 border">Kode</TableHead>
                  <TableHead className="p-2 border">Status</TableHead>
                  <TableHead className="p-2 border">Lokasi</TableHead>
                  <TableHead className="p-2 border">PIC</TableHead>
                  <TableHead className="p-2 border">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prToShow.length > 0 ? (
                  prToShow.map((pr, index) => (
                    <TableRow key={`${pr.pr_id}-${pr.pr_kode}`}>
                      <TableCell className="p-2 border">
                        {PagingSize * (currentPage - 1) + (index + 1)}
                      </TableCell>
                      <TableCell className="p-2 border">
                        {formatTanggalIndonesia(pr.pr_tanggal)}
                      </TableCell>
                      <TableCell className="p-2 border">{pr.pr_kode}</TableCell>
                      <TableCell className="p-2 border text-center">
  {renderPrStatus(pr.pr_status)}
</TableCell>

                      <TableCell className="p-2 border">{pr.pr_lokasi}</TableCell>
                      <TableCell className="p-2 border">{pr.pr_pic}</TableCell>
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
  to={`/pr/kode/${encodeURIComponent(pr.pr_kode)}`}
  state={{ pr }}
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
                      Tidak ada Purchase Request ditemukan.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </SectionBody>

        <SectionFooter>
          <MyPagination
            data={filteredPrs}
            triggerNext={nextPage}
            triggerPageChange={pageChange}
            triggerPrevious={previousPage}
            currentPage={currentPage}
          />
        </SectionFooter>
      </SectionContainer>

      {/* Tambah (tidak ada perubahan) */}
      {(user?.role === "warehouse" || user?.role === "superadmin")&& (
        <SectionContainer span={12}>
          <SectionHeader>Tambah PR Baru</SectionHeader>
          <SectionBody>
            <div className="col-span-12 border border-border rounded-sm p-2 text-center">
              <CreatePRForm setRefresh={setRefresh} user={user} />
            </div>
          </SectionBody>
         <SectionFooter>
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="submit"
          form="create-pr-form"
          className="w-full !bg-green-600 hover:!bg-green-700 !text-white"
        >
          <ClipboardPlus className="h-4 w-4" />
          <span>Tambah PR</span>
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