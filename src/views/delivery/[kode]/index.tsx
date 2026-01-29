import SectionContainer, {
  SectionBody,
  SectionFooter,
  SectionHeader,
} from "@/components/content-container";
import WithSidebar from "@/components/layout/WithSidebar";
import type { DeliveryReceive, MRReceive } from "@/types";
import { useEffect, useState, useRef } from "react";
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
import {
  getDeliveryByKode,
  updateDelivery,
  downloadDeliveryPdf,
} from "@/services/delivery";
import { getMrByKode } from "@/services/material-request";
import { SetReadyToPickupDialog } from "@/components/dialog/edit-deliv-pickup";
import { DeliveryTimeline } from "@/views/delivery/delivery-timeline";
import { ConfirmDialog } from "@/components/dialog/edit-status-delivery";
import { ReceiveDeliveryDialog } from "@/components/dialog/edit-deliv-confirm";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { QRCodeCanvas } from "qrcode.react";
import { Printer } from "lucide-react";


type DeliveryStatus =
  | "packing"
  | "ready to pickup"
  | "on delivery"
  | "delivered";
  

export function DeliveryDetail() {
  
  const { kode } = useParams<{ kode: string }>();
  const { user } = useAuth();
  const [loadingDelivery, setLoadingDelivery] = useState(true);
  const [, setLoadingMr] = useState(true);

  const [dlvry, setdlvry] = useState<DeliveryReceive | null>(null);
  const [, setMr] = useState<MRReceive | null>(null);
  const [refresh, setRefresh] = useState(false);
  // const [loadingDelivery, setLoadingDelivery] = useState(true);
  // const [,setLoadingMr] = useState(true);

  const [openReceive, setOpenReceive] = useState(false);
  const [showSignature, setShowSignature] = useState(false);
  const [, setSignatureConfirmed] = useState(false);
  const toastShownRef = useRef(false);


  useEffect(() => {
    async function fetchDeliveryDetail() {
      setLoadingDelivery(true);
      try {
        const res = await getDeliveryByKode(kode!);
        setdlvry(res ?? null);
      } catch {
        setdlvry(null);
      } finally {
        setLoadingDelivery(false);
      }
    }

    if (kode) fetchDeliveryDetail();
  }, [kode, refresh]);

  useEffect(() => {
    async function fetchMrDetail() {
      if (!dlvry?.mr?.mr_kode) return;

      setLoadingMr(true);
      try {
        const res = await getMrByKode(dlvry.mr.mr_kode);
        setMr(res ?? null);
      } catch {
        setMr(null);
      } finally {
        setLoadingMr(false);
      }
    }

    fetchMrDetail();
  }, [dlvry]);

  useEffect(() => {
  if (!showSignature || !kode) return;

  const interval = setInterval(async () => {
    try {
      const res = await getDeliveryByKode(kode);

      if (res?.signed_penerima_sign && !toastShownRef.current) {
        toastShownRef.current = true;
        setdlvry(res);
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


  async function handleUpdateStatus(
    status: DeliveryStatus,
    pickupPlanAt?: string
  ) {
    if (!dlvry) {
      toast.error("Delivery tidak ditemukan.");
      return;
    }

    try {
      await updateDelivery(dlvry.dlv_kode, {
        status,
        pickup_plan_at: pickupPlanAt,
      });

      toast.success(`Status delivery diubah ke "${status}"`);
      setRefresh((p) => !p);
    } catch (error: any) {
      toast.error(error.message);
    }
  }

  if (loadingDelivery) {
    return (
      <WithSidebar>
        <SectionContainer span={12}>
          <SectionHeader>Memuat Detail Delivery...</SectionHeader>
          <SectionBody className="p-8 text-center">
            Memuat data...
          </SectionBody>
        </SectionContainer>
      </WithSidebar>
    );
  }

  if (!dlvry) {
    return (
      <WithSidebar>
        <SectionContainer span={12}>
          <SectionHeader>Delivery Tidak Ditemukan</SectionHeader>
        </SectionContainer>
      </WithSidebar>
    );
  }

  const isHandCarry = dlvry.dlv_ekspedisi === "Hand Carry";

  return (
    <WithSidebar>
      {showSignature && dlvry && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center print:hidden">
          <div className="bg-white p-6 rounded-md w-[350px] space-y-4 text-center">
            <h3 className="font-semibold text-lg">
              Scan untuk Tanda Tangan Delivery
            </h3>

            <QRCodeCanvas
              value={`http://192.168.21.144:5173/delivery/sign/${encodeURIComponent(
                dlvry.dlv_kode
              )}`}
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
      {/* ================= END QR MODAL ================= */}

      <SectionContainer span={12}>
        <SectionHeader>Detail Delivery: {dlvry.dlv_kode}</SectionHeader>

        <SectionBody className="grid grid-cols-12 gap-6">
          <div className="col-span-12">
            <DeliveryTimeline
              status={dlvry.dlv_status as
                | "pending"
                | "packing"
                | "ready to pickup"
                | "on delivery"
                | "delivered"}
              isHandCarry={isHandCarry}
            />
          </div>
          <div className="col-span-12 grid grid-cols-2 gap-4">
            <div>
              <Label>Status</Label>
              <p>{dlvry.dlv_status}</p>
            </div>
            <div>
              <Label>Ekspedisi</Label>
              <p>{dlvry.dlv_ekspedisi}</p>
            </div>
            <div>
              <Label>Dari Gudang</Label>
              <p>{dlvry.dlv_dari_gudang}</p>
            </div>
            <div>
              <Label>Ke Gudang</Label>
              <p>{dlvry.dlv_ke_gudang}</p>
            </div>
            <div>
              <Label>Dibuat</Label>
              <p>{formatTanggal(dlvry.created_at)}</p>
            </div>
          </div>
        </SectionBody>
       <SectionFooter className="flex flex-wrap items-center justify-start gap-3">
        {/* LEFT ACTIONS */}
        <div className="flex flex-wrap gap-2">
          {/* WAREHOUSE */}
          {user?.role === "warehouse" && dlvry.dlv_status === "pending" && (
            <ConfirmDialog
              text="Mulai Packing"
              onClick={() => handleUpdateStatus("packing")}
            />
          )}
          {user?.role === "warehouse" &&
            dlvry.dlv_status === "packing" &&
            !isHandCarry && (
              <SetReadyToPickupDialog
                dlvKode={dlvry.dlv_kode}
                refresh={() => setRefresh((p) => !p)}
              />
            )}
          {user?.role === "warehouse" &&
            dlvry.dlv_status === "delivered" &&
            dlvry.dlv_ke_gudang === user.lokasi &&
            !dlvry.signed_penerima_sign && (
              <Button variant="outline" onClick={() => setShowSignature(true)}>
                Tanda Tangan
              </Button>
            )}
          {/* LOGISTIK */}
          {user?.role === "logistik" &&
            dlvry.dlv_status === "ready to pickup" && (
              <ConfirmDialog
                text="Pickup Barang"
                onClick={() => handleUpdateStatus("on delivery")}
              />
            )}

          {/* USER */}
          {user?.role === "warehouse" &&
            dlvry.dlv_status === "on delivery" &&
            dlvry.dlv_ke_gudang === user.lokasi && (
              <Button onClick={() => setOpenReceive(true)}>
                Konfirmasi Barang Diterima
              </Button>
            )}
            {user?.role === "warehouse" &&
              isHandCarry &&
              dlvry.dlv_status === "packing" &&
              dlvry.dlv_ke_gudang === user.lokasi && (
                <Button onClick={() => setOpenReceive(true)}>
                  Konfirmasi Barang Diterima
                </Button>
            )}
        </div>
        {/* RIGHT ACTIONS */}
        <div className="flex items-center justify-between">
        {dlvry.signed_penerima_sign && (
          <Button
            variant="outline"
            size="icon"
            onClick={() => downloadDeliveryPdf(dlvry.dlv_kode)}
          >
            <Printer className="h-4 w-4" />
          </Button>
        )}
      </div>
      </SectionFooter>
      </SectionContainer>
      <ReceiveDeliveryDialog
        open={openReceive}
        setOpen={setOpenReceive}
        delivery={dlvry}
        onSuccess={() => setRefresh((p) => !p)}
      />

      <SectionContainer span={12}>
        <SectionHeader>Barang dari Referensi MR</SectionHeader>
        <SectionBody>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No</TableHead>
                <TableHead>Part Number</TableHead>
                <TableHead>Nama Part</TableHead>
                <TableHead>Qty Pending</TableHead>
                <TableHead>Qty On Delivery</TableHead>
                <TableHead>Qty Delivered</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dlvry?.details?.map((item, i) => (
                <TableRow key={i}>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell>{item.dtl_dlv_part_number}</TableCell>
                  <TableCell>{item.dtl_dlv_part_name}</TableCell>
                  <TableCell>{item.qty_pending}</TableCell>
                  <TableCell>{item.qty_on_delivery}</TableCell>
                  <TableCell>{item.qty_delivered}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </SectionBody>
      </SectionContainer>

    </WithSidebar>
  );
}
