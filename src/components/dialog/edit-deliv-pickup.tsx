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
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useState } from "react";
import { updateDelivery } from "@/services/delivery"; 


interface SetReadyToPickupDialogProps {
  dlvKode: string;
  refresh: () => void;
}

export function SetReadyToPickupDialog({
  dlvKode,
  refresh,
}: SetReadyToPickupDialogProps) {
  const [pickupPlanAt, setPickupPlanAt] = useState("");

  async function handleSubmit() {
    if (!pickupPlanAt) {
      toast.warning("Tanggal pickup wajib diisi");
      return;
    }

    try {
      await updateDelivery(dlvKode, {
        status: "ready to pickup",
        pickup_plan_at: pickupPlanAt,
      });

      toast.success("Pickup plan berhasil diset");
      refresh();
    } catch (error: any) {
      toast.error(error.message ?? "Gagal set pickup plan");
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-blue-500 hover:bg-blue-600 text-white">
          Set Ready to Pickup
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Set Jadwal Pickup</DialogTitle>
          <DialogDescription>
            Tentukan tanggal dan jam pickup barang.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label>Tanggal & Jam Pickup</Label>
            <Input
              type="datetime-local"
              value={pickupPlanAt}
              onChange={(e) => setPickupPlanAt(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Batal</Button>
          </DialogClose>
          <Button onClick={handleSubmit}>
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
