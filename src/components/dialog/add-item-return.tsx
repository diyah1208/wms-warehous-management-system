import React, { useState, useMemo, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import type { SpbDetail } from "@/types";

interface AddItemReturnSpbDialogProps {
  selectedItem: SpbDetail | undefined;
  onAddItem: (item: SpbDetail, qty: number) => void;
  triggerButton: React.ReactNode;
}

export function AddItemReturnSpbDialog({
  selectedItem,
  onAddItem,
  triggerButton,
}: AddItemReturnSpbDialogProps) {
  const [qty, setQty] = useState<number>(1);
  const [open, setOpen] = useState(false);

  // ================= SISA QTY =================
  const sisaQty = useMemo(() => {
    if (!selectedItem) return 0;

    return (
      selectedItem.dtl_spb_qty -
      (selectedItem.dtl_spb_qty_returned ?? 0)
    );
  }, [selectedItem]);

  // ================= RESET SAAT DIALOG BUKA =================
  useEffect(() => {
    if (open) {
      setQty(1);
    }
  }, [open]);

  // ================= SAVE =================
  function handleSave() {
    if (!selectedItem) {
      toast.error("Item belum dipilih");
      return;
    }

    if (qty <= 0) {
      toast.error("Qty harus lebih dari 0");
      return;
    }

    if (qty > sisaQty) {
      toast.error(`Qty melebihi sisa (${sisaQty})`);
      return;
    }

    onAddItem(selectedItem, qty);

    setQty(1);
    setOpen(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        // Cegah buka dialog kalau item belum dipilih
        if (val && !selectedItem) {
          toast.error("Pilih item terlebih dahulu");
          return;
        }
        setOpen(val);
      }}
    >
      <DialogTrigger asChild>
        {triggerButton}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Tambah Item Return SPB</DialogTitle>
          <DialogDescription>
            Masukkan jumlah barang yang akan dikembalikan
          </DialogDescription>
        </DialogHeader>

        {!selectedItem ? (
          <div className="text-center text-sm text-muted-foreground py-6">
            Silakan pilih item terlebih dahulu
          </div>
        ) : (
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label>Part Number</Label>
              <Input value={selectedItem.dtl_spb_part_number ?? "-"} disabled />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Nama Part</Label>
              <Input value={selectedItem.dtl_spb_part_name ?? "-"} disabled />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Satuan</Label>
              <Input value={selectedItem.dtl_spb_part_satuan ?? "-"} disabled />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Qty Keluar</Label>
              <Input value={selectedItem.dtl_spb_qty ?? 0} disabled />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Sudah Return</Label>
              <Input
                value={selectedItem.dtl_spb_qty_returned ?? 0}
                disabled
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Sisa Return</Label>
              <Input value={sisaQty} disabled />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Qty Return</Label>
              <Input
                type="number"
                min={1}
                max={sisaQty}
                value={qty}
                onChange={(e) =>
                  setQty(Number(e.target.value) || 0)
                }
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            disabled={!selectedItem}
            className="!bg-green-600 hover:!bg-green-700 text-white"
            onClick={handleSave}
          >
            Tambah
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}