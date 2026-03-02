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
import { Button } from "../ui/button";
import type { POReceive, UpdatePOPayload } from "@/types";
import { toast } from "sonner";
import type { Dispatch, SetStateAction } from "react";
import { updatePO } from "@/services/purchase-order";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";
import { useState } from "react";
import { Pencil } from "lucide-react";

interface MyDialogProps {
  po: POReceive;
  refresh: Dispatch<SetStateAction<boolean>>;
}

export function EditPODialog({ po, refresh }: MyDialogProps) {
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const payload: UpdatePOPayload = {
      po_status: formData.get("status") as "pending" | "purchased",
      po_detail_status: formData.get("detail_status") as string, // ✅ SUB STATUS
      po_keterangan: formData.get("keterangan") as string,
    };

    try {
      await updatePO(po.po_id!, payload);
      toast.success("Data PO berhasil diupdate");
      refresh((prev) => !prev);
    } catch (error) {
      toast.error("Gagal mengupdate PO");
    }
  }
const [status, setStatus] = useState<"pending" | "purchased">(
  po.po_status as "pending" | "purchased"
);

  return (
    <Dialog>
      <DialogTrigger asChild>
       <Button variant="edit" size="sm" className="flex items-center gap-4">
  <Pencil className="h-4 w-4" />
</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit PO</DialogTitle>
          <DialogDescription>
            Ubah status dan detail status PO.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} id="edit-po-form">
          <div className="grid gap-4">

            {/* Status Utama */}
            <div className="grid gap-3">
              <Label>Status PO</Label>
            <Select
  name="status"
  value={status}
  onValueChange={(val) => setStatus(val as "pending" | "purchased")}
  required
>

                <SelectTrigger>
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Status</SelectLabel>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="purchased">Purchased</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* SUB STATUS */}
 <div className="grid gap-3">
  <Label>Detail Status</Label>
  <Select
    name="detail_status"
    required
    defaultValue={po.po_detail_status || ""}
  >
    <SelectTrigger>
      <SelectValue placeholder="Pilih detail status" />
    </SelectTrigger>

    <SelectContent>
      <SelectGroup>
        <SelectLabel>Detail Status</SelectLabel>

        {/* PENDING */}
        {status === "pending" && (
          <>
            <SelectItem value="OPEN 3A">
              OPEN 3A – Barang belum dikirim (No Payment Issue)
            </SelectItem>
            <SelectItem value="OPEN 3B">
              OPEN 3B – Barang belum dikirim (Ada Payment Issue)
            </SelectItem>
          </>
        )}

        {/* PURCHASED */}
        {status === "purchased" && (
          <SelectItem value="OPEN 4">
            OPEN 4 – Barang sudah dikirim, belum sampai WH
          </SelectItem>
        )}
      </SelectGroup>
    </SelectContent>
  </Select>
</div>


            {/* Keterangan */}
            <div className="grid gap-3">
              <Label>Keterangan</Label>
              <Textarea
                name="keterangan"
                placeholder="Masukkan keterangan..."
                defaultValue={po.po_keterangan || ""}
              />
            </div>
          </div>
        </form>

<DialogFooter>
  <DialogClose asChild>
    <Button variant="outline">Batalkan</Button>
  </DialogClose>

  <DialogClose asChild>
    <Button
      type="submit"
      form="edit-po-form"
      className="!bg-orange-600 hover:!bg-orange-700 text-white"
    >
      Edit
    </Button>
  </DialogClose>
</DialogFooter>

      </DialogContent>
    </Dialog>
  );
}