import SectionContainer, {
  SectionBody,
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
import { formatTanggal } from "@/lib/utils";

import { getReturnSpbByKode } from "@/services/return";

import type { ReturnSpb } from "@/types";

export default function ReturnSpbDetailPage() {
  const { kode } = useParams<{ kode: string }>();

  const [data, setData] = useState<ReturnSpb | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await getReturnSpbByKode(kode!);
        setData(res);
      } catch {
        toast.error("Gagal load detail return SPB");
      } finally {
        setLoading(false);
      }
    }

    if (kode) load();
  }, [kode]);

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

  {/* ================= HEADER ================= */}

  <SectionContainer span={12}>
    <SectionHeader>Detail Return SPB</SectionHeader>

    <SectionBody className="space-y-6">

      <div className="grid grid-cols-12 gap-6">

        <div className="col-span-12 md:col-span-4">
          <p className="text-sm text-muted-foreground">Kode Return</p>
          <p className="font-semibold">{data.rtn_kode}</p>
        </div>

        <div className="col-span-12 md:col-span-4">
          <p className="text-sm text-muted-foreground">Tanggal Return</p>
          <p>{formatTanggal(data.rtn_tanggal)}</p>
        </div>

        <div className="col-span-12 md:col-span-4">
          <p className="text-sm text-muted-foreground">No SPB</p>
          <p>{data.spb?.spb_no}</p>
        </div>

      </div>

      {data.rtn_note && (
        <div>
          <p className="text-sm text-muted-foreground">Catatan Return</p>
          <p className="whitespace-pre-line">{data.rtn_note}</p>
        </div>
      )}

    </SectionBody>
  </SectionContainer>


  {/* ================= DETAIL TABLE ================= */}

  <SectionContainer span={12}>
    <SectionHeader>Item Return</SectionHeader>

    <SectionBody>

      <div className="overflow-x-auto">

        <Table>

          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px] text-center">No</TableHead>
              <TableHead>Part Number</TableHead>
              <TableHead>Part Name</TableHead>
              <TableHead>Satuan</TableHead>
              <TableHead className="text-center">Qty Return</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>

            {data.details.length > 0 ? (
              data.details.map((d, i) => (
                <TableRow key={i}>

                  <TableCell className="text-center">
                    {i + 1}
                  </TableCell>

                  <TableCell className="font-medium">
                    {d.part?.part_number}
                  </TableCell>

                  <TableCell>
                    {d.part?.part_name}
                  </TableCell>

                  <TableCell>
                    {d.part?.part_satuan}
                  </TableCell>

                  <TableCell className="text-center font-semibold">
                    {d.dtl_rtn_qty_return}
                  </TableCell>

                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-muted-foreground py-8"
                >
                  Tidak ada item return
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