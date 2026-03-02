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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

import { createSpbInvoice, getAllSpb, getAllSpbDo } from "@/services/spb";
import type { Spb, SpbDo } from "@/types";
import { DatePicker } from "../date-picker";

interface CreateSpbInvoiceFormProps {
  setRefresh: Dispatch<SetStateAction<boolean>>;
}
  const CLOSING_DAY = 5;

  function isClosedDate(date?: Date) {
    if (!date) return false;

    const closingDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      CLOSING_DAY,
      0, 0, 0
    );

    return date <= closingDate;
  }

export default function CreateSpbInvoiceForm({
  setRefresh,
}: CreateSpbInvoiceFormProps) {
  const [open, setOpen] = useState(false);
  const [spbs, setSpbs] = useState<Spb[]>([]);
  const [selectedSpb, setSelectedSpb] = useState<Spb | undefined>();
  const [openDo, setOpenDo] = useState(false);
  const [selectedDo, setSelectedDo] = useState<any>();
  const [dos, setDos] = useState<SpbDo[]>([]);
  const [invDate, setinvDate] = useState<Date | undefined>(undefined);
  const closed = isClosedDate(invDate);
  const [invoiceEmailDate, setInvoiceEmailDate] = useState<Date | undefined>();
  const [selectedDoDetails, setSelectedDoDetails] = useState<any[]>([]);
  function formatDateLocal(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

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

    if (!selectedDo) {
      toast.warning("DO harus dipilih");
      return;
    }

    const formData = new FormData(e.currentTarget);

    try {
      await createSpbInvoice({
      spb_do_id: selectedDo.spb_do_id,
      invoice_no: formData.get("invoice_no") as string,
      // invoice_date: invDate
      //   ? invDate.toISOString().slice(0, 19).replace("T", " ")
      //   : "",
      invoice_date: invDate ? formatDateLocal(invDate) : "",
      // invoice_email_date:
      //   (formData.get("invoice_email_date") as string) || undefined,
      invoice_email_date: invoiceEmailDate
      ? formatDateLocal(invoiceEmailDate)
      : undefined,

      details: selectedDoDetails.map((d:any) => ({
        spb_do_dtl_id: d.spb_do_dtl_id
      }))
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
  // const filteredDos = selectedSpb
  // ? dos.filter((d) => d.spb_id === selectedSpb.spb_id)
  // : [];
  // const filteredDos = selectedSpb
  // ? dos.filter((d) => d.spb_do_id === selectedSpb.spb_id)
  // : [];
  // const filteredDos = selectedSpb
  // ? dos.filter((d) => Number(d.spb_id) === Number(selectedSpb.spb_id))
  // : [];
  // const filteredDos = selectedSpb
  // ? dos.filter((d: any) =>
  //     Number(d.spb_id ?? d.spb?.spb_id ?? d.spbId) ===
  //     Number(selectedSpb.spb_id)
  //   )
  // : [];
  const filteredDos = selectedSpb
  ? dos.filter((d:any) =>
      Number(d.po?.spb_id) === Number(selectedSpb.spb_id)
    )
  : [];
return (
  <form
    onSubmit={handleSubmit}
    id="create-spb-invoice-form"
    className="grid grid-cols-12 gap-4"
  >
    {closed && (
        <div className="col-span-12 relative overflow-hidden rounded-xl border-[6px] border-red-700 bg-black">
          
          {/* STRIPE */}
          <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,rgba(255,0,0,0.5),rgba(255,0,0,0.5)_14px,rgba(0,0,0,0.7)_14px,rgba(0,0,0,0.7)_28px)] animate-pulse" />

          {/* CONTENT */}
          <div className="relative z-10 p-8 text-center space-y-3 text-red-100">
            <div className="text-4xl font-black tracking-widest uppercase">
              🚫 TRANSAKSI SPB-INVOICE DITUTUP
            </div>

            <div className="text-lg font-semibold">
              SPB-INVOICE TERKUNCI OLEH SISTEM
            </div>

            <div className="text-sm opacity-90">
              Periode SPB-INVOICE sampai tanggal{" "}
              <span className="font-bold underline">
                {invDate?.getDate()}
              </span>{" "}
              sudah ditutup
            </div>
          </div>
        </div>
      )}
      <fieldset
        disabled={closed}
        className={`col-span-12 grid grid-cols-12 gap-4 ${
          closed ? "opacity-50" : ""
        }`}
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
                      setSelectedDo(undefined);
                      setSelectedDoDetails([]);
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
    {filteredDos.length > 0 && (
      <div className="col-span-12 lg:col-span-6 space-y-2">
        <Label>Pilih DO *</Label>

        <Popover open={openDo} onOpenChange={setOpenDo}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              {selectedDo?.do_no ?? "Pilih DO..."}
              <ChevronsUpDownIcon className="h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>

          <PopoverContent className="p-0">
            <Command>
              <CommandEmpty>Tidak ada DO.</CommandEmpty>
              <CommandGroup>
                {filteredDos.map((doItem) => (
                  <CommandItem
                    key={doItem.spb_do_id}
                    onSelect={() => {
                      setSelectedDo(doItem);
                      setSelectedDoDetails(doItem.details ?? []);
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
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    )}
    {/* NO INVOICE */}
    <div className="col-span-12 lg:col-span-6 space-y-2">
      <Label>No Invoice<span className="text-red-500">*</span></Label>
      <Input name="invoice_no" required />
    </div>

    {/* TANGGAL INVOICE */}
    <div className="col-span-12 lg:col-span-6 space-y-2">
      <Label>Tanggal Invoice<span className="text-red-500">*</span></Label>
      {/* <Input type="date" name="invoice_date" required /> */}
      <DatePicker value={invDate} onChange={setinvDate} />
    </div>

    {/* TANGGAL EMAIL INVOICE */}
    <div className="col-span-12 lg:col-span-6 space-y-2">
      <Label>Tanggal Email Invoice<span className="text-red-500">*</span></Label>
      {/* <Input type="date" name="invoice_email_date" /> */}
      <DatePicker value={invoiceEmailDate} onChange={setInvoiceEmailDate} />
    </div>
    {selectedDoDetails.length > 0 && (
      <div className="col-span-12">
        {selectedDoDetails.length > 0 && (
          <div className="col-span-12">
            <Table>
              <TableHeader>
                <TableRow className="border [&>*]:border">
                  <TableHead>No</TableHead>
                  <TableHead>Part Number</TableHead>
                  <TableHead>Part Name</TableHead>
                  <TableHead>Satuan</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {selectedDoDetails.map((part, i) => (
                  <TableRow key={part.spb_do_dtl_id} className="border [&>*]:border">
                    <TableCell>{i + 1}</TableCell>

                    <TableCell>
                      {part.po_detail?.spb_detail?.dtl_spb_part_number}
                    </TableCell>

                    <TableCell>
                      {part.po_detail?.spb_detail?.dtl_spb_part_name}
                    </TableCell>

                    <TableCell>
                      {part.po_detail?.spb_detail?.dtl_spb_part_satuan}
                    </TableCell>

                    <TableCell>
                      {part.po_detail?.spb_detail?.dtl_spb_qty}
                    </TableCell>

                    <TableCell>
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={() =>
                          setSelectedDoDetails(prev =>
                            prev.filter((_, idx) => idx !== i)
                          )
                        }
                      >
                        Hapus
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                </TableBody>
            </Table>
          </div>
        )}
      </div>
    )}
    </fieldset>
  </form>
);
}
