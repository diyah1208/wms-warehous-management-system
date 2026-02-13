import SectionContainer, {
  SectionBody,
  SectionFooter,
  SectionHeader,
} from "@/components/content-container";
import WithSidebar from "@/components/layout/WithSidebar";
import type { RI } from "@/types";
import { useEffect, useRef, useState } from "react";
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
import { downloadReceivePdf, getRIByKode } from "@/services/receive-item";
import { Button } from "@/components/ui/button";
import { QRCodeCanvas } from "qrcode.react";
import { useAuth } from "@/context/AuthContext";



export function ReceiveDetail() {
  const { kode } = useParams<{ kode: string }>();
  const [ri, setRi] = useState<RI | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSignature, setShowSignature] = useState(false);
  const { user } = useAuth();
  const [, setSignatureConfirmed] = useState(false);
  const toastShownRef = useRef(false);

  useEffect(() => {
    async function fetchDetail() {
      try {
        const res = await getRIByKode(kode!);
        setRi(res);
      } catch (err) {
        toast.error("Gagal mengambil detail receive");
      } finally {
        setLoading(false);
      }
    }

    if (kode) fetchDetail();
  }, [kode]);


  
    useEffect(() => {
    if (!showSignature || !kode) return;
  
    const interval = setInterval(async () => {
      try {
        const res = await getRIByKode(kode);
  
        if (res?.signed_penerima_sign && !toastShownRef.current) {
          toastShownRef.current = true;
          setRi(res);
          setShowSignature(false);
          setSignatureConfirmed(true);
          toast.success("Tanda tangan diterima! Siap print.");
          clearInterval(interval);
        }
      } catch (err) {
        console.error(err);
      }
    }, 2000);
  
    return () => clearInterval(interval);
  }, [showSignature, kode]);

  if (loading) {
    return (
      <WithSidebar>
        <SectionContainer span={12}>
          <SectionHeader>Memuat Detail Receive...</SectionHeader>
          <SectionBody className="flex justify-center py-10 text-muted-foreground">
            Memuat data...
          </SectionBody>
        </SectionContainer>
      </WithSidebar>
    );
  }

  if (!ri) {
    return (
      <WithSidebar>
        <SectionContainer span={12}>
          <SectionHeader>Receive Tidak Ditemukan</SectionHeader>
          <SectionBody className="flex justify-center py-10 text-muted-foreground">
            Data receive tidak ditemukan
          </SectionBody>
        </SectionContainer>
      </WithSidebar>
    );
  }

  return (
    <WithSidebar>
      {showSignature && ri && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center print:hidden">
          <div className="bg-white p-6 rounded-md w-[350px] space-y-4 text-center">
            <h3 className="font-semibold text-lg">
              Scan untuk Tanda Tangan Receive
            </h3>

            <QRCodeCanvas
              value={`https://wms-lourdes.my.id/receive/sign/${encodeURIComponent(
                ri.ri_kode
              )}`}
              // value={`http://10.10.6.37:5173/receive/sign/${encodeURIComponent(
              //   ri.ri_kode
              // )}`}
              size={200}
              className="mx-auto"
            />


            <p className="text-sm text-muted-foreground">
              Scan QR ini menggunakan HP
            </p>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowSignature(false)}
            >
              Tutup
            </Button>
          </div>
        </div>
      )}
      {/* ================= HEADER ================= */}
      <SectionContainer span={12}>
        <SectionHeader>Detail Receive Item</SectionHeader>
        <SectionBody className="grid grid-cols-12 gap-6">
          <div className="col-span-12 space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">
              Informasi Umum
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground text-sm">Kode RI</Label>
                <p className="font-medium">{ri.ri_kode}</p>
              </div>

              <div>
                <Label className="text-muted-foreground text-sm">Tanggal</Label>
                <p className="font-medium">
                  {formatTanggal(ri.ri_tanggal)}
                </p>
              </div>

              <div>
                <Label className="text-muted-foreground text-sm">
                  Gudang Penerima
                </Label>
                <p className="font-medium">{ri.ri_lokasi}</p>
              </div>

              <div>
                <Label className="text-muted-foreground text-sm">PO</Label>
                <p className="font-medium">
                  {ri.purchase_order?.po_kode}
                </p>
              </div>

              <div>
                <Label className="text-muted-foreground text-sm">
                  Status PO
                </Label>
                <p className="font-medium">
                  {ri.purchase_order?.po_status}
                </p>
              </div>

              <div>
                <Label className="text-muted-foreground text-sm">PIC</Label>
                <p className="font-medium">{ri.ri_pic}</p>
              </div>

              <div className="col-span-2">
                <Label className="text-muted-foreground text-sm">
                  Keterangan
                </Label>
                <p className="font-medium">
                  {ri.ri_keterangan || "-"}
                </p>
              </div>
            </div>
          </div>
        </SectionBody>
        <SectionFooter>
          {ri.ri_lokasi == user!.lokasi &&
          user?.role === "warehouse_ho" &&
          !ri.signed_penerima_sign &&(
            <Button
                variant="outline"
                onClick={() => setShowSignature(true)}
              >
                Tanda Tangan
              </Button>
            
          )}
          {ri.signed_penerima_sign && ri.signed_penerima_sign !== "" && (
            <Button onClick={() => downloadReceivePdf(ri.ri_kode)}>
              Export PDF
            </Button>
          )}
        </SectionFooter>
      </SectionContainer>
      <SectionContainer span={12}>
        <SectionHeader>Detail Barang Diterima</SectionHeader>
        <SectionBody>
          <div className="border rounded-sm overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="[&>th]:border">
                  <TableHead className="w-[50px] text-center">No</TableHead>
                  <TableHead>Part Number</TableHead>
                  <TableHead>Nama Part</TableHead>
                  <TableHead>Satuan</TableHead>
                  <TableHead>Qty Diterima</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ri.details.length > 0 ? (
                  ri.details.map((d, i) => (
                    <TableRow key={i} className="[&>td]:border">
                      <TableCell className="text-center">
                        {i + 1}
                      </TableCell>
                      <TableCell>{d.dtl_ri_part_number}</TableCell>
                      <TableCell>{d.dtl_ri_part_name}</TableCell>
                      <TableCell>{d.dtl_ri_satuan}</TableCell>
                      <TableCell>{d.dtl_ri_qty}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-muted-foreground"
                    >
                      Tidak ada detail barang
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
