import SectionContainer, {
  SectionBody,
  SectionFooter,
  SectionHeader,
} from "@/components/content-container";
import WithSidebar from "@/components/layout/WithSidebar";
import type { MRReceive, Stock } from "@/types";
import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
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
import { getMrByKode } from "@/services/material-request";
import { getAllStocks } from "@/services/stock";
import { Button } from "@/components/ui/button";
import { Printer, PenTool } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { QRCodeCanvas } from "qrcode.react";
import { downloadMrPdf } from "@/services/material-request";
import { EditMRDetailDialog } from "@/components/dialog/edit-mr";
import { CheckSquare2 } from "lucide-react";
import { approveMrDetail } from "@/services/material-request";
import { XCircle } from "lucide-react";
import { rejectMrDetail } from "@/services/material-request";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
const PUBLIC_URL =
  import.meta.env.VITE_PUBLIC_URL_LAN ||
  import.meta.env.VITE_PUBLIC_URL ||
  "http://localhost:8000";

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

  const mrKode = kode;
  const stateMr = (location.state as { mr?: MRReceive })?.mr;

  const { user } = useAuth();
  const isPpic = user?.role === "ppic";
const [refresh, setRefresh] = useState(false);

  const [mr, setMr] = useState<MRReceive | null>(stateMr ?? null);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [showSignature, setShowSignature] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
const canApprove = isPpic && mr?.sign_step === "done";
  /* ================= FETCH DATA ================= */
/* ================= POLLING SIGNATURE ================= */
// useEffect(() => {
//   async function fetchStock() {
//     try {
//       const res = await getAllStocks();
//       setStocks(res ?? []);
//     } catch {
//       console.error("Gagal ambil stock");
//     }
//   }
//   fetchStock();
// }, []);

    useEffect(() => {
      async function fetchStocks() {
      try {
        let page = 1;
        const limit = 15000;
        let lastPage = 1;

        do {
          const res = await getAllStocks(page, limit);

          setStocks(prev => [...prev, ...res.data]); // ⬅ update tiap page
          lastPage = res.last_page;

          // console.log("FETCH PAGE:", page);

          page++;
        } while (page <= lastPage);

      } catch (error) {
        console.error(error);
        toast.error("Gagal mengambil data stok barang");
      }
    }

    fetchStocks();
  }, []);
/* ================= FETCH MR SAAT HALAMAN DIBUKA ================= */
useEffect(() => {
  async function fetchMr() {
    try {
      const res = await getMrByKode(mrKode);
      if (res) setMr(res);
    } catch {
      toast.error("Gagal mengambil detail MR");
    }
  }

  fetchMr();
}, [mrKode, refresh]);


useEffect(() => {
  if (!mrKode) return;


  const interval = setInterval(async () => {
    try {

      const res = await getMrByKode(mrKode);
   
      if (!res) return;

      setMr((prev) => {
        if (!prev) return res;

        const changed =
          prev.signed_pengaju_sign !== res.signed_pengaju_sign ||
          prev.signed_gl_sign !== res.signed_gl_sign ||
          prev.sign_step !== res.sign_step;

        if (!changed) return prev;

if (res.sign_step === "done") {
  setShowSignature(false)
}

// stop polling hanya kalau DONE
if (res.sign_step === "done") {
  toast.success("Semua tanda tangan selesai. Siap print.");
  clearInterval(interval);
}
        return res;
      });
    } catch (err) {
      console.error("💥 Polling error:", err);
    }
  }, 2000);

  return () => {
    clearInterval(interval);
  };
}, [mrKode]);


const allowedSignRoles = ["warehouse", "gl_mekanik"];

const allowedSignStatus = ["pending"];
const canSign =
  user &&
  mr &&
  allowedSignRoles.includes(user.role) &&
  mr.sign_step === user.role &&
  allowedSignStatus.includes(mr.mr_status);


