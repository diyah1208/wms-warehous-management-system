import { type Dispatch, type SetStateAction, useRef, useState } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import type { MasterVendor } from "@/types";
import { toast } from "sonner";
import { createMasterVendor } from "@/services/vendor";
import axios from "axios";

interface CreateVendorFormProps {
  setRefresh: Dispatch<SetStateAction<boolean>>;
}

export default function CreateVendorForm({
  setRefresh,
}: CreateVendorFormProps) {
  const formRef = useRef<HTMLFormElement | null>(null);

  // ✅ STATE TELEPON (WAJIB)
  const [telephone, setTelephone] = useState<string>("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = formRef.current;
    if (!form) return;

    const formData = new FormData(form);

    const vendorNo = formData.get("vendor_no") as string;
    const vendorName = formData.get("vendor_name") as string;
    const contactName = formData.get("contact_name") as string;

    if (!vendorNo || !vendorName) {
      toast.warning("No Vendor dan Nama Vendor wajib diisi!");
      return;
    }

    // ✅ VALIDASI TELEPON (FINAL SAFETY)
    if (telephone) {
      if (!/^[0-9]+$/.test(telephone)) {
        toast.error("Nomor telepon hanya boleh angka");
        return;
      }

       if (telephone.length < 8 || telephone.length > 13) {
    toast.error("Nomor telepon harus 8-13 digit");
    return;
  }
    }

    const payload: MasterVendor = {
      vendor_no: vendorNo,
      vendor_name: vendorName,
      telephone,
      contact_name: contactName,
    };

    try {
      await createMasterVendor(payload);

      toast.success("Data vendor berhasil dibuat!");
      setRefresh((prev) => !prev);

      form.reset();
      setTelephone(""); // ✅ reset state
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response?.status === 422) {
        const errors = error.response.data.errors;

        if (errors?.vendor_no) toast.error(errors.vendor_no[0]);
        if (errors?.vendor_name) toast.error(errors.vendor_name[0]);
        if (errors?.telephone) toast.error(errors.telephone[0]);

        return;
      }

      toast.error("Gagal membuat data vendor");
      console.error(error);
    }
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      id="create-vendor-form"
      className="grid grid-cols-12 gap-4"
    >
      {/* No Vendor */}
      <div className="flex flex-col col-span-12 lg:col-span-3 gap-2">
        <Label>No Vendor<span className="text-red-500">*</span></Label>
        <Input
          name="vendor_no"
          placeholder="Input no vendor"
          required
        />
      </div>

      {/* Nama Vendor */}
      <div className="flex flex-col col-span-12 lg:col-span-5 gap-2">
        <Label>Nama Vendor<span className="text-red-500">*</span></Label>
        <Input
          name="vendor_name"
          placeholder="Input nama vendor"
          required
        />
      </div>

      {/* Telepon (NUMERIC ONLY) */}
      <div className="flex flex-col col-span-12 lg:col-span-2 gap-2">
        <Label>Telepon<span className="text-red-500">*</span></Label>
        <Input
          name="telephone"
          value={telephone}
          onChange={(e) => {
            const onlyNumber = e.target.value.replace(/\D/g, "");
            setTelephone(onlyNumber.slice(0, 13));
          }}
          inputMode="numeric"
          placeholder="08xxxxxxxx"
        />
      </div>

      {/* Nama Kontak */}
      <div className="flex flex-col col-span-12 lg:col-span-2 gap-2">
        <Label>Nama Kontak<span className="text-red-500">*</span></Label>
        <Input
          name="contact_name"
          placeholder="PIC vendor"
        />
      </div>
    </form>
  );
}