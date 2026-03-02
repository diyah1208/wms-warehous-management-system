import { useState,useRef  } from "react";
import { type Dispatch, type SetStateAction } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import type { MasterPart } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { toast } from "sonner";
import { createMasterPart } from "@/services/master-part";
import QRCode from "qrcode";

interface CreateMRFormProps {
  setRefresh: Dispatch<SetStateAction<boolean>>;
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

export default function CreateMasterPartForm({
  setRefresh,
}: CreateMRFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setQrCode(null);

    const formData = new FormData(formRef.current!);

    const partNumber = formData.get("part_number") as string;
    const partName = formData.get("part_name") as string;
    const satuan = formData.get("part_satuan") as string;
    const desk = formData.get("part_description") as string;

    if (!partNumber || !partName || !satuan || !desk) {
      toast.warning("Semua field harus diisi!");
      return;
    }

    try {
      const data = {
        part_name: partName,
        part_number: partNumber,
        part_satuan: satuan,
        part_description: desk,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } satisfies MasterPart;

      const res = await createMasterPart(data);

      if (res) {
        const qr = await QRCode.toDataURL(partNumber);
        setQrCode(qr);

        toast.success("Master part berhasil dibuat!");
        setRefresh(prev => !prev);
        formRef.current?.reset();
      }
    } catch (error: any) {
      if (error?.response?.status === 422) {
        const msg =
          error.response.data?.errors?.part_number?.[0] ||
          error.response.data?.message ||
          "Kode sudah digunakan";

        toast.error(msg);
        return;
      }

      toast.error("Terjadi kesalahan server");
    }
  }

  return (
  <div className="grid grid-cols-12 gap-6">
    {/* FORM */}
    <form
    ref={formRef}
      onSubmit={handleSubmit}
      id="create-master-part-form"
      className="col-span-12 grid grid-cols-12 gap-4"
    >
      {/* Part Number */}
      <div className="col-span-12 md:col-span-4 flex flex-col gap-1">
        <Label>Part Number</Label>
        <Input
          name="part_number"
          placeholder="Input part number"
          required
        />
      </div>

      {/* Part Name */}
      <div className="col-span-12 md:col-span-5 flex flex-col gap-1">
        <Label>Part Name</Label>
        <Input
          name="part_name"
          placeholder="Input part name"
          required
        />
      </div>

      {/* Satuan */}
      <div className="col-span-12 md:col-span-3 flex flex-col gap-1">
        <Label>Satuan</Label>
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
      {/* Part Desk */}
      <div className="col-span-12 md:col-span-5 flex flex-col gap-1">
        <Label>Part Desc</Label>
        <Input
          name="part_description"
          placeholder="Input part description"
          required
        />
      </div>
    </form>

    {/* QR PREVIEW */}
    {qrCode && (
      <div className="col-span-12 flex flex-col items-center gap-2 pt-4 border-t">
        <Label className="text-sm text-muted-foreground">
          QR Code (Part Number)
        </Label>
        <img
          src={qrCode}
          alt="QR Code"
          className="w-36 h-36 border rounded-md"
        />
      </div>
    )}
  </div>
);
}
