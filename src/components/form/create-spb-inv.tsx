import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { toast } from "sonner";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";

import { createSpbInvoice, getAllSpb, getAllSpbDo } from "@/services/spb";
import type { Spb, SpbDo } from "@/types";

interface CreateSpbInvoiceFormProps {
  setRefresh: Dispatch<SetStateAction<boolean>>;
}

export default function CreateSpbInvoiceForm({
  setRefresh,
}: CreateSpbInvoiceFormProps) {
  const [open, setOpen] = useState(false);
  const [spbs, setSpbs] = useState<Spb[]>([]);
  const [selectedSpb, setSelectedSpb] = useState<Spb | undefined>();
  const [openDo, setOpenDo] = useState(false);
  const [dos, setDos] = useState<SpbDo[]>([]);
  const [selectedDo, setSelectedDo] = useState<SpbDo | undefined>();

  useEffect(() => {
  async function fetchDo() {
    try {
      const res = await getAllSpbDo();
      setDos(res);
    } catch {
      toast.error("Gagal mengambil data DO");
    }
  }

  fetchDo();
}, []);


  useEffect(() => {
    async function fetchSpb() {
      try {
        const res = await getAllSpb();
        setSpbs(res);
      } catch {
        toast.error("Gagal mengambil data SPB");
      }
    }
    fetchSpb();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!selectedSpb) {
      toast.warning("SPB harus dipilih");
      return;
    }

    const formData = new FormData(e.currentTarget);

    try {
      await createSpbInvoice({
        spb_id: selectedSpb.spb_id,
        spb_do_id: selectedDo?.spb_do_id,
        invoice_no: formData.get("invoice_no") as string,
        invoice_date: formData.get("invoice_date") as string,
        invoice_email_date:
          (formData.get("invoice_email_date") as string) || undefined,
      });

      toast.success("Invoice berhasil dibuat");
      setRefresh((prev) => !prev);
      setSelectedSpb(undefined);
    } catch (err: any) {
        console.error("Error creating Invoice SPB:", err);
        toast.error(
          err?.response?.data?.message ||
          err?.message ||
          "Gagal membuat Invoice"
        );
    }
  }

return (
  <form
    onSubmit={handleSubmit}
    id="create-spb-invoice-form"
    className="grid grid-cols-12 gap-4"
  >
    {/* PILIH SPB */}
    <div className="col-span-12 lg:col-span-6 space-y-2">
      <Label>Pilih SPB<span className="text-red-500">*</span></Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className="w-full justify-between"
          >
            {selectedSpb ? selectedSpb.spb_no : "Pilih SPB..."}
            <ChevronsUpDownIcon className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="p-0">
          <Command>
            <CommandInput placeholder="Cari No SPB..." />
            <CommandList>
              <CommandEmpty>Tidak ada SPB.</CommandEmpty>
              <CommandGroup>
                {spbs.map((spb) => (
                  <CommandItem
                    key={spb.spb_id}
                    value={spb.spb_no}
                    onSelect={() => {
                      setSelectedSpb(spb);
                      setOpen(false);
                    }}
                  >
                    <CheckIcon
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedSpb?.spb_id === spb.spb_id
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    {spb.spb_no}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
    {/* PILIH DO */}
    <div className="col-span-12 lg:col-span-6 space-y-2">
      <Label>
        Pilih DO<span className="text-red-500">*</span>
      </Label>

      <Popover open={openDo} onOpenChange={setOpenDo}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className="w-full justify-between"
          >
            {selectedDo ? selectedDo.do_no : "Pilih DO..."}
            <ChevronsUpDownIcon className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="p-0">
          <Command>
            <CommandInput placeholder="Cari No DO..." />
            <CommandList>
              <CommandEmpty>Tidak ada DO.</CommandEmpty>
              <CommandGroup>
                {dos.map((doItem) => (
                  <CommandItem
                    key={doItem.spb_do_id}
                    value={doItem.do_no}
                    onSelect={() => {
                      setSelectedDo(doItem);
                      setOpenDo(false);
                    }}
                  >
                    <CheckIcon
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedDo?.spb_do_id === doItem.spb_do_id
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    {doItem.do_no}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
    {/* NO INVOICE */}
    <div className="col-span-12 lg:col-span-6 space-y-2">
      <Label>No Invoice<span className="text-red-500">*</span></Label>
      <Input name="invoice_no" required />
    </div>

    {/* TANGGAL INVOICE */}
    <div className="col-span-12 lg:col-span-6 space-y-2">
      <Label>Tanggal Invoice<span className="text-red-500">*</span></Label>
      <Input type="date" name="invoice_date" required />
    </div>

    {/* TANGGAL EMAIL INVOICE */}
    <div className="col-span-12 lg:col-span-6 space-y-2">
      <Label>Tanggal Email Invoice<span className="text-red-500">*</span></Label>
      <Input type="date" name="invoice_email_date" />
    </div>
  </form>
);
}
