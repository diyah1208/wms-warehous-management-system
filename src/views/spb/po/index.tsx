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
import { getAllSpbPo } from "@/services/spb";
import type { SpbPo } from "@/types";
import { PagingSize } from "@/types/enum";
import { Plus, X, Search, Filter } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import CreateSpbPoForm from "@/components/form/create-spb-po";
import { useAuth } from "@/context/AuthContext";

export default function SpbPoPage() {
  const { user } = useAuth();
  const [refresh, setRefresh] = useState(false);

  const [rows, setRows] = useState<SpbPo[]>([]);
  const [filtered, setFiltered] = useState<SpbPo[]>([]);
  const [toShow, setToShow] = useState<SpbPo[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  // FILTER STATE
  const [noSpb, setNoSpb] = useState("");
  const [noPo, setNoPo] = useState("");
  const [noSo, setNoSo] = useState("");
  const [lokasi, setLokasi] = useState("");

  /* =========================
     FETCH DATA
  ========================= */
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await getAllSpbPo();
        setRows(res);
      } catch {
        toast.error("Gagal mengambil data SPB PO");
      }
    }
    fetchData();
  }, [refresh]);

  /* =========================
     FILTERING LOGIC
  ========================= */
  useEffect(() => {
    let temp = rows;

    if (noSpb) {
      temp = temp.filter((r) =>
        r.spb?.spb_no?.toLowerCase().includes(noSpb.toLowerCase())
      );
    }

    if (noPo) {
      temp = temp.filter((r) =>
        r.po_no?.toLowerCase().includes(noPo.toLowerCase())
      );
    }

    if (noSo) {
      temp = temp.filter((r) =>
        r.so_no?.toLowerCase().includes(noSo.toLowerCase())
      );
    }

    if (lokasi) {
      temp = temp.filter((r) =>
        r.spb?.spb_gudang
          ?.toLowerCase()
          .includes(lokasi.toLowerCase())
      );
    }

    setFiltered(temp);
    setCurrentPage(1);
  }, [rows, noSpb, noPo, noSo, lokasi]);

  /* =========================
     PAGINATION
  ========================= */
  useEffect(() => {
    const start = (currentPage - 1) * PagingSize;
    const end = start + PagingSize;
    setToShow(filtered.slice(start, end));
  }, [filtered, currentPage]);

  function resetFilter() {
    setNoSpb("");
    setNoPo("");
    setNoSo("");
    setLokasi("");
    toast.success("Filter direset");
  }

  return (
    <WithSidebar>
      <SectionContainer span={12}>
        <SectionHeader>SPB - Purchase Order</SectionHeader>

        <SectionBody className="grid grid-cols-12 gap-3">

          {/* FILTER BAR */}
          <div className="col-span-12 flex flex-wrap items-center gap-2">

            {/* SEARCH NO SPB */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari No SPB..."
                value={noSpb}
                onChange={(e) => setNoSpb(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* POPOVER FILTER */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-80 space-y-4">
                <div>
                  <h4 className="font-medium">Filter Lanjutan</h4>
                  <p className="text-sm text-muted-foreground">
                    Saring data SPB - PO
                  </p>
                </div>

                <div className="grid gap-3">

                  <div className="grid gap-1">
                    <Label>No PO</Label>
                    <Input
                      placeholder="Cari No PO..."
                      value={noPo}
                      onChange={(e) => setNoPo(e.target.value)}
                    />
                  </div>

                  <div className="grid gap-1">
                    <Label>No SO</Label>
                    <Input
                      placeholder="Cari No SO..."
                      value={noSo}
                      onChange={(e) => setNoSo(e.target.value)}
                    />
                  </div>

                  <div className="grid gap-1">
                    <Label>Lokasi SPB</Label>
                    <Input
                      placeholder="Cari Lokasi..."
                      value={lokasi}
                      onChange={(e) => setLokasi(e.target.value)}
                    />
                  </div>

                </div>
              </PopoverContent>
            </Popover>

            {/* RESET */}
            <Button variant="outline" size="icon" onClick={resetFilter}>
              <X className="h-4 w-4 text-red-500" />
            </Button>

          </div>

          {/* TABLE */}
          <div className="col-span-12 border rounded-sm overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No</TableHead>
                  <TableHead>No SPB</TableHead>
                  <TableHead>Lokasi</TableHead>
                  <TableHead>No PO</TableHead>
                  <TableHead>No SO</TableHead>
                  <TableHead>Tanggal</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {toShow.length > 0 ? (
                  toShow.map((row, i) => (
                    <TableRow key={row.spb_po_id}>
                      <TableCell>
                        {PagingSize * (currentPage - 1) + (i + 1)}
                      </TableCell>
                      <TableCell>{row.spb?.spb_no}</TableCell>
                      <TableCell>{row.spb?.spb_gudang}</TableCell>
                      <TableCell>{row.po_no ?? "-"}</TableCell>
                      <TableCell>{row.so_no ?? "-"}</TableCell>
                      <TableCell>{row.so_date ?? "-"}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
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
            currentPage={currentPage}
            triggerNext={() => setCurrentPage((p) => p + 1)}
            triggerPrevious={() =>
              setCurrentPage((p) => (p > 1 ? p - 1 : 1))
            }
            triggerPageChange={setCurrentPage}
          />
        </SectionFooter>
      </SectionContainer>

      {/* FORM ATTACH PO */}
      {(user?.role === "marketing" || user?.role === "superadmin")&& (
        <SectionContainer span={12}>
          <SectionHeader>Attach PO ke SPB</SectionHeader>
          <SectionBody>
            <CreateSpbPoForm setRefresh={setRefresh} />
          </SectionBody>
          <SectionFooter>
            <Button
              className="w-full !bg-green-600 hover:!bg-green-700 !text-white flex items-center justify-center gap-2 h-11"
              type="submit"
              form="create-spb-po-form"
            >
              Simpan PO <Plus />
            </Button>
          </SectionFooter>
        </SectionContainer>
      )}
    </WithSidebar>
  );
}