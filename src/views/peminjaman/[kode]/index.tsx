import SectionContainer, {
  SectionBody,
  SectionFooter,
  SectionHeader,
} from "@/components/content-container";
import WithSidebar from "@/components/layout/WithSidebar";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { CheckSquare2 } from "lucide-react";

import { formatTanggal } from "@/lib/utils";

import {
  getPeminjamanByKode,
  returnPeminjamanParts,
} from "@/services/peminjaman";

import type { Peminjaman } from "@/types";

export default function PeminjamanDetailPage() {
  const { kode } = useParams<{ kode: string }>();

  const [data, setData] = useState<Peminjaman | null>(null);
  const [loading, setLoading] = useState(true);

  /** popup state */
  const [popupOpen, setPopupOpen] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<any>(null);
  const [returnQty, setReturnQty] = useState<number>(0);

  useEffect(() => {
    async function load() {
      try {
        const res = await getPeminjamanByKode(kode!);
        setData(res);
      } catch {
        toast.error("Gagal load detail peminjaman");
      } finally {
        setLoading(false);
      }
    }

    if (kode) load();
  }, [kode]);

  function openReturnPopup(detail: any) {
    const sisa =
      detail.dtl_pmj_qty_borrowed -
      detail.dtl_pmj_qty_returned;

    setSelectedDetail(detail);
    setReturnQty(sisa);
    setPopupOpen(true);
  }

  async function submitReturn() {
    if (!selectedDetail || !data) return;

    const sisa =
      selectedDetail.dtl_pmj_qty_borrowed -
      selectedDetail.dtl_pmj_qty_returned;

    if (returnQty <= 0 || returnQty > sisa) {
      toast.error("Qty return tidak valid");
      return;
    }

    try {
      await returnPeminjamanParts(
        {
          details: [
            {
              dtl_pmj_id: selectedDetail.dtl_pmj_id,
              qty_returned: returnQty,
            },
          ],
        },
        data.pmj_id
      );

      toast.success("Return parsial berhasil");

      const refreshed = await getPeminjamanByKode(kode!);
      setData(refreshed);

      setPopupOpen(false);
      setSelectedDetail(null);
    } catch {
      toast.error("Gagal return");
    }
  }

  if (loading) {
    return (
      <WithSidebar>
        <SectionContainer span={12}>
          <SectionHeader>Loading...</SectionHeader>
          <SectionBody>Memuat data...</SectionBody>
        </SectionContainer>
      </WithSidebar>
    );
  }

  if (!data) return null;

  return (
    <WithSidebar>

    {popupOpen && selectedDetail && (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">

        <div className="bg-white w-[380px] rounded-lg shadow-xl p-6 space-y-5">

        {/* HEADER */}
        <div>
            <h3 className="text-lg font-semibold">
            Return Part
            </h3>
            <p className="text-sm text-muted-foreground">
            Masukkan qty yang akan dikembalikan
            </p>
        </div>

        {/* INFO GRID */}
        <div className="grid grid-cols-[90px_1fr] gap-x-3 gap-y-2 text-sm">

            <span className="text-muted-foreground">Part Number</span>
            <span className="font-medium break-words">
            {selectedDetail.dtl_pmj_part_number}
            </span>

            <span className="text-muted-foreground">Part Name</span>
            <span className="break-words leading-snug">
            {selectedDetail.dtl_pmj_part_name}
            </span>

            <span className="text-muted-foreground">Sisa</span>
            <span className="font-semibold text-amber-600">
            {selectedDetail.dtl_pmj_qty_borrowed -
                selectedDetail.dtl_pmj_qty_returned}
            </span>

        </div>

        {/* INPUT */}
        <div className="space-y-2 pt-1">
            <Label>Qty Return</Label>

            <Input
            type="number"
            min={1}
            value={returnQty}
            onChange={(e) =>
                setReturnQty(Number(e.target.value))
            }
            className="text-right text-base font-medium h-11"
            />
        </div>

        {/* ACTION */}
        <div className="flex gap-3 pt-3">
            <Button
            className="flex-1 bg-green-600 hover:bg-green-700 text-white h-11"
            onClick={submitReturn}
            >
            Proses Return
            </Button>

            <Button
            variant="outline"
            className="flex-1 h-11"
            onClick={() => setPopupOpen(false)}
            >
            Batal
            </Button>
        </div>

        </div>
    </div>
    )}

      <SectionContainer span={12}>
        <SectionHeader>Detail Peminjaman</SectionHeader>

        <SectionBody className="grid grid-cols-12 gap-4">

          <div className="col-span-6">
            <Label>Kode</Label>
            <p>{data.pmj_kode}</p>
          </div>

          <div className="col-span-6">
            <Label>Tanggal</Label>
            <p>{formatTanggal(data.pmj_tanggal)}</p>
          </div>

          <div className="col-span-6">
            <Label>Lokasi</Label>
            <p>{data.pmj_lokasi}</p>
          </div>

          <div className="col-span-6">
            <Label>Peminjam</Label>
            <p>{data.pmj_peminjam}</p>
          </div>

          <div className="col-span-12">
            <Label>Status</Label>
            <p className="font-semibold">
              {data.pmj_status}
            </p>
          </div>

        </SectionBody>
      </SectionContainer>

      {/* ================= TABLE ================= */}

      <SectionContainer span={12}>
        <SectionHeader>Detail Part</SectionHeader>

        <SectionBody>
          <div className="border rounded-sm overflow-x-auto">

            <Table>

              <TableHeader>
                <TableRow>
                  <TableHead>Return</TableHead>
                  <TableHead>No</TableHead>
                  <TableHead>Part</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Borrowed</TableHead>
                  <TableHead>Returned</TableHead>
                  <TableHead>Sisa</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>

                {data.details.map((d, i) => {
                  const sisa =
                    d.dtl_pmj_qty_borrowed -
                    d.dtl_pmj_qty_returned;

                  return (
                    <TableRow key={d.dtl_pmj_id}>

                      <TableCell>
                        {sisa > 0 && (
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() =>
                              openReturnPopup(d)
                            }
                          >
                            <CheckSquare2 className="text-green-600"/>
                          </Button>
                        )}
                      </TableCell>

                      <TableCell>{i + 1}</TableCell>
                      <TableCell>{d.dtl_pmj_part_number}</TableCell>
                      <TableCell>{d.dtl_pmj_part_name}</TableCell>
                      <TableCell>{d.dtl_pmj_qty_borrowed}</TableCell>
                      <TableCell>{d.dtl_pmj_qty_returned}</TableCell>
                      <TableCell className="font-semibold">
                        {sisa}
                      </TableCell>

                    </TableRow>
                  );
                })}

              </TableBody>

            </Table>

          </div>
        </SectionBody>
      </SectionContainer>

    </WithSidebar>
  );
}
