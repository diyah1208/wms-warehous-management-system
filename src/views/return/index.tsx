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

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { DatePicker } from "@/components/date-picker";
import { formatTanggal } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

import {
  getAllReturnSpb,
} from "@/services/return";

import type { ReturnSpb } from "@/types";

import { PagingSize } from "@/types/enum";

import {
  Plus,
  Info,
  Search,
  Filter,
  X,
  FileSpreadsheet,
} from "lucide-react";

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import CreateReturnSpbForm from "@/components/form/create-return";

export default function ReturnSpbIndex() {
  const { user } = useAuth();

  const [refresh, setRefresh] = useState(false);

  const [data, setData] = useState<ReturnSpb[]>([]);
  const [filtered, setFiltered] = useState<ReturnSpb[]>([]);
  const [toShow, setToShow] = useState<ReturnSpb[]>([]);

  const [currentPage, setCurrentPage] = useState(1);

  const [kode, setKode] = useState("");
  const [status, setStatus] = useState("");
  const [tanggal, setTanggal] = useState<Date | undefined>(undefined);

  const filters = {
    kode: kode || null,
    status: status || null,
    tanggal: tanggal
      ? tanggal.toISOString().split("T")[0]
      : null,
  };

  useEffect(() => {
    fetchData();
  }, [refresh]);

//   async function fetchData() {
//     try {
//       const res = await getAllReturnSpb();
//       setData(res);
//     } catch {
//       toast.error("Gagal mengambil data return SPB");
//     }
//   }
async function fetchData() {
  try {
    const res = await getAllReturnSpb();

   // console.log("RETURN SPB RESPONSE:", res);

    setData(res); // ← cukup ini saja
  } catch {
    toast.error("Gagal mengambil data return SPB");
    setData([]);
  }
}

  /* ================= FILTER ================= */

  useEffect(() => {
    let f = data;

    if (kode) {
      f = f.filter((d) =>
        d.rtn_kode.toLowerCase().includes(kode.toLowerCase())
      );
    }

    if (status) {
      f = f.filter((d) => d.rtn_status === status);
    }

    if (tanggal) {
      f = f.filter((d) => {
        if (!d.rtn_tanggal) return false;
        const dt = new Date(d.rtn_tanggal);

        return (
          dt.getFullYear() === tanggal.getFullYear() &&
          dt.getMonth() === tanggal.getMonth() &&
          dt.getDate() === tanggal.getDate()
        );
      });
    }

    setFiltered(f);
    setCurrentPage(1);
  }, [data, kode, status, tanggal]);

  /* ================= PAGING ================= */

  useEffect(() => {
    const start = (currentPage - 1) * PagingSize;
    const end = start + PagingSize;
    //setToShow(filtered.slice(start, end));
    setToShow(Array.isArray(filtered) ? filtered.slice(start, end) : []);
  }, [filtered, currentPage]);

  function nextPage() {
    setCurrentPage((p) => p + 1);
  }

  function previousPage() {
    setCurrentPage((p) => (p > 1 ? p - 1 : 1));
  }

  function pageChange(page: number) {
    setCurrentPage(page);
  }

  function resetFilter() {
    setKode("");
    setStatus("");
    setTanggal(undefined);
    toast.success("Filter direset");
  }

  return (
    <WithSidebar>

      {/* ================= CREATE SECTION ================= */}
      <SectionContainer span={12}>
          {user?.role === "superadmin" && (
            <SectionHeader>Buat Return SPB</SectionHeader>
          )}

        <SectionBody>
          {user?.role === "superadmin"  && (
            <CreateReturnSpbForm
              user={user}
              setRefresh={setRefresh}
            />
          )}
        </SectionBody>

        <SectionFooter>
          {user?.role === "superadmin" && (
            <Button
              type="submit"
              form="create-return-spb-form"
              className="w-full !bg-green-600 hover:!bg-green-700 text-white h-11"
            >
              Simpan Return SPB <Plus />
            </Button>
          )}
        </SectionFooter>
      </SectionContainer>

      {/* ================= LIST SECTION ================= */}
      <SectionContainer span={12}>
        <SectionHeader>Daftar Return SPB</SectionHeader>

        <SectionBody className="grid grid-cols-12 gap-2">

          {/* SEARCH */}
          <div className="col-span-12 flex items-center gap-2">

            <div className="relative flex-1">
              <Input
                placeholder="Cari kode return"
                value={kode}
                onChange={(e) => setKode(e.target.value)}
                className="pr-10"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-60" />
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
                  <Label>Status</Label>
                  <Input
                    placeholder="Posted / Returned"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Tanggal</Label>
                  <DatePicker
                    value={tanggal}
                    onChange={setTanggal}
                  />
                </div>
              </PopoverContent>
            </Popover>

            {/* EXPORT */}
            {/* <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      downloadReturnSpbExcel(filters)
                    }
                  >
                    <FileSpreadsheet className="h-4 w-4 text-green-600" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Export Excel</TooltipContent>
              </Tooltip>
            </TooltipProvider> */}

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

          {/* TABLE */}
          <div className="col-span-12 border rounded-sm overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No</TableHead>
                  <TableHead>Kode</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {/* {toShow.length > 0 ? (
                  toShow.map((r, i) => ( */}
                  {Array.isArray(toShow) && toShow.length > 0 ? (
                    toShow.map((r, i) => (
                    <TableRow key={r.rtn_id}>
                      <TableCell>
                        {PagingSize * (currentPage - 1) + (i + 1)}
                      </TableCell>

                      <TableCell>{r.rtn_kode}</TableCell>

                      <TableCell>
                        {formatTanggal(r.rtn_tanggal)}
                      </TableCell>

                      {/* <TableCell>{r.rtn_status}</TableCell> */}

                      <TableCell>
                        <Button
                          size="icon"
                          variant="outline"
                          asChild
                          className="border-sky-400 text-sky-600 hover:bg-sky-50"
                        >
                          <Link
                            to={`/return/kode/${encodeURIComponent(
                              r.rtn_kode
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
                      colSpan={5}
                      className="text-center text-muted-foreground"
                    >
                      Tidak ada data return
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

        </SectionBody>

        <SectionFooter>
          <MyPagination
            //data={filtered}
            data={Array.isArray(filtered) ? filtered : []}
            triggerNext={nextPage}
            triggerPrevious={previousPage}
            triggerPageChange={pageChange}
            currentPage={currentPage}
          />
        </SectionFooter>
      </SectionContainer>

    </WithSidebar>
  );
}