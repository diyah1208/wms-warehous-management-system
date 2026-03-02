import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import type { Stock } from "@/types";
import { toast } from "sonner";
import { useState, type Dispatch, type SetStateAction } from "react";
import { Pencil } from "lucide-react";
import { saveStock } from "@/services/stock";

interface MyDialogProps {
  onSubmit?: () => void;
  stock: Stock;
  refresh: Dispatch<SetStateAction<boolean>>;
}

export function EditStockDialog({ stock, refresh }: MyDialogProps) {
  const [open, setOpen] = useState(false);
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    

    const formData = new FormData(event.currentTarget);
    const min = formData.get("stk_min") as string;
    const max = formData.get("stk_max") as string;
    const qty = formData.get("stk_qty") as string;

    if (!stock.stk_id) {
      toast.error("Stock tidak ditemukan");
      return;
    }

    try {
      const res = await saveStock({
        part_id: Number(stock.part_id),
        stk_location: stock.stk_location,
        stk_qty: parseInt(qty, 10),
        stk_min: parseInt(min, 10),
        stk_max: parseInt(max, 10),
      });

      if (res) {
        toast.success("Data stock berhasil diupdate");
        refresh((prev) => !prev);
        setOpen(false);
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Gagal mengupdate stock: ${error.message}`);
      } else {
        toast.error("Gagal mengupdate stock");
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="text-orange-600 hover:text-orange-700"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Stock</DialogTitle>
          <DialogDescription>
            Ubah informasi stock yang dipilih.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} id="edit-stock-form">
          {/* GRID 2 KOLOM */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Part Number */}
            <div className="grid gap-2">
              <Label htmlFor="part_number">Part Number</Label>
              <Input
                id="part_number"
                name="part_number"
                defaultValue={stock.barang.part_number}
                disabled
              />
            </div>

            {/* Part Name */}
            <div className="grid gap-2">
              <Label htmlFor="part_name">Part Name</Label>
              <Input
                id="part_name"
                name="part_name"
                defaultValue={stock.barang.part_name}
                disabled
              />
            </div>

            {/* Lokasi Gudang – FULL WIDTH */}
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="stk_location">Lokasi Gudang</Label>
              <Input
                id="stk_location"
                name="stk_location"
                defaultValue={stock.stk_location}
                disabled
              />
            </div>

            {/* Min Stock */}
            <div className="grid gap-2">
              <Label htmlFor="stk_min">Min Stock</Label>
              <Input
                id="stk_min"
                name="stk_min"
                defaultValue={stock.stk_min}
              />
            </div>

            {/* Max Stock */}
            <div className="grid gap-2">
              <Label htmlFor="stk_max">Max Stock</Label>
              <Input
                id="stk_max"
                name="stk_max"
                defaultValue={stock.stk_max}
              />
            </div>

            {/* Qty Stock – FULL WIDTH */}
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="stk_qty">Qty Stock</Label>
              <Input
                id="stk_qty"
                name="stk_qty"
                defaultValue={stock.stk_qty}
              />
            </div>

          </div>
        </form>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Batalkan</Button>
          </DialogClose>
          <Button 
          className="!bg-green-600 hover:!bg-green-700 text-white"
          type="submit" form="edit-stock-form">
            Edit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
