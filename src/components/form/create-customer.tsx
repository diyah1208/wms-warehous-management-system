import { type Dispatch, type SetStateAction, useRef, useState } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import type { MasterCustomer } from "@/types";
import { toast } from "sonner";
import { createMasterCustomer } from "@/services/customer";
import axios from "axios";

interface CreateCustomerFormProps {
  setRefresh: Dispatch<SetStateAction<boolean>>;
}

export default function CreateCustomerForm({
  setRefresh,
}: CreateCustomerFormProps) {
  const formRef = useRef<HTMLFormElement | null>(null);

  // ✅ STATE TELEPON
  const [telephone, setTelephone] = useState<string>("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = formRef.current;
    if (!form) return;

    const formData = new FormData(form);

    const customerNo = formData.get("customer_no") as string;
    const customerName = formData.get("customer_name") as string;
    const contactName = formData.get("contact_name") as string;

    if (!customerNo || !customerName) {
      toast.warning("No Customer dan Nama Customer wajib diisi!");
      return;
    }

    // ✅ VALIDASI TELEPON
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

    const payload: MasterCustomer = {
      customer_no: customerNo,
      customer_name: customerName,
      telephone,
      contact_name: contactName,
    };

    try {
      await createMasterCustomer(payload);

      toast.success("Data customer berhasil dibuat!");
      setRefresh((prev) => !prev);

      form.reset();
      setTelephone("");
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response?.status === 422) {
        const errors = error.response.data.errors;

        if (errors?.customer_no) toast.error(errors.customer_no[0]);
        if (errors?.customer_name) toast.error(errors.customer_name[0]);
        if (errors?.telephone) toast.error(errors.telephone[0]);

        return;
      }

      toast.error("Gagal membuat data customer");
      console.error(error);
    }
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      id="create-customer-form"
      className="grid grid-cols-12 gap-4"
    >
      {/* No Customer */}
      <div className="flex flex-col col-span-12 lg:col-span-3 gap-2">
        <Label>No Customer<span className="text-red-500">*</span></Label>
        <Input
          name="customer_no"
          placeholder="Input no customer"
          required
        />
      </div>

      {/* Nama Customer */}
      <div className="flex flex-col col-span-12 lg:col-span-5 gap-2">
        <Label>Nama Customer<span className="text-red-500">*</span></Label>
        <Input
          name="customer_name"
          placeholder="Input nama customer"
          required
        />
      </div>

      {/* Telepon */}
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
        <Label>Nama Kontak <span className="text-red-500">*</span></Label>
        <Input
          name="contact_name"
          placeholder="PIC customer"
        />
      </div>
    </form>
  );
}