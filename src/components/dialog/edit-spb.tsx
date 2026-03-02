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
import { updateSpb } from "@/services/spb";
import type { Spb } from "@/types";

interface MyDialogProps {
  spb: any;
  refresh: Dispatch<SetStateAction<boolean>>;
}

export function EditSpbDialog({ spb, refresh }: MyDialogProps) {
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();


    const formData = new FormData(event.currentTarget);

    const payload = {
      spb_no_wo: formData.get("spb_no_wo") || null,
      spb_pic: formData.get("spb_pic") as string,
      spb_problem_remark: formData.get("spb_problem_remark") as string,
    };

    if (!spb.spb_id) {
      toast.error("SPB ID tidak ditemukan");
      return;
    }

    try {
      await updateSpb(Number(spb.spb_id), payload);

      toast.success("SPB berhasil diupdate");
      refresh((prev) => !prev);

    } catch (error) {
      toast.error("Gagal update SPB");
    }
  }

  return (
    <Dialog>
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
          <DialogTitle>Edit SPB</DialogTitle>
          <DialogDescription>
            Ubah informasi SPB.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} id="edit-spb-form">
          <div className="grid gap-4">

            {/* WO NO OPTIONAL */}
            <div className="grid gap-3">
              <Label htmlFor="spb_no_wo">WO No</Label>
              <Input
                id="spb_no_wo"
                name="spb_no_wo"
                defaultValue={spb.spb_no_wo ?? ""}
              />
            </div>

          </div>
        </form>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Batal</Button>
          </DialogClose>

          <Button
            className="!bg-green-600 hover:!bg-green-700 text-white"
            type="submit"
            form="edit-spb-form"
          >
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
