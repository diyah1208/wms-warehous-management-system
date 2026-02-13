import SectionContainer, {
  SectionHeader,
  SectionBody,
  SectionFooter,
} from "@/components/content-container";
import WithSidebar from "@/components/layout/WithSidebar";
import { MyPagination } from "@/components/my-pagination";
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
import { useAuth } from "@/context/AuthContext";
import { getAllSpbPo } from "@/services/spb";
import type { SpbPo } from "@/types";
import { PagingSize } from "@/types/enum";
import { Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import CreateSpbPoForm from "@/components/form/create-spb-po";

export default function SpbPoPage() {
  const { user } = useAuth();
  const [refresh, setRefresh] = useState(false);

  const [rows, setRows] = useState<SpbPo[]>([]);
  const [filtered, setFiltered] = useState<SpbPo[]>([]);
  const [toShow, setToShow] = useState<SpbPo[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  // filter
  const [noSpb, setNoSpb] = useState("");
  const [noPo, setNoPo] = useState("");

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
     FILTER
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

    setFiltered(temp);
    setCurrentPage(1);
  }, [rows, noSpb, noPo]);

  useEffect(() => {
    const start = (currentPage - 1) * PagingSize;
    const end = start + PagingSize;
    setToShow(filtered.slice(start, end));
  }, [filtered, currentPage]);

  function resetFilter() {
    setNoSpb("");
    setNoPo("");
    toast.success("Filter direset");
  }

  return (
    <WithSidebar>
      {/* LIST */}
      <SectionContainer span={12}>
        <SectionHeader>SPB - Purchase Order</SectionHeader>

        <SectionBody className="grid grid-cols-12 gap-3">
          {/* FILTER */}
          <div className="col-span-12 flex gap-2">
            <Input
              placeholder="Cari No SPB"
              value={noSpb}
              onChange={(e) => setNoSpb(e.target.value)}
            />
            <Input
              placeholder="Cari No PO"
              value={noPo}
              onChange={(e) => setNoPo(e.target.value)}
            />
            <Button variant="outline" size="icon" onClick={resetFilter}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* TABLE */}
          <div className="col-span-12 border rounded-sm overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No</TableHead>
                  <TableHead>No SPB</TableHead>
                  <TableHead>No PO</TableHead>
                  <TableHead>No SO</TableHead>
                  <TableHead>Tanggal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {toShow.length > 0 ? (
                  toShow.map((row, i) => (
                    <TableRow key={row.spb_id}>
                      <TableCell>
                        {PagingSize * (currentPage - 1) + (i + 1)}
                      </TableCell>
                      <TableCell>{row.spb?.spb_no}</TableCell>
                      <TableCell>{row.po_no ?? "-"}</TableCell>
                      <TableCell>{row.so_no ?? "-"}</TableCell>
                      <TableCell>{row.so_date}</TableCell>                     
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

      {/* ADD PO */}
      {user?.role === "marketing" && (
        <SectionContainer span={12}>
          <SectionHeader>Attach PO ke SPB</SectionHeader>
          <SectionBody>
            <CreateSpbPoForm setRefresh={setRefresh} />
          </SectionBody>
          <SectionFooter>
            <Button className="w-full !bg-green-600 hover:!bg-green-700 !text-white flex items-center justify-center gap-2 h-11"
            type="submit" form="create-spb-po-form">
              Simpan PO <Plus />
            </Button>
          </SectionFooter>
        </SectionContainer>
      )}
    </WithSidebar>
  );
}
