import SectionContainer, {
  SectionBody,
  SectionFooter,
  SectionHeader,
} from "@/components/content-container";
import WithSidebar from "@/components/layout/WithSidebar";
import type { POReceive, PurchaseRequest } from "@/types";
import { useEffect, useState, useRef } from "react";
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
import { getPrByKode } from "@/services/purchase-request";
import { getPoByKode, clearSignature } from "@/services/purchase-order";
import { Button } from "@/components/ui/button";
import { PenTool, Printer } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { formatRupiah } from "@/lib/utils";
import { QRCodeCanvas } from "qrcode.react";
import { downloadPoPdf } from "@/services/purchase-order";
  import { useParams, useLocation } from "react-router-dom";
import { poDetailCache } from "@/services/po-detail-cache";



export default function PurchaseOrderDetail() {
const { kode } = useParams<{ kode?: string }>();
const location = useLocation();

if (!kode) {
  return (
    <WithSidebar>
      <SectionContainer span={12}>
        <SectionHeader>Detail Purchase Order</SectionHeader>
        <SectionBody className="p-8 text-center text-muted-foreground">
          Kode Purchase Order tidak ditemukan.
        </SectionBody>
      </SectionContainer>
    </WithSidebar>
  );
}

const poKode = kode;
const statePo = (location.state as { po?: POReceive })?.po;

const [po, setPo] = useState<POReceive | null>(
  poDetailCache[poKode] ?? statePo ?? null
);

const [pr, setPr] = useState<PurchaseRequest | null>(null);
const [refresh, setRefresh] = useState(false);
const [showSignature, setShowSignature] = useState(false);
const [isPrinting, setIsPrinting] = useState(false);
const signatureToastShownRef = useRef(false);

const { user } = useAuth();
const isPurchasing = user?.role === "purchasing";


useEffect(() => {
  if (statePo && !poDetailCache[poKode]) {
    poDetailCache[poKode] = statePo;
  }
}, [statePo, poKode]);

useEffect(() => {
  async function fetchDetail() {
    try {
      const res = await getPoByKode(poKode);
      if (res) {
        poDetailCache[poKode] = res;
        setPo(res);
        setPr(res.purchase_request);
      }
    } catch {
      toast.error("Gagal mengambil detail PO");
    }
  }

  fetchDetail(); // ⬅️ SELALU jalan, background
}, [poKode]);




useEffect(() => {
  if (po?.purchase_request) {
    setPr(po.purchase_request);
  }
}, [po]);

useEffect(() => {
  if (!showSignature || !kode) return;
  if (signatureToastShownRef.current) return;

  const interval = setInterval(async () => {
    try {
      const res = await getPoByKode(kode);

      if (res?.signature_url && !signatureToastShownRef.current) {
        signatureToastShownRef.current = true; // 🔒 LOCK

      setPo(res);
        setShowSignature(false);

        toast.success("Tanda tangan diterima! Siap export PDF.");

        clearInterval(interval);
      }
    } catch (error) {
      console.error("Error polling signature:", error);
    }
  }, 1000); // lebih responsif

  return () => clearInterval(interval);
}, [showSignature, kode]);

const handleDownloadPdf = async () => {
  if (!po || !kode || isPrinting) return;

  try {
    setIsPrinting(true);
    await downloadPoPdf(po.po_kode);
    await clearSignature(kode);      // sama seperti PR
    setRefresh((prev) => !prev);     // refresh data
  } catch (error) {
    toast.error("Gagal mengunduh PDF PO");
  } finally {
    setIsPrinting(false);
  }
};


if (!po) {
  return (
    <WithSidebar>
      <SectionContainer span={12}>
        <SectionHeader>Detail Purchase Order</SectionHeader>
        <SectionBody className="p-8 text-center text-muted-foreground">
          Data Purchase Order belum tersedia.
        </SectionBody>
      </SectionContainer>
    </WithSidebar>
  );
}


  return (
  <WithSidebar>
               {showSignature && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center print:hidden">
          <div className="bg-white p-6 rounded-md w-[350px] space-y-4 text-center">
            <h3 className="font-semibold text-lg">Scan untuk Tanda Tangan</h3>

            <QRCodeCanvas
              value={`https://wms-warehouse-management-system.vercel.app/po-sign/${encodeURIComponent(
                po.po_kode
              )}`}
              size={200}
              className="mx-auto"
            />

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
    {/* ================= DETAIL PO ================= */}
    <SectionContainer span={12}>
      <SectionHeader>
        Detail Purchase Order: {po.po_kode}
      </SectionHeader>

      <SectionBody className="grid grid-cols-12 gap-6">
        {/* Informasi Umum */}
        <div className="col-span-12 space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">
            Informasi Umum
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm text-muted-foreground">Kode PO</Label>
              <p className="font-medium">{po.po_kode}</p>
            </div>

            <div>
              <Label className="text-sm text-muted-foreground">Status</Label>
              <p className="font-medium">{po.po_status}</p>
            </div>

             <div>
              <Label className="text-sm text-muted-foreground">Detail Status</Label>
              <p className="font-medium">{po.po_detail_status}</p>
            </div>

            <div>
              <Label className="text-sm text-muted-foreground">Tanggal PO</Label>
              <p className="font-medium">
                {formatTanggal(po.created_at)}
              </p>
            </div>

            <div>
              <Label className="text-sm text-muted-foreground">
                Tanggal Estimasi
              </Label>
              <p className="font-medium">
                {formatTanggal(po.po_estimasi)}
              </p>
            </div>
          </div>
        </div>
      </SectionBody>

<SectionFooter className="flex gap-2">
  {user?.role === "purchasing" && (
    <>
{/* ✍️ TANDA TANGAN */}
{!po.signature_url && (
<Button
  type="button"   // 🔑 WAJIB
  size="icon"
  variant="outline"
  onClick={() => {
    signatureToastShownRef.current = false;
    setShowSignature(true);
  }}
  title="Tanda Tangan"
>
  <PenTool className="h-4 w-4" />
</Button>

)}

{/* 🖨️ PRINT */}
{po.signature_url && (
<Button
  type="button"   // 🔥 PALING PENTING
  size="icon"
  variant="destructive"
  onClick={handleDownloadPdf}
  disabled={isPrinting}
  title="Print / Export PDF"
>
  {isPrinting ? (
    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
  ) : (
    <Printer className="h-4 w-4" />
  )}
</Button>

)}


    </>
  )}
</SectionFooter>

    </SectionContainer>

    <SectionContainer span={12}>
      <SectionHeader>
        Barang dalam PR
      </SectionHeader>

      <SectionBody className="grid grid-cols-12 gap-6">
        <div className="col-span-12">
          <div className="w-full border border-border rounded-sm overflow-x-auto">
            <Table className="w-full">
<TableHeader>
  <TableRow className="[&>th]:border">
    <TableHead className="text-center w-[50px]">No</TableHead>
    <TableHead>Part Number</TableHead>
    <TableHead>Nama</TableHead>
    <TableHead className="text-center">Qty PR</TableHead>
    <TableHead className="text-center">Qty PO</TableHead>

    {isPurchasing && (
      <>
        <TableHead className="text-right">Harga</TableHead>
        <TableHead>Vendor</TableHead>
      </>
    )}
  </TableRow>
</TableHeader>



<TableBody>
  {pr?.details?.length ? (
    pr.details.map((item, index) => {
      const poDetail = po.details?.find(
        (d) => d.dtl_po_part_number === item.dtl_pr_part_number
      );

      return (
        <TableRow key={index} className="[&>td]:border">
          <TableCell className="text-center">
            {index + 1}
          </TableCell>

          <TableCell>{item.dtl_pr_part_number}</TableCell>
          <TableCell>{item.dtl_pr_part_name}</TableCell>

          <TableCell className="text-center">
            {item.dtl_pr_qty}
          </TableCell>

          <TableCell className="text-center">
            {poDetail?.dtl_po_qty ?? "-"}
          </TableCell>

          {isPurchasing && (
            <>
              <TableCell className="text-right">
                {poDetail?.dtl_po_harga
                  ? formatRupiah(poDetail.dtl_po_harga)
                  : "-"}
              </TableCell>

              <TableCell>
                {poDetail?.vendor?.vendor_name ?? "-"}
              </TableCell>
            </>
          )}
        </TableRow>
      );
    })
  ) : (
    <TableRow>
      <TableCell
        colSpan={isPurchasing ? 7 : 5}
        className="text-center text-muted-foreground"
      >
        Tidak ada barang
      </TableCell>
    </TableRow>
  )}
</TableBody>

            </Table>

               {po.signature_url && (
                <div className="hidden print:flex mt-16 justify-end px-8 pb-8">
                  <div className="text-center w-[220px]">
                    <p className="font-semibold mb-2">Tanda Tangan</p>
             <img
  src={`https://wms-warehouse-management-system.vercel.app/storage/${po.signature_url}`}
  alt="signature"
  className="h-28 mx-auto border-b-2 border-black"
/>

                    <p className="text-sm mt-2">{user?.nama ?? po.po_pic}</p>
                    {po.sign_at && (
                      <p className="text-xs text-muted-foreground">
                        {formatTanggal(new Date(po.sign_at))}
                      </p>
                    )}
                  </div>
                </div>
              )}
          </div>
        </div>
      </SectionBody>
    </SectionContainer>
  </WithSidebar>
);

}
