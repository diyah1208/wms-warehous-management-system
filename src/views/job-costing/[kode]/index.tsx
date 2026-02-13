import SectionContainer, {
  SectionBody,
  SectionHeader,
} from "@/components/content-container";
import WithSidebar from "@/components/layout/WithSidebar";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { formatTanggal } from "@/lib/utils";
import { getJobCostingByKode } from "@/services/job-costing";

import type { JobCostingDetail } from "@/types";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";

export default function JobCostingDetailPage() {
  const params = useParams();
  const kode = params.kode as string; // ✅ FIX TS ERROR

  const [detail, setDetail] = useState<JobCostingDetail | null>(null);

  useEffect(() => {
    async function fetchDetail() {
      try {
        const res = await getJobCostingByKode(kode);
        setDetail(res);
      } catch {
        toast.error("Gagal mengambil detail Job Costing");
      }
    }

    fetchDetail();
  }, [kode]);

  /* ================= LOADING ================= */
  if (!detail) {
    return (
      <WithSidebar>
        <SectionContainer span={12}>
          <SectionHeader>Detail Job Costing</SectionHeader>
          <SectionBody className="p-8 text-center text-muted-foreground">
            Data belum tersedia.
          </SectionBody>
        </SectionContainer>
      </WithSidebar>
    );
  }

  /* ================= UI ================= */
  return (
    <WithSidebar>
      {/* ===== INFO ===== */}
      <SectionContainer span={12}>
        <SectionHeader>
          Detail Job Costing: {detail.batch_no}
        </SectionHeader>

        <SectionBody className="grid grid-cols-12 gap-6">
          <div className="col-span-12 space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2 mb-4">
              Informasi Umum
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-muted-foreground">
                  Batch No
                </Label>
                <p className="font-medium">{detail.batch_no}</p>
              </div>

              <div>
                <Label className="text-sm text-muted-foreground">
                  Tanggal
                </Label>
                <p className="font-medium">
                  {formatTanggal(detail.jc_date)}
                </p>
              </div>

              <div>
                <Label className="text-sm text-muted-foreground">
                  Barang Baru
                </Label>
                <p className="font-medium">{detail.description}</p>
              </div>

              <div>
                <Label className="text-sm text-muted-foreground">
                  Dibuat Oleh
                </Label>
                <p className="font-medium">{detail.created_by}</p>
              </div>

              <div>
                <Label className="text-sm text-muted-foreground">
                  Dibuat Pada
                </Label>
                <p className="font-medium">
                  {detail.created_at
                    ? formatTanggal(new Date(detail.created_at))
                    : "-"}
                </p>
              </div>
            </div>
          </div>
        </SectionBody>
      </SectionContainer>

      {/* ===== TABEL ITEM ===== */}
      <SectionContainer span={12}>
        <SectionHeader>Detail Barang</SectionHeader>

        <SectionBody className="grid grid-cols-12 gap-6">
          <div className="col-span-12 border rounded-sm overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="[&>th]:border">
                  <TableHead className="w-[50px] text-center">No</TableHead>
                  <TableHead>Part Number</TableHead>
                  <TableHead>Nama Part</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Unit</TableHead>
              
                </TableRow>
              </TableHeader>

              <TableBody>
                {detail.items.length > 0 ? (
                  detail.items.map((item, index) => (
                    <TableRow key={index} className="[&>td]:border">
                      <TableCell className="text-center">
                        {index + 1}
                      </TableCell>
                      <TableCell>{item.part_no}</TableCell>
                      <TableCell>{item.barang?.part_name ?? "-"}</TableCell>
                      <TableCell>{item.qty}</TableCell>
                      <TableCell>{item.unit}</TableCell>
                      
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-muted-foreground p-4"
                    >
                      Tidak ada item.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </SectionBody>
      </SectionContainer>
    </WithSidebar>
  );
}
