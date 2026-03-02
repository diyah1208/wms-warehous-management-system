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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Pencil } from "lucide-react";

import type { MasterPart } from "@/types";
import { toast } from "sonner";
import { useState, type Dispatch, type SetStateAction } from "react";
import { updateMasterPart } from "@/services/master-part";

interface MyDialogProps {
  part: MasterPart;
  refresh: Dispatch<SetStateAction<boolean>>;
}
const Satuan = [
  "PCS",
  "EACH",
  "UNIT",
  "BOX",
  "METER",
  "LUSIN",
  "LITER",
  "PACK",
  "SET",
  "PASANG",
  "ROL",
  "RIM",
  "LEMBAR",
  "CM",
  "JRG",
  "KG",
  "MONTH",
  "YEAR",
].sort();

export function EditPartDialog({ part, refresh }: MyDialogProps) {
  const [open, setOpen] = useState(false);
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const payload = {
      part_number: formData.get("part_number") as string,
      part_name: formData.get("part_name") as string,
      part_satuan: formData.get("part_satuan") as string,
      part_description: formData.get("part_description") as string,
    };

    if (!part.part_id) {
      toast.error("Part ID tidak ditemukan");
      return;
    }

    try {
      const res = await updateMasterPart(Number(part.part_id), payload);

      if (res) {
        toast.success("Data part berhasil diupdate");
        refresh((prev) => !prev);
         setOpen(false); 
      } else {
        toast.error("Gagal update data part!");
      }

    } catch (error) {
      toast.error("Terjadi kesalahan saat update data part");
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

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Part</DialogTitle>
          <DialogDescription>
            Ubah informasi data master part.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} id="edit-part-form">
          <div className="grid gap-4">

            {/* Part Number */}
            <div className="grid gap-3">
              <Label htmlFor="part_number">Part Number</Label>
              <Input
                id="part_number"
                name="part_number"
                defaultValue={part.part_number}
              />
            </div>

            {/* Part Name */}
            <div className="grid gap-3">
              <Label htmlFor="part_name">Part Name</Label>
              <Input
                id="part_name"
                name="part_name"
                defaultValue={part.part_name}
              />
            </div>
            {/* Part Name */}
            <div className="grid gap-3">
              <Label htmlFor="part_description">Part Deskripsi</Label>
              <Input
                id="part_description"
                name="part_description"
                defaultValue={part.part_description}
              />
            </div>

            {/* Part Satuan */}
            <div className="grid gap-3">
              <Label htmlFor="part_satuan">Satuan</Label>
              <Select name="part_satuan" required>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih satuan" />
              </SelectTrigger>
              <SelectContent>
                {Satuan.map((satuan) => (
                  <SelectItem key={satuan} value={satuan}>
                    {satuan}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            </div>

          </div>
        </form>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Batal</Button>
          </DialogClose>

          <Button 
          className="!bg-green-600 hover:!bg-green-700 text-white"
          type="submit" form="edit-part-form">
            Simpan
          </Button>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
}
