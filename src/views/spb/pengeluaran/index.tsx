import SectionContainer, {
  SectionHeader,
  SectionBody,
  SectionFooter,
} from "@/components/content-container";
import { useAuth } from "@/context/AuthContext";
import WithSidebar from "@/components/layout/WithSidebar";
import { Button } from "@/components/ui/button";
import type {Spb } from "@/types";
import { ClipboardPlus, FileSpreadsheet, Filter, Info, Search, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Link } from "react-router-dom";
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
import CreateSpbForm from "@/components/form/create-spb";
import { deleteSpb, downloadSpbExcel, getAllSpb } from "@/services/spb";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { EditSpbDialog } from "@/components/dialog/edit-spb";


export default function SpbPage() {
  const {user} = useAuth()
  const [mrs, setMrs] = useState<Spb[]>([]);
  const [spb2, setSpb] = useState<Spb| null>(null);
  const [filteredMrs, setFilteredMrs] = useState<Spb[]>([]);
  const [mrToShow, setMrToShow] = useState<Spb[]>([]);
  const [refresh, setRefresh] = useState<boolean>(false);

  // Filtering
  const [tanggalMr, setTanggalMr] = useState<Date>();
  const [pic, setPic] = useState<string>("");
  const [kode, setKode] = useState<string>("");
  const [lokasi, setLokasi] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [, setDariTanggal] = useState<Date>();
  const [, setSampaiTanggal] = useState<Date>();
  const [currentPage, setCurrentPage] = useState<number>(1);

  useEffect(() => {
    async function fetchUserDataAndMRs() {
      try {
        const mrResult = await getAllSpb();
        setMrs(mrResult);
        setFilteredMrs(mrResult);
        setMrToShow(mrResult.slice(0, PagingSize));
      } catch (error) {
        if (error instanceof Error) {
          toast.error(`Gagal mengambil data: ${error.message}`);
        } else {
          toast.error("Gagal mengambil data MR.");
        }
      }
    }

    fetchUserDataAndMRs();
  }, [refresh]);


  // function filterMrs() {
  //   let filtered = mrs;

  //   if (tanggalMr) {
  //     filtered = filtered.filter(
  //       (mr) =>
  //         new Date(mr.spb_tanggal).toDateString() === tanggalMr.toDateString()
  //     );
  //   }
  //   if (lokasi) {
  //     filtered = filtered.filter((mr) =>
  //       mr.spb_gudang?.toLowerCase().includes(lokasi.toLowerCase())
  //     );
  //   }
  //   if (pic) {
  //     filtered = filtered.filter((mr) =>
  //       mr.spb_pic_gmi?.toLowerCase().includes(pic.toLowerCase())
  //     );
  //   }
  //   if (status) {
  //     filtered = filtered.filter((mr) =>
  //       mr.spb_status?.toLowerCase().includes(status.toLowerCase())
  //     );
  //   }

  //   if (kode) {
  //     filtered = filtered.filter((mr) =>
  //       mr.spb_no.toLowerCase().includes(kode.toLowerCase())
  //     );
  //   }
  //   setFilteredMrs(filtered);
  //   setCurrentPage(1); // Reset to first page after filtering
  //   setMrToShow(filtered.slice(0, PagingSize));
  //   if (filtered.length === 0) {
  //     toast.info("Tidak ada Material Request yang sesuai dengan filter.");
  //   } else {
  //     toast.success("Filter berhasil diterapkan.");
  //   }
  // }

  function resetFilters() {
    setTanggalMr(undefined);
    setPic("");
    setKode("");
    setLokasi("");
    setStatus("");
    setDariTanggal(undefined);
    setSampaiTanggal(undefined);
    setFilteredMrs(mrs);
    setCurrentPage(1);
    setMrToShow(mrs.slice(0, PagingSize));
    toast.success("Filter telah direset.");
  }
  useEffect(() => {
  let filtered = mrs;

  // if (tanggalMr) {
  //   filtered = filtered.filter(
  //     (mr) =>
  //       new Date(mr.spb_tanggal).toDateString() ===
  //       tanggalMr.toDateString()
  //   );
  // }
  if (tanggalMr) {
  filtered = filtered.filter(
    (mr) =>
      new Date(mr.spb_tanggal).toDateString() ===
      tanggalMr.toDateString()
  );
}

  if (lokasi) {
    filtered = filtered.filter((mr) =>
      mr.spb_gudang?.toLowerCase().includes(lokasi.toLowerCase())
    );
  }

  if (pic) {
    filtered = filtered.filter((mr) =>
      mr.spb_pic_gmi?.toLowerCase().includes(pic.toLowerCase())
    );
  }

  if (status) {
    filtered = filtered.filter((mr) =>
      mr.spb_status?.toLowerCase().includes(status.toLowerCase())
    );
  }

  if (kode) {
    filtered = filtered.filter((mr) =>
      mr.spb_no?.toLowerCase().includes(kode.toLowerCase())
    );
  }

  setFilteredMrs(filtered);
  setCurrentPage(1);
}, [tanggalMr, lokasi, pic, status, kode, mrs]);

  useEffect(() => {
    setMrToShow(
      filteredMrs.slice(
        (currentPage - 1) * PagingSize,
        currentPage * PagingSize
      )
    );
  }, [currentPage,filteredMrs]);

  function nextPage() {
    setCurrentPage((prev) => prev + 1);
  }

  function previousPage() {
    setCurrentPage((prev) => (prev > 1 ? prev - 1 : 1));
  }

  function pageChange(page: number) {
    setCurrentPage(page);
  }

  const handleDelete = async (id: number) => {
  if (!confirm("Yakin hapus SPB? Stok akan dikembalikan.")) return;

  try {
    await deleteSpb(id);
    toast.success("SPB berhasil dihapus");
    setRefresh((prev) => !prev); // trigger reload data
  } catch (err: any) {
    toast.error(err.response?.data?.message || "Gagal hapus SPB");
  }
};
  return (
    <WithSidebar>
      {/* Data MR */}
      <SectionContainer span={12}>
        <SectionHeader>Daftar Surat Pengeluaran Barang ( SPB )</SectionHeader>
        <SectionBody className="grid grid-cols-12 gap-2">
  {/* ================= FILTER BAR ================= */}
  <div className="col-span-12 flex flex-wrap items-center gap-2">

    {/* SEARCH */}
    <div className="relative flex-1 min-w-[260px]">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder="Cari berdasarkan No SPB"
        value={kode}
        onChange={(e) => {
          setKode(e.target.value);
          setCurrentPage(1);
        }}
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
          <h4 className="font-medium">Filter Tambahan</h4>
          <p className="text-sm text-muted-foreground">
            Saring data SPB
          </p>
        </div>

        <div className="grid gap-3">
          <div className="grid gap-1">
            <Label>Tanggal SPB</Label>
            <DatePicker value={tanggalMr} onChange={setTanggalMr} />
          </div>

          <div className="grid gap-1">
            <Label>Lokasi Gudang</Label>
            <Input
              placeholder="Gudang"
              value={lokasi}
              onChange={(e) => setLokasi(e.target.value)}
            />
          </div>

          <div className="grid gap-1">
            <Label>PIC GMI</Label>
            <Input
              placeholder="PIC"
              value={pic}
              onChange={(e) => setPic(e.target.value)}
            />
          </div>

          <div className="grid gap-1">
            <Label>Status</Label>
            <Input
              placeholder="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
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
    {/* <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            onClick={downloadSpbExcel}
          >
            <FileSpreadsheet className="h-4 w-4 text-green-600" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Export Excel</TooltipContent>
      </Tooltip>
    </TooltipProvider> */}

  </div>

  {/* ================= TABLE ================= */}
  <div className="col-span-12 border rounded-sm overflow-x-auto">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="border p-2">No</TableHead>
          <TableHead className="border p-2">No SPB</TableHead>
          <TableHead className="border p-2">No WO</TableHead>
          <TableHead className="border p-2">Tanggal SPB</TableHead>
          <TableHead className="border p-2">Kode Unit</TableHead>
          <TableHead className="border p-2">Type Unit</TableHead>
          <TableHead className="border p-2">Brand</TableHead>
          <TableHead className="border p-2">HM</TableHead>
          <TableHead className="border p-2">Lokasi</TableHead>
          <TableHead className="border p-2">PIC GMI</TableHead>
          <TableHead className="border p-2">PIC PPA</TableHead>
          <TableHead className="border p-2 text-center">Aksi</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {mrToShow.length > 0 ? (
          mrToShow.map((mr, index) => (
            <TableRow key={mr.spb_id}>
              <TableCell className="border p-2">
                {PagingSize * (currentPage - 1) + (index + 1)}
              </TableCell>
              <TableCell className="border p-2">{mr.spb_no}</TableCell>
              <TableCell className="border p-2">{mr.spb_no_wo}</TableCell>
              <TableCell className="border p-2">
                {formatTanggal(mr.spb_tanggal)}
              </TableCell>
              <TableCell className="border p-2">{mr.spb_kode_unit}</TableCell>
              <TableCell className="border p-2">{mr.spb_tipe_unit}</TableCell>
              <TableCell className="border p-2">{mr.spb_brand}</TableCell>
              <TableCell className="border p-2">{mr.spb_hm}</TableCell>
              <TableCell className="border p-2">{mr.spb_gudang}</TableCell>
              <TableCell className="border p-2">{mr.spb_pic_gmi}</TableCell>
              <TableCell className="border p-2">{mr.spb_pic_ppa}</TableCell>
              <TableCell className="border p-2">
              <div className="flex items-center justify-center gap-2">
                <Button 
                size="icon"
                variant="outline"
                className="border-sky-400 text-sky-600 hover:bg-sky-50"
                asChild>
                  <Link to={`/spb/kode/${encodeURIComponent(mr.spb_no)}`}>
                    <Info className="h-4 w-4" />
                  </Link>
                </Button>
                 {user?.role === "superadmin" && (
                  <Button
                    size="icon"
                    variant="outline"
                    className="border-red-400 text-red-600 hover:bg-red-50"
                    onClick={() => handleDelete(mr.spb_id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
                 {user?.role === "warehouse" || user?.role === "superadmin"&&(
                <EditSpbDialog spb={mr} refresh={setRefresh} />
                    )}
            
                </div>
                
            
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell
              colSpan={11}
              className="p-4 text-center text-muted-foreground"
            >
              Tidak ada SPB ditemukan.
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
      {user?.role === "warehouse" || user?.role === "superadmin"&& (
        <SectionContainer span={12}>
          <SectionHeader>Tambah SPB Baru</SectionHeader>
          <SectionBody className="grid grid-cols-12 gap-2">
            <div className="col-span-12 border border-border rounded-sm p-2 text-center">
              <CreateSpbForm user={user} setRefresh={setRefresh} />
            </div>
          </SectionBody>
          <SectionFooter>
            <Button
              className="w-full !bg-green-600 hover:!bg-green-700 !text-white flex items-center justify-center gap-2 h-11"
              type="submit"
              form="create-spb-form"
            >
              Tambah <ClipboardPlus />
            </Button>
          </SectionFooter>
        </SectionContainer>
      )}
    </WithSidebar>
  );
}