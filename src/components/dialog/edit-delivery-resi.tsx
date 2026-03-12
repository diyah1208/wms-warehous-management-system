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
import { Pencil } from "lucide-react";

import { toast } from "sonner";
import { useState, type Dispatch, type SetStateAction } from "react";
import { updateDeliveryResi } from "@/services/delivery";
import type { DeliveryReceive } from "@/types";

interface Props {
  delivery: DeliveryReceive;
  refresh: Dispatch<SetStateAction<boolean>>;
}

export function EditDeliveryResiDialog({ delivery, refresh }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const noResi = formData.get("dlv_no_resi")?.toString() || null;

    try {
      setLoading(true);

      await updateDeliveryResi(delivery.dlv_kode, {
        dlv_no_resi: noResi,
      });

      toast.success("No resi berhasil diperbarui");
      refresh((prev) => !prev);
      setOpen(false);

    } catch (error: any) {
      toast.error(error?.message ?? "Gagal update no resi");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="text-blue-600 hover:text-blue-700"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit No Resi</DialogTitle>
          <DialogDescription>
            Input atau ubah nomor resi pengiriman.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} id="edit-resi-form">
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="dlv_no_resi">No Resi (Opsional)</Label>
              <Input
                id="dlv_no_resi"
                name="dlv_no_resi"
                defaultValue={delivery.dlv_no_resi ?? ""}
                placeholder="Masukkan nomor resi"
              />
            </div>
          </div>
        </form>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={loading}>
              Batal
            </Button>
          </DialogClose>

          <Button
            type="submit"
            form="edit-resi-form"
            disabled={loading}
            className="!bg-green-600 hover:!bg-green-700 text-white"
          >
            {loading ? "Menyimpan..." : "Simpan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}