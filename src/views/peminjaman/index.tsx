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

import { getAllPeminjaman } from "@/services/peminjaman";

import type { Peminjaman } from "@/types";

import { PagingSize } from "@/types/enum";

import {
  Plus,
  Info,
  Search,
  Filter,
  X,
} from "lucide-react";

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import CreatePeminjamanForm from "@/components/form/create-peminjaman";

export default function PeminjamanIndex() {
  const { user } = useAuth();

  const [refresh, setRefresh] = useState(false);

  const [data, setData] = useState<Peminjaman[]>([]);
  const [filtered, setFiltered] = useState<Peminjaman[]>([]);
  const [toShow, setToShow] = useState<Peminjaman[]>([]);

  const [currentPage, setCurrentPage] = useState(1);

  const [kode, setKode] = useState("");
  const [status, setStatus] = useState("");
  const [peminjam, setPeminjam] = useState("");
  const [tanggal, setTanggal] = useState<Date | undefined>(undefined);

  useEffect(() => {
    fetchData();
  }, [refresh]);

  async function fetchData() {
    try {
      const res = await getAllPeminjaman();
      setData(res);
    } catch (err) {
      toast.error("Gagal mengambil data peminjaman");
    }
  }

  useEffect(() => {
    let f = data;

    if (kode) {
      f = f.filter((d) =>
        d.pmj_kode.toLowerCase().includes(kode.toLowerCase())
      );
    }

    if (status) {
      f = f.filter((d) => d.pmj_status === status);
    }

    if (peminjam) {
      f = f.filter((d) =>
        d.pmj_peminjam
          ?.toLowerCase()
          .includes(peminjam.toLowerCase())
      );
    }

    if (tanggal) {
      f = f.filter((d) => {
        if (!d.pmj_tanggal) return false;
        const dt = new Date(d.pmj_tanggal);

        return (
          dt.getFullYear() === tanggal.getFullYear() &&
          dt.getMonth() === tanggal.getMonth() &&
          dt.getDate() === tanggal.getDate()
        );
      });
    }

    setFiltered(f);
    setCurrentPage(1);
  }, [data, kode, status, peminjam, tanggal]);

  useEffect(() => {
    const start = (currentPage - 1) * PagingSize;
    const end = start + PagingSize;
    setToShow(filtered.slice(start, end));
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
    setPeminjam("");
    setTanggal(undefined);
    toast.success("Filter direset");
  }

  return (
    <WithSidebar>
      <SectionContainer span={12}>
        <SectionHeader>Buat Peminjaman</SectionHeader>
        <SectionBody>
          {user && (
            <CreatePeminjamanForm
              user={user}
              setRefresh={setRefresh}
            />
          )}
        </SectionBody>
        <SectionFooter>
          <Button
            type="submit"
            form="create-peminjaman-form"
            className="w-full !bg-green-600 hover:!bg-green-700 text-white h-11"
          >
            Simpan Peminjaman <Plus />
          </Button>
        </SectionFooter>
      </SectionContainer>

      <SectionContainer span={12}>
        <SectionHeader>Daftar Peminjaman</SectionHeader>

        <SectionBody className="grid grid-cols-12 gap-2">

          {/* SEARCH */}
          <div className="col-span-12 flex items-center gap-2">

            <div className="relative flex-1">
              <Input
                placeholder="Cari kode peminjaman"
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
                    placeholder="Borrowed / Returned"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Peminjam</Label>
                  <Input
                    placeholder="Nama peminjam"
                    value={peminjam}
                    onChange={(e) => setPeminjam(e.target.value)}
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
                  <TableHead>Peminjam</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {toShow.length > 0 ? (
                  toShow.map((p, i) => (
                    <TableRow key={p.pmj_id}>
                      <TableCell>
                        {PagingSize * (currentPage - 1) + (i + 1)}
                      </TableCell>

                      <TableCell>{p.pmj_kode}</TableCell>

                      <TableCell>
                        {formatTanggal(p.pmj_tanggal)}
                      </TableCell>

                      <TableCell>
                        {p.pmj_peminjam}
                      </TableCell>

                      <TableCell>{p.pmj_status}</TableCell>

                      <TableCell>
                        <Button
                          size="icon"
                          variant="outline"
                          asChild
                          className="border-sky-400 text-sky-600 hover:bg-sky-50"
                        >
                          <Link
                            to={`/peminjaman/kode/${encodeURIComponent(
                              p.pmj_kode
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
                      colSpan={6}
                      className="text-center text-muted-foreground"
                    >
                      Tidak ada data
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

        </SectionBody>

        <SectionFooter>
          <MyPagination
            data={filtered}
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
