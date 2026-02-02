import React, { useState } from "react";
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
import type { MasterPart, Part } from "@/types";

interface AddItemPeminjamanDialogProps {
   selectedPart: MasterPart | undefined;
   onAddItem: (part: MasterPart, qty: number) => void;
   triggerButton: React.ReactNode;
}

export function AddItemPeminjamanDialog({
  selectedPart,
  onAddItem,
  triggerButton,
}: AddItemPeminjamanDialogProps) {
  const [qty, setQty] = useState<number>(1);
  const [open, setOpen] = useState(false);

  function handleSave() {
    if (!selectedPart) {
      toast.error("Part belum dipilih");
      return;
    }

    if (qty <= 0) {
      toast.error("Qty harus lebih dari 0");
      return;
    }

    onAddItem(selectedPart, qty);

    setQty(1);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{triggerButton}</DialogTrigger>

      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Tambah Item Peminjaman</DialogTitle>
          <DialogDescription>
            Masukkan jumlah barang yang akan dipinjam
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="flex flex-col gap-2">
            <Label>Part Number</Label>
            <Input value={selectedPart?.part_number} disabled />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Nama Part</Label>
            <Input value={selectedPart?.part_name} disabled />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Satuan</Label>
            <Input value={selectedPart?.part_satuan} disabled />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Qty</Label>
            <Input
              type="number"
              min={1}
              value={qty}
              onChange={(e) => setQty(Number(e.target.value) || 0)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            className="!bg-green-600 hover:!bg-green-700 text-white"
            type="button"
            onClick={handleSave}
          >
            Tambah
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
