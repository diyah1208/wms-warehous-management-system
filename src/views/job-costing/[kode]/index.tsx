import SectionContainer, {
  SectionBody,
  SectionFooter,
  SectionHeader,
} from "@/components/content-container";
import WithSidebar from "@/components/layout/WithSidebar";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { formatTanggal } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { downloadJobCostingPdf, getJobCostingByKode } from "@/services/job-costing";

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
import { Button } from "@/components/ui/button";
import { QRCodeCanvas } from "qrcode.react";
import { PenTool, Printer } from "lucide-react";

export default function JobCostingDetailPage() {
  const params = useParams();
  const kode = params.kode as string; // ✅ FIX TS ERROR
  const { user } = useAuth();
  const [showSignature, setShowSignature] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  

  const [detail, setDetail] = useState<JobCostingDetail | null>(null);
  const canSign =
  user &&
  detail &&
  detail.sign_step === user.role;

  const canPrint =
  !!detail?.signed_pengaju_sign ||
  !!detail?.signed_spv_sign ||
  !!detail?.signed_ppic_sign;

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

  useEffect(() => {
    if (!showSignature || !detail || !user) return;

    const interval = setInterval(async () => {
      try {
        const res = await getJobCostingByKode(detail.batch_no);

        if (!res) return;

        let signed = false;

        switch (user.role) {
          case "warehouse":
            signed = !!res.signed_pengaju_sign;
            break;
          case "spv":
            signed = !!res.signed_spv_sign;
            break;
          case "ppic":
            signed = !!res.signed_ppic_sign;
            break;
        }

        if (signed) {
          setDetail(res);
          setShowSignature(false);
          toast.success("Tanda tangan berhasil!");
          clearInterval(interval);
        }

      } catch (err) {
        console.error(err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [showSignature, detail, user]);

  
  
  const handleDownloadPdf = () => {
    if (!detail) return;

    downloadJobCostingPdf(detail.batch_no);
  };

  
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

  return (
    <WithSidebar>
      {showSignature && detail && user && (
        <div
          key={detail.sign_step}
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center print:hidden"
        >
          <div className="bg-white p-6 rounded-md w-[350px] space-y-4 text-center">
            <h3 className="font-semibold text-lg">Scan untuk Tanda Tangan</h3>

            {/* <QRCodeCanvas
              value={`http://10.10.6.37:5173/jc-sign/${encodeURIComponent(
                detail.batch_no
              )}?name=${user.nama}&role=${user.role}`}
              size={200}
              className="mx-auto"
            /> */}
            <QRCodeCanvas
              value={`https://wms-lourdes.my.id/jc-sign/${encodeURIComponent(
                detail.batch_no
              )}?name=${encodeURIComponent(user.nama)}&role=${user.role}`}
              size={200}
            />
               {/* <QRCodeCanvas
              value={`http://10.10.6.37:5173/jc-sign/${encodeURIComponent(
                detail.batch_no
              )}?name=${encodeURIComponent(user.nama)}&role=${user.role}`}
              size={200}
            /> */}


            <p className="text-sm text-muted-foreground">
              Setelah tanda tangan, dokumen akan siap di-print
            </p>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowSignature(false)}
              >
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}
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
                  Finish Part
                </Label>
                <p className="font-medium">{detail.finish_part}</p>
              </div>
 <div>
                <Label className="text-sm text-muted-foreground">
                  Keterangan
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
              <SectionFooter className="flex gap-2">
        {canSign && (
          <Button
            size="icon"
            variant="outline"
            onClick={() => setShowSignature(true)}
            title="Tanda Tangan"
          >
            <PenTool className="h-4 w-4" />
          </Button>
        )}

        {canPrint && (
          <Button
            size="sm"
            variant={detail.sign_step === "done" ? "destructive" : "outline"}
            onClick={handleDownloadPdf}
            disabled={isPrinting}
          >
            <Printer className="h-4 w-4 mr-2" />
            {detail.sign_step === "done" ? "" : "Preview PDF"}
          </Button>
        )}
      </SectionFooter>
      </SectionContainer>
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
            <div className="hidden print:flex mt-16 justify-between px-8 pb-8">

              {/* PENGAJU */}
              <div className="text-center w-[220px]">
                <p className="font-semibold mb-2">Pengaju</p>

                {detail.signed_pengaju_sign && (
                  <img
                    src={`https://wms-lourdes.my.id/storage/${detail.signed_pengaju_sign}`}
                    className="h-24 mx-auto border-b border-black"
                  />
                )}

                <p className="text-sm mt-2">{detail.signed_pengaju_name}</p>
              </div>

              {/* SPV */}
              <div className="text-center w-[220px]">
                <p className="font-semibold mb-2">Mengetahui (SPV)</p>

                {detail.signed_spv_sign && (
                  <img
                    src={`https://wms-lourdes.my.id/storage/${detail.signed_spv_sign}`}
                    className="h-24 mx-auto border-b border-black"
                  />
                )}

                <p className="text-sm mt-2">{detail.signed_spv_name}</p>
              </div>

              {/* PPIC */}
              <div className="text-center w-[220px]">
                <p className="font-semibold mb-2">Menyetujui (PPIC)</p>

                {detail.signed_ppic_sign && (
                  <img
                    src={`https://wms-lourdes.my.id/storage/${detail.signed_ppic_sign}`}
                    className="h-24 mx-auto border-b border-black"
                  />
                )}

                <p className="text-sm mt-2">{detail.signed_ppic_name}</p>
              </div>

            </div>
          </div>
        </SectionBody>
      </SectionContainer>
    </WithSidebar>
  );
}