import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { UserDb } from "@/types";
import { LokasiList } from "@/types/enum";

import { toast } from "sonner";
import { updateUser } from "@/services/user";

import { Pencil } from "lucide-react";
import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";

interface EditUserDialogProps {
  user: UserDb;
  refresh: Dispatch<SetStateAction<boolean>>;
}

export function EditUserDialog({
  user,
  refresh,
}: EditUserDialogProps) {
  const [open, setOpen] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const nama = (formData.get("nama") as string) || user.nama;
    const role = (formData.get("role") as string) || user.role;
    const lokasi = (formData.get("lokasi") as string) || user.lokasi;

    // CEK PERUBAHAN
    if (
      nama === user.nama &&
      role === user.role &&
      lokasi === user.lokasi
    ) {
      toast.warning("Tidak ada perubahan yang dilakukan");
      return;
    }

    try {
      await updateUser({
        id: user.id,
        nama,
        role,
        lokasi,
      });

      toast.success("Data user berhasil diperbarui");
      refresh((prev) => !prev);
      setOpen(false);
    } catch (error) {
      toast.error("Gagal mengupdate data user");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* ===== TRIGGER ===== */}
      <DialogTrigger asChild>
        <Button variant="edit" size="sm">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Ubah informasi user seperti nama, role, dan lokasi.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} id="edit-user-form">
          <div className="grid gap-4">

            {/* NAMA */}
            <div className="grid gap-3">
              <Label>Nama<span className="text-red-500">*</span></Label>
              <Input
                name="nama"
                defaultValue={user.nama}
                required
              />
            </div>

            {/* EMAIL (IMMUTABLE) */}
            <div className="grid gap-3">
              <Label>Email</Label>
              <Input value={user.email} disabled />
            </div>

            {/* ROLE */}
            <div className="grid gap-3">
              <Label>Role<span className="text-red-500">*</span></Label>
              <Select name="role" defaultValue={user.role}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Daftar Role</SelectLabel>
                    <SelectItem value="direktur">Direktur</SelectItem>
                    <SelectItem value="manager">Manajer</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="warehouse">Warehouse</SelectItem>
                    {/* <SelectItem value="warehouse_ho">Warehouse HO</SelectItem>
                    <SelectItem value="warehouse_site">Warehouse Site</SelectItem> */}
                    <SelectItem value="purchasing">Purchasing</SelectItem>
                    <SelectItem value="logistik">Logistik</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="approver_mr">Approver MR</SelectItem>
                    <SelectItem value="spv">SPV Warehouse</SelectItem>
                    <SelectItem value="gl_mekanik">GL Mekanik/PJO</SelectItem>
                    <SelectItem value="partman_wh">Partman Warehouse</SelectItem>
                    <SelectItem value="ppic">PPIC</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* LOKASI */}
            <div className="grid gap-3">
              <Label>Lokasi<span className="text-red-500">*</span></Label>
              <Select name="lokasi" defaultValue={user.lokasi}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih lokasi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Daftar Lokasi</SelectLabel>
                    {LokasiList.map((lokasi) => (
                      <SelectItem
                        key={lokasi.nama}
                        value={lokasi.nama}
                      >
                        {lokasi.nama}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

          </div>
        </form>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="border-slate-300"
          >
            Batal
          </Button>

          <Button
            type="submit"
            form="edit-user-form"
            className="!bg-orange-600 hover:!bg-orange-700 text-white"
          >
            Edit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}