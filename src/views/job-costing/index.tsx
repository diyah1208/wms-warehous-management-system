import SectionContainer, {
  SectionHeader,
  SectionBody,
  SectionFooter,
} from "@/components/content-container";
import WithSidebar from "@/components/layout/WithSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Info,
  Search,
  ClipboardPlus,
  Filter,
  X,
  FileSpreadsheet,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { MyPagination } from "@/components/my-pagination";
import { PagingSize } from "@/types/enum";
import { formatTanggal } from "@/lib/utils";
import { getAllJobCosting, downloadJobCostingExcel, updateJobCostingToDone } from "@/services/job-costing";
import type { JobCostingRow } from "@/types";
import { useAuth } from "@/context/AuthContext";
import CreateJobCostingForm from "@/components/form/create-jobcost";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DatePicker } from "@/components/date-picker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useNavigate } from "react-router-dom";

export default function JobCostingIndex() {
  const { user } = useAuth();
const navigate = useNavigate();
  const [refresh, setRefresh] = useState(false);
  const [data, setData] = useState<JobCostingRow[]>([]);
  const [filtered, setFiltered] = useState<JobCostingRow[]>([]);
  const [show, setShow] = useState<JobCostingRow[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  /** FILTER STATE */
  const [batchNo, setBatchNo] = useState("");
  const [tanggal, setTanggal] = useState<Date>();

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await getAllJobCosting();
        setData(res);
        setFiltered(res);
        setShow(res.slice(0, PagingSize));
      } catch {
        toast.error("Gagal mengambil data Job Costing");
      }
    }
    fetchData();
  }, [refresh]);

  /* ================= FILTER ================= */
  function filterData() {
    let result = data;

    if (batchNo) {
      result = result.filter((d) =>
        d.batch_no.toLowerCase().includes(batchNo.toLowerCase())
      );
    }

    if (tanggal) {
      result = result.filter(
        (d) =>
          new Date(d.jc_date).toDateString() === tanggal.toDateString()
      );
    }

    setFiltered(result);
    setCurrentPage(1);
    setShow(result.slice(0, PagingSize));

    if (result.length === 0) toast.info("Data tidak ditemukan");
  }

  function resetFilter() {
    setBatchNo("");
    setTanggal(undefined);
    setFiltered(data);
    setCurrentPage(1);
    setShow(data.slice(0, PagingSize));
  }

  /* ================= PAGINATION ================= */
  useEffect(() => {
    setShow(
      filtered.slice(
        (currentPage - 1) * PagingSize,
        currentPage * PagingSize
      )
    );
  }, [currentPage, filtered]);

  function nextPage() {
    setCurrentPage((p) => p + 1);
  }

  function previousPage() {
    setCurrentPage((p) => (p > 1 ? p - 1 : 1));
  }

  function pageChange(page: number) {
    setCurrentPage(page);
  }

  async function handleDone(id: number) {
    try {
      await updateJobCostingToDone(id, user?.lokasi || "");

      toast.success("Job Costing berhasil diubah ke DONE");
      setRefresh((prev) => !prev);
    } catch (error) {
      toast.error("Gagal mengubah status ke DONE");
    }
  }



  return (
    <WithSidebar>
      {/* ================= LIST ================= */}
      <SectionContainer span={12}>
        <SectionHeader>Daftar Job Costing</SectionHeader>

        <SectionBody className="grid grid-cols-12 gap-2">
          {/* ===== SEARCH + FILTER TOOLBAR ===== */}
          <div className="col-span-12 flex items-end gap-3">
            {/* SEARCH INPUT */}
            <div className="flex-1">
              <Input
                placeholder="Cari Batch No"
                value={batchNo}
                onChange={(e) => setBatchNo(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && filterData()}
              />
            </div>

            {/* SEARCH BTN */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    onClick={filterData}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Cari Job Costing</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* FILTER POPOVER */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-72 space-y-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Tanggal</label>
                  <DatePicker value={tanggal} onChange={setTanggal} />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={resetFilter}>
                    Reset
                  </Button>
                  <Button size="sm" onClick={filterData}>
                    Terapkan
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            {/* RESET BTN */}
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

            {/* EXPORT EXCEL (UI READY) */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
  variant="outline"
  size="icon"
  onClick={downloadJobCostingExcel}
>
  <FileSpreadsheet className="h-4 w-4 text-green-600" />
</Button>

                </TooltipTrigger>
                <TooltipContent>Export Excel</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* ================= TABLE (TIDAK DIUBAH) ================= */}
          <div className="col-span-12 border rounded-sm overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="border p-2">No</TableHead>
                  <TableHead className="border p-2">Batch No</TableHead>
                  <TableHead className="border p-2">Tanggal</TableHead>
                  <TableHead className="border p-2">Finish Part</TableHead>
                  <TableHead className="border p-2">Status</TableHead>
                  <TableHead className="border p-2 text-center">
                    Aksi
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {show.length > 0 &&
                  show.map((jc, index) => (
                    <TableRow key={jc.jc_id}>
                      <TableCell className="border p-2">
                        {PagingSize * (currentPage - 1) + index + 1}
                      </TableCell>

                      <TableCell className="border p-2">
                        {jc.batch_no}
                      </TableCell>

                      <TableCell className="border p-2">
                        {formatTanggal(jc.jc_date)}
                      </TableCell>

                      <TableCell className="border p-2">
                        {jc.finish_part}
                      </TableCell>
                      <TableCell className="border p-2">
                        {jc.jc_status}
                      </TableCell>

                      <TableCell className="border p-2 text-center flex justify-center gap-2">
                      {/* INFO */}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="icon"
                              variant="outline"
                              className="border-sky-400 text-sky-600 hover:bg-sky-50"
                              onClick={() => navigate(`/job-costing/${jc.batch_no}`)}
                            >
                              <Info className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Detail</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      {/* DONE */}
                      {jc.jc_status !== "done" &&
                        user?.lokasi === "JAKARTA" &&
                        user?.role === "warehouse" && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="icon"
                                  variant="outline"
                                  className="border-green-500 text-green-600 hover:bg-green-50"
                                  onClick={() => handleDone(jc.jc_id)}
                                >
                                  ✔
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Mark as Done</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                    </TableCell>
                    </TableRow>
                  ))}

                {show.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="p-4 text-center text-muted-foreground"
                    >
                      Tidak ada data Job Costing.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </SectionBody>

        {/* ================= PAGINATION ================= */}
        <SectionFooter>
          <MyPagination
            data={filtered}
            triggerNext={nextPage}
            triggerPageChange={pageChange}
            triggerPrevious={previousPage}
            currentPage={currentPage}
          />
        </SectionFooter>
      </SectionContainer>

      {/* ================= CREATE ================= */}
      {(user?.role === "warehouse" || user?.role === "superadmin") && user?.lokasi === "JAKARTA" && (
        <SectionContainer span={12}>
          <SectionHeader>Tambah Job Costing</SectionHeader>

          <SectionBody className="grid grid-cols-12 gap-2">
            <div className="col-span-12 border rounded-sm p-2">
              <CreateJobCostingForm
                setRefresh={setRefresh}
                createdBy={user.nama}
                lokasiUser={user.lokasi}
              />
            </div>
          </SectionBody>

          <SectionFooter>
            <Button
              type="submit"
              form="jobcosting-form"
              className="w-full !bg-green-600 hover:!bg-green-700 !text-white "
            >
              <ClipboardPlus className="h-4 w-4" />
              Tambah Job Costing
            </Button>
          </SectionFooter>
        </SectionContainer>
      )}
    </WithSidebar>
  );
}