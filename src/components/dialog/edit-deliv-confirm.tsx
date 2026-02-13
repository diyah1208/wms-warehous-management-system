import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { deliveryReceive } from "@/services/delivery";
import type { DeliveryReceive } from "@/types";

interface ReceiveDeliveryDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  delivery: DeliveryReceive;
  onSuccess: () => void;
}

export function ReceiveDeliveryDialog({
  open,
  setOpen,
  delivery,
  onSuccess,
}: ReceiveDeliveryDialogProps) {
  const [loading, setLoading] = useState(false);

  const [items, setItems] = useState(
    delivery.details.map((d) => ({
      part_id: d.part_id,
      part_number: d.dtl_dlv_part_number,
      part_name: d.dtl_dlv_part_name,
      qty_on_delivery: d.qty_on_delivery,
      qty_received: d.qty_on_delivery, 
      receive_note: "", 
    }))
  );

  function handleQtyChange(index: number, value: number) {
    if (value < 0) return;

    setItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              qty_received: Math.min(value, item.qty_on_delivery),
            }
          : item
      )
    );
  }

  function handleNoteChange(index: number, value: string) {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, receive_note: value } : item
      )
    );
  }

  async function handleSubmit() {
    for (const item of items) {
      if (
        item.qty_received < 0 ||
        item.qty_received > item.qty_on_delivery
      ) {
        toast.error("Qty diterima tidak valid");
        return;
      }

      if (
        item.qty_received < item.qty_on_delivery &&
        !item.receive_note
      ) {
        toast.error(
          `Keterangan wajib diisi untuk part ${item.part_number}`
        );
        return;
      }
    }

    try {
      setLoading(true);

      await deliveryReceive(delivery.dlv_kode, {
        items: items.map((i) => ({
          part_id: i.part_id,
          qty_received: i.qty_received,
          receive_note: i.receive_note,
        })),
      });

      toast.success("Barang berhasil dikonfirmasi diterima");
      setOpen(false);
      onSuccess();
    } catch (error: any) {
      toast.error(
        error?.message ?? "Gagal konfirmasi penerimaan barang"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Konfirmasi Barang Diterima</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {items.map((item, index) => (
            <div
              key={item.part_id}
              className="grid grid-cols-12 gap-3 border rounded-md p-3"
            >
              {/* PART */}
              <div className="col-span-12 md:col-span-5">
                <Label>Part</Label>
                <div className="text-sm font-medium">
                  {item.part_number}
                </div>
                <div className="text-xs text-muted-foreground">
                  {item.part_name}
                </div>
              </div>

              {/* QTY DIKIRIM */}
              <div className="col-span-6 md:col-span-3">
                <Label>Qty Dikirim</Label>
                <Input value={item.qty_on_delivery} disabled />
              </div>

              {/* QTY DITERIMA */}
              <div className="col-span-6 md:col-span-4">
                <Label>Qty Diterima</Label>
                <Input
                  type="number"
                  min={0}
                  max={item.qty_on_delivery}
                  value={item.qty_received}
                  onChange={(e) =>
                    handleQtyChange(index, Number(e.target.value))
                  }
                />
              </div>

              {/* ✅ KETERANGAN (MUNCUL JIKA PARTIAL) */}
              {item.qty_received < item.qty_on_delivery && (
                <div className="col-span-12">
                  <Label>
                    Keterangan <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    placeholder="Contoh: Barang datang sebagian, sisa menyusul"
                    value={item.receive_note}
                    onChange={(e) =>
                      handleNoteChange(index, e.target.value)
                    }
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Batal
          </Button>

          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Menyimpan..." : "Simpan Penerimaan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