const canPrint =
  !!mr &&
  mr.details?.length > 0 &&
  mr.mr_status !== "pending";
  const handleDownloadPdf = async () => {
    if (!mr || isPrinting) return;

    try {
      setIsPrinting(true);
      downloadMrPdf(mr.mr_kode);
    } catch {
      toast.error("Gagal mengunduh PDF MR");
    } finally {
      setIsPrinting(false);
    }
  };

async function handleApprove(detailId: number) {
  try {
    await approveMrDetail(detailId);
    toast.success("Barang berhasil diapprove");
    setRefresh((prev) => !prev);
  } catch (err: any) {
    toast.error(err?.response?.data?.message || "Gagal approve");
  }
}

async function handleReject(detailId: number) {
  try {
    await rejectMrDetail(detailId);
    toast.success("Barang berhasil direject");
    setRefresh((prev) => !prev);
  } catch (err: any) {
    toast.error(err?.response?.data?.message || "Gagal reject");
  }
}
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

  /* ================= GET STOCK ================= */
  const getStockQty = (partNumber: string): number => {
    const stock = stocks.find(
      (s) =>
        s.barang?.part_number === partNumber &&
        s.stk_location?.toLowerCase() === mr.mr_lokasi?.toLowerCase()
    );
    return stock?.stk_qty ?? 0;
  };

  return (
    <WithSidebar>
      {/* ================= QR SIGN MODAL ================= */}
     {showSignature && mr.mr_status === "pending" && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center print:hidden">
          <div className="bg-white p-6 rounded-md w-[350px] space-y-4 text-center">
            <h3 className="font-semibold text-lg">Scan untuk Tanda Tangan</h3>

            <QRCodeCanvas
              value={`https://wms-lourdes.my.id/mr-sign/${encodeURIComponent(
                mr.mr_kode
              )}?name=${encodeURIComponent(user?.nama ?? "")}&role=${user?.role ?? ""}`}
              size={200}
            />

            <p className="text-sm text-muted-foreground">
              Setelah tanda tangan, dokumen akan siap di-print
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

      {/* ================= DETAIL MR ================= */}
      <SectionContainer span={12}>
        <SectionHeader>Detail Material Request: {mr.mr_kode}</SectionHeader>

        <SectionBody className="grid grid-cols-2 gap-4">
          <div>
            <Label>Kode MR</Label>
            <p>{mr.mr_kode}</p>
          </div>

          <div>
            <Label>PIC</Label>
            <p>{mr.mr_pic}</p>
          </div>

          <div>
            <Label>Lokasi</Label>
            <p>{mr.mr_lokasi}</p>
          </div>

          <div>
            <Label>Status</Label>
            <p>{mr.mr_status}</p>
          </div>

          <div>
            <Label>Tanggal MR</Label>
            <p>{formatTanggal(mr.mr_tanggal)}</p>
          </div>

          <div>
            <Label>Due Date</Label>
            <p>{formatTanggal(mr.mr_due_date)}</p>
          </div>
        </SectionBody>

        {/* ================= SIGN & PRINT ================= */}
        <SectionFooter className="flex gap-2">
          {canSign && (
            <Button
              size="icon"
              variant="outline"
              onClick={() => setShowSignature(true)}
            >
              <PenTool className="h-4 w-4" />
            </Button>
          )}

          {canPrint && (
            <Button
              size="sm"
              variant={mr.sign_step === "done" ? "destructive" : "outline"}
              onClick={handleDownloadPdf}
              disabled={isPrinting}
            >
              <Printer className="h-4 w-4 mr-2" />
              {mr.sign_step === "done" ? "" : "Preview PDF"}
            </Button>
          )}
        </SectionFooter>
      </SectionContainer>
{/* ================= TABLE BARANG ================= */}
<SectionContainer span={12}>
  <SectionHeader>Detail Barang</SectionHeader>

  <SectionBody className="grid grid-cols-12 gap-6">
    <div className="col-span-12 space-y-4">
      <div className="w-full border border-border rounded-sm overflow-x-auto no-page-break">
        <Table className="w-full border border-border border-collapse">
          <TableHeader>
           <TableRow className="[&>th]:border">
  {canApprove && (
    <TableHead className="w-[60px] text-center print:hidden">
      Approve/Reject
    </TableHead>
  )}
  <TableHead className="w-[50px] text-center">No</TableHead>
    
              <TableHead>Part Number</TableHead>
              <TableHead>Nama Part</TableHead>
              <TableHead>Satuan</TableHead>
              <TableHead>Prioritas</TableHead>
              <TableHead>Jumlah Permintaan</TableHead>
              <TableHead>Jumlah Diterima</TableHead>
              <TableHead>Stok Saat Ini</TableHead>
         {(user?.role === "warehouse" || user?.role === "superadmin")&& (
  <TableHead className="print:hidden">Aksi</TableHead>
)}
            </TableRow>
          </TableHeader>

          <TableBody>
            {mr.details && mr.details.length > 0 ? (
              mr.details.map((item, index) => {
                const stockQty = getStockQty(item.dtl_mr_part_number);

                return (
<TableRow key={item.dtl_mr_id}>

{canApprove && (
<TableCell className="text-center print:hidden">

  {/* APPROVED */}
  {Number(item.dtl_mr_approved) === 1 ? (
    <CheckSquare2 className="text-green-600 mx-auto" />
  ) : Number(item.dtl_mr_rejected) === 1 ? (

  /* REJECTED */
    <XCircle className="text-red-600 mx-auto" />

  ) : (

  /* PENDING */
    <div className="flex justify-center gap-2">

      {/* APPROVE */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button size="icon" variant="ghost">
            <CheckSquare2 className="text-green-600" />
          </Button>
        </AlertDialogTrigger>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Barang?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menyetujui barang ini?
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleApprove(Number(item.dtl_mr_id))}
            >
              Ya, Approve
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* REJECT */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button size="icon" variant="ghost">
            <XCircle className="text-red-600" />
          </Button>
        </AlertDialogTrigger>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Barang?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menolak barang ini?
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => handleReject(Number(item.dtl_mr_id))}
            >
              Ya, Reject
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  )}
</TableCell>
)}
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

{(user?.role === "warehouse" || user?.role === "superadmin") && (
  <TableCell className="print:hidden">
    <EditMRDetailDialog
      mrId={mr.mr_id!}
      detail={item}
      stocks={stocks}
      mrStatus={mr.mr_status}
      mrLokasi={mr.mr_lokasi}
      onSuccess={() => setRefresh(prev => !prev)}
    />
  </TableCell>
)}
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
      </div>
    </div>

    {/* ================= PRINT SIGNATURE ================= */}
    {(mr.signed_pengaju_sign || mr.signed_gl_sign) && (
      <div className="hidden print:flex mt-16 justify-between px-8 pb-8 col-span-12">
        {/* PENGAJU */}
        <div className="text-center w-[220px]">
          <p className="font-semibold mb-2">Pengaju</p>
          {mr.signed_pengaju_sign && (
            <img
              src={`${PUBLIC_URL}/storage/${mr.signed_pengaju_sign}`}
              className="h-24 mx-auto border-b border-black"
            />
          )}
          <p className="text-sm mt-2">{mr.signed_pengaju_name}</p>
        </div>

        {/* GL */}
        <div className="text-center w-[220px]">
          <p className="font-semibold mb-2">Mengetahui (GL Mekanik / PJO)</p>
          {mr.signed_gl_sign && (
            <img
              src={`${PUBLIC_URL}/storage/${mr.signed_gl_sign}`}
              className="h-24 mx-auto border-b border-black"
            />
          )}
          <p className="text-sm mt-2">{mr.signed_gl_name}</p>
        </div>
      </div>
    )}
  </SectionBody>
</SectionContainer>

    </WithSidebar>
  );
}