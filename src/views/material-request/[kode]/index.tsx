// pages/material-request/[kode].tsx
import SectionContainer, {SectionBody,SectionFooter,SectionHeader,} from "@/components/content-container";
import WithSidebar from "@/components/layout/WithSidebar";
import type { MRReceive, Stock } from "@/types";
import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { Table,TableBody,TableCell,TableHead,TableHeader,TableRow,} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { formatTanggal } from "@/lib/utils";
import { getMrByKode, clearSignature } from "@/services/material-request";
import { getAllStocks } from "@/services/stock";
import { Button } from "@/components/ui/button";
import { Printer, PenTool } from "lucide-react";
import { EditMRDetailDialog } from "@/components/dialog/edit-mr";
import { useAuth } from "@/context/AuthContext";
import { QRCodeCanvas } from "qrcode.react";
import { downloadMrPdf } from "@/services/material-request";
import { mrDetailCache } from "@/services/mr-detail-cache";
import { stockCache } from "@/services/stock-cache";
import { useLocation } from "react-router-dom";

export function MaterialRequestDetail() {
  const { kode } = useParams<{ kode: string }>();
  const location = useLocation(); 
 if (!kode) {
    return (
      <WithSidebar>
        <SectionContainer span={12}>
          <SectionHeader>Detail Material Request</SectionHeader>
          <SectionBody className="p-8 text-center text-muted-foreground">
            Kode Material Request tidak ditemukan.
          </SectionBody>
        </SectionContainer>
      </WithSidebar>
    );
  }

 const mrKode = kode; // 🔒 FIXED STRING
const stateMr = (location.state as { mr?: MRReceive })?.mr;
  const { user } = useAuth();
  const [refresh, setRefresh] = useState<boolean>(false);
  const [showSignature, setShowSignature] = useState(false);
  const signatureToastShownRef = useRef(false);
  const [isPrinting, setIsPrinting] = useState(false);
const [mr, setMr] = useState<MRReceive | null>(
  mrDetailCache[mrKode] ?? stateMr ?? null
);

const [stocks, setStocks] = useState<Stock[]>(
  stockCache.data ?? []
);

useEffect(() => {
  if (stateMr && !mrDetailCache[mrKode]) {
    mrDetailCache[mrKode] = stateMr;
  }
}, [stateMr, mrKode]);

useEffect(() => {
  async function fetchDetail() {
    try {
      const [mrRes, stockRes] = await Promise.all([
        getMrByKode(mrKode),
        stockCache.data
          ? Promise.resolve(stockCache.data)
          : getAllStocks(),
      ]);

      if (mrRes) {
        mrDetailCache[mrKode] = mrRes;
        setMr(mrRes);
      }

      if (Array.isArray(stockRes)) {
        stockCache.data = stockRes;
        setStocks(stockRes);
      }
    } catch {
      toast.error("Gagal mengambil detail Material Request");
    }
  }

  fetchDetail();
}, [mrKode, refresh]);

useEffect(() => {
  if (!showSignature) return;
  if (signatureToastShownRef.current) return;

  const interval = setInterval(async () => {
    try {
      const res = await getMrByKode(kode);

      if (res?.signature_url && !signatureToastShownRef.current) {
        signatureToastShownRef.current = true; // 🔒 LOCK

        setMr(res);
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


  
  const getStockQty = (partNumber: string): { qty: number; stock: Stock | null } => {
    const stock = stocks.find(
      (s) =>
        s.barang?.part_number === partNumber &&
        s.stk_location?.toLowerCase() === mr?.mr_lokasi?.toLowerCase()
    );
    return {
      qty: stock?.stk_qty ?? 0,
      stock: stock || null,
    };
  };



const handleDownloadPdf = async () => {
  if (!mr || isPrinting) return;

  try {
    setIsPrinting(true);
    downloadMrPdf(mr.mr_kode);
    await clearSignature(kode);
    setRefresh((prev) => !prev);

  } catch (error) {
    toast.error("Gagal mengunduh PDF MR");
  } finally {
    setIsPrinting(false);
  }
};






  if (!mr) {
  return (
    <WithSidebar>
      <SectionContainer span={12}>
        <SectionHeader>Detail Material Request</SectionHeader>
        <SectionBody className="p-8 text-center text-muted-foreground">
          Data belum tersedia.
        </SectionBody>
      </SectionContainer>
    </WithSidebar>
  );
}


  if (!mr) {
    return (
      <WithSidebar>
        <SectionContainer span={12}>
          <SectionHeader>Material Request Tidak Ditemukan</SectionHeader>
          <SectionBody className="grid grid-cols-12 gap-2">
            <div className="col-span-12 flex items-center justify-center border border-dashed border-border rounded-sm p-8 text-muted-foreground text-lg">
              MR dengan kode "{kode}" tidak ditemukan.
            </div>
          </SectionBody>
          <SectionFooter>
            <p className="text-sm text-muted-foreground text-center w-full">
              Pastikan kode yang Anda masukkan benar.
            </p>
          </SectionFooter>
        </SectionContainer>
      </WithSidebar>
    );
  }

  return (
    <WithSidebar>
      {/* Modal QR Code untuk TTD */}
      {showSignature && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center print:hidden">
          <div className="bg-white p-6 rounded-md w-[350px] space-y-4 text-center">
            <h3 className="font-semibold text-lg">Scan untuk Tanda Tangan</h3>

            <QRCodeCanvas
              value={`https://wms-warehous-management-sys-git-677a6a-diyahs-projects-c79729ee.vercel.app/mr-sign/${encodeURIComponent(
                mr.mr_kode
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

      {/* Detail MR */}
      <SectionContainer span={12}>
        <SectionHeader>Detail Material Request: {mr.mr_kode}</SectionHeader>
        <SectionBody className="grid grid-cols-12 gap-6">
          {/* Informasi Umum MR */}
          <div className="col-span-12 space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2 mb-4">
              Informasi Umum
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-muted-foreground">Kode MR</Label>
                <p className="font-medium text-base">{mr.mr_kode}</p>
              </div>

              <div>
                <Label className="text-sm text-muted-foreground">PIC</Label>
                <p className="font-medium text-base">{mr.mr_pic}</p>
              </div>

              <div>
                <Label className="text-sm text-muted-foreground">Lokasi</Label>
                <p className="font-medium text-base">{mr.mr_lokasi}</p>
              </div>

              <div>
                <Label className="text-sm text-muted-foreground">Status</Label>
                <p className="font-medium text-base capitalize">{mr.mr_status}</p>
              </div>

              <div>
                <Label className="text-sm text-muted-foreground">
                  Tanggal MR
                </Label>
                <p className="font-medium text-base">
                  {formatTanggal(mr.mr_tanggal)}
                </p>
              </div>

              <div>
                <Label className="text-sm text-muted-foreground">Due Date</Label>
                <p className="font-medium text-base">
                  {formatTanggal(mr.mr_due_date)}
                </p>
              </div>

              <div>
                <Label className="text-sm text-muted-foreground">
                  Dibuat Pada
                </Label>
                <p className="font-medium text-base">
                  {mr.created_at ? formatTanggal(new Date(mr.created_at)) : "N/A"}
                </p>
              </div>

            <div>
                <Label className="text-sm text-muted-foreground">Terakhir Di Edit Oleh</Label>
                <p className="font-medium text-base">{mr.mr_last_edit_by}</p>
              </div>

              <div>
                <Label className="text-sm text-muted-foreground">
                  Terakhir Diedit Pada
                </Label>
                <p className="font-medium text-base">
                  {mr.mr_last_edit_at
                    ? formatTanggal(new Date(mr.mr_last_edit_at))
                    : "-"}
                </p>
              </div>
            </div>
          </div>
        </SectionBody>
<SectionFooter className="flex gap-2">
  {/* ✍️ TANDA TANGAN */}
  {!mr.signature_url && (
    <Button
  size="icon"
  variant="outline"
  onClick={() => {
    signatureToastShownRef.current = false; // 🔁 reset
    setShowSignature(true);
  }}
  title="Tanda Tangan"
>
  <PenTool className="h-4 w-4" />
</Button>

  )}

  {/* 🖨️ PRINT / EXPORT PDF */}
  {mr.signature_url && (
    <Button
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
</SectionFooter>

      </SectionContainer>

      {/* Tabel Detail Barang */}
      <SectionContainer span={12}>
        <SectionHeader>Detail Barang</SectionHeader>
        <SectionBody className="grid grid-cols-12 gap-6">
          <div className="col-span-12 space-y-4">
            <div className="w-full border border-border rounded-sm overflow-x-auto no-page-break">
              <Table className="w-full">
                <TableHeader>
                  <TableRow className="[&>th]:border">
                    <TableHead className="w-[50px] text-center">No</TableHead>
                    <TableHead>Part Number</TableHead>
                    <TableHead>Nama Part</TableHead>
                    <TableHead>Satuan</TableHead>
                    <TableHead>Prioritas</TableHead>
                    <TableHead>Jumlah Permintaan</TableHead>
                    <TableHead>Jumlah Diterima</TableHead>
                    <TableHead>Stok Saat Ini</TableHead>
                    <TableHead className="print:hidden">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mr.details && mr.details.length > 0 ? (
                    mr.details.map((item, index) => {
                      const { qty: stockQty } = getStockQty(item.dtl_mr_part_number);
                      // const isEditable =
                      //   mr.mr_status === "open" && item.dtl_mr_qty_received === 0;

                      return (
                        <TableRow key={item.dtl_mr_id} className="[&>td]:border">
                          <TableCell className="text-center">{index + 1}</TableCell>
                          <TableCell>{item.dtl_mr_part_number}</TableCell>
                          <TableCell>{item.dtl_mr_part_name}</TableCell>
                          <TableCell>{item.dtl_mr_satuan}</TableCell>
                          <TableCell>{item.dtl_mr_prioritas}</TableCell>
                          <TableCell>{item.dtl_mr_qty_request}</TableCell>
                          <TableCell>{item.dtl_mr_qty_received}</TableCell>
                          <TableCell
                            className={
                              stockQty < item.dtl_mr_qty_request
                                ? "text-red-600 font-semibold"
                                : ""
                            }
                          >
                            {stockQty}
                          </TableCell>
                          <TableCell className="print:hidden">
                            <div className="flex gap-2">
                              <EditMRDetailDialog
                                mrId={mr.mr_id!}
                                detail={item}
                                stocks={stocks}
                                mrStatus={mr.mr_status}
                                mrLokasi={mr.mr_lokasi}
                                onSuccess={() => setRefresh((prev) => !prev)}
                              />
                              {/* <Button
                                size="sm"
                                variant="destructive"
                                disabled={!isEditable}
                                onClick={() => handleDeleteDetail(item)}
                              >
                                <Trash2 size={16} />
                              </Button> */}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={9}
                        className="text-center text-muted-foreground"
                      >
                        Tidak ada barang dalam Material Request ini.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {/* Tanda Tangan untuk Print */}
              {mr.signature_url && (
                <div className="hidden print:flex mt-16 justify-end px-8 pb-8">
                  <div className="text-center w-[220px]">
                    <p className="font-semibold mb-2">Tanda Tangan</p>
             <img
  src={`https://wms-warehous-management-sys-git-677a6a-diyahs-projects-c79729ee.vercel.app/storage/${mr.signature_url}`}
  alt="signature"
  className="h-28 mx-auto border-b-2 border-black"
/>

                    <p className="text-sm mt-2">{user?.nama ?? mr.mr_pic}</p>
                    {mr.sign_at && (
                      <p className="text-xs text-muted-foreground">
                        {formatTanggal(new Date(mr.sign_at))}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </SectionBody>
        <SectionFooter></SectionFooter>
      </SectionContainer>
    </WithSidebar>
  );
}
