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
import { DatePicker } from "@/components/date-picker";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/context/AuthContext";
import { getAllSpbDo } from "@/services/spb";
import type { SpbDo } from "@/types";
import { PagingSize } from "@/types/enum";
import { Plus, X, Filter, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import CreateSpbDoForm from "@/components/form/create-spb-do";

export default function SpbDoPage() {
  const { user } = useAuth();
  const [refresh, setRefresh] = useState(false);

  const [rows, setRows] = useState<SpbDo[]>([]);
  const [filtered, setFiltered] = useState<SpbDo[]>([]);
  const [toShow, setToShow] = useState<SpbDo[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  /* =========================
     FILTER STATE
  ========================= */
  const [noSpb, setNoSpb] = useState("");
  const [noDo, setNoDo] = useState("");
  const [lokasi, setLokasi] = useState("");
  const [doDate, setDoDate] = useState<Date | undefined>();

  /* =========================
     FETCH DATA
  ========================= */
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await getAllSpbDo();
        setRows(res);
      } catch {
        toast.error("Gagal mengambil data SPB DO");
      }
    }
    fetchData();
  }, [refresh]);

  /* =========================
     FILTER LOGIC
  ========================= */
  useEffect(() => {
    let temp = rows;

    if (noSpb) {
      temp = temp.filter((r) =>
        r.po?.spb?.spb_no
          ?.toLowerCase()
          .includes(noSpb.toLowerCase())
      );
    }

    if (noDo) {
      temp = temp.filter((r) =>
        r.do_no?.toLowerCase().includes(noDo.toLowerCase())
      );
    }

    if (lokasi) {
      temp = temp.filter((r) =>
        r.po?.spb?.spb_gudang
          ?.toLowerCase()
          .includes(lokasi.toLowerCase())
      );
    }

    if (doDate) {
      temp = temp.filter((r) => {
        if (!r.do_date) return false;
        const d = new Date(r.do_date);
        return (
          d.getFullYear() === doDate.getFullYear() &&
          d.getMonth() === doDate.getMonth() &&
          d.getDate() === doDate.getDate()
        );
      });
    }

    setFiltered(temp);
    setCurrentPage(1);
  }, [rows, noSpb, noDo, lokasi, doDate]);

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
    setNoDo("");
    setLokasi("");
    setDoDate(undefined);
    toast.success("Filter direset");
  }

  return (
    <WithSidebar>
      <SectionContainer span={12}>
        <SectionHeader>SPB - Delivery Order</SectionHeader>

        <SectionBody className="grid grid-cols-12 gap-3">

          {/* 🔍 SEARCH + FILTER */}
          <div className="col-span-12 flex items-center gap-2">

            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari No SPB..."
                value={noSpb}
                onChange={(e) => setNoSpb(e.target.value)}
                className="pl-9"
              />
            </div>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon">
                  <Filter className="w-4 h-4" />
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-80 space-y-4">
                <div className="space-y-1">
                  <h4 className="font-medium">Filter Lanjutan</h4>
                  <p className="text-sm text-muted-foreground">
                    Saring data delivery order.
                  </p>
                </div>

                <div className="grid gap-3">

                  <div>
                    <Label>No DO</Label>
                    <Input
                      value={noDo}
                      onChange={(e) => setNoDo(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>Lokasi SPB</Label>
                    <Input
                      value={lokasi}
                      onChange={(e) => setLokasi(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>Tanggal DO</Label>
                    <DatePicker
                      value={doDate}
                      onChange={setDoDate}
                    />
                  </div>

                </div>
              </PopoverContent>
            </Popover>

            <Button variant="outline" size="icon" onClick={resetFilter}>
              <X className="w-4 h-4 text-red-500" />
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
                  <TableHead>No DO</TableHead>
                  <TableHead>Tanggal DO</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {toShow.length > 0 ? (
                  toShow.map((row, i) => (
                    <TableRow key={row.spb_do_id}>
                      <TableCell>
                        {PagingSize * (currentPage - 1) + (i + 1)}
                      </TableCell>
                      <TableCell>
                        {row.po?.spb?.spb_no ?? "-"}
                      </TableCell>
                      <TableCell>
                        {row.po?.spb?.spb_gudang ?? "-"}
                      </TableCell>
                      <TableCell>{row.do_no}</TableCell>
                      <TableCell>{row.do_date}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
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

      {/* ADD DO */}
      {(user?.role === "logistik" || user?.role === "superadmin") && (
        <SectionContainer span={12}>
          <SectionHeader>Attach DO ke SPB</SectionHeader>
          <SectionBody>
            <CreateSpbDoForm setRefresh={setRefresh} />
          </SectionBody>
          <SectionFooter>
            <Button
              type="submit"
              form="create-spb-do-form"
              className="w-full !bg-green-600 hover:!bg-green-700 !text-white flex items-center justify-center gap-2 h-11"
            >
              Simpan DO <Plus />
            </Button>
          </SectionFooter>
        </SectionContainer>
      )}
    </WithSidebar>
  );
}