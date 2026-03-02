import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { toast } from "sonner";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
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

import { createSpbPo } from "@/services/spb";
import { getAllSpb } from "@/services/spb";
import type { Spb } from "@/types";
import { DatePicker } from "../date-picker";

interface CreateSpbPoFormProps {
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

export default function CreateSpbPoForm({ setRefresh }: CreateSpbPoFormProps) {
  const [open, setOpen] = useState(false);
  const [spbs, setSpbs] = useState<Spb[]>([]);
  const [selectedSpb, setSelectedSpb] = useState<Spb>();
  const [selectedParts, setSelectedParts] = useState<any[]>([]);
  const [so_date, setSoDate] = useState<Date | undefined>(undefined);
  const closed = isClosedDate(so_date);
  function formatDateLocal(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  /* =========================
     FETCH SPB (BELUM PO)
  ========================= */
  useEffect(() => {
    async function fetchSpb() {
      try {
        const res = await getAllSpb(); // WHERE po_no IS NULL
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
    if (!selectedParts) {
      toast.warning("Part harus dipilih");
      return;
    }

    const formData = new FormData(e.currentTarget);

    try {
      await createSpbPo({
        spb_id: selectedSpb.spb_id,
        po_no: formData.get("po_no") as string,
        so_no: formData.get("so_no") as string,
        // so_date: formData.get("so_date") as string,
        // so_date: so_date
        // ? so_date.toISOString().slice(0, 19).replace("T", " ")
        // : "",
        so_date: so_date ? formatDateLocal(so_date) : "",
        details: selectedParts.map(p => ({
          spb_dtl_id: p.spb_dtl_id
        }))
      });

      toast.success("PO berhasil di-attach ke SPB");
      setRefresh((prev) => !prev);
      setSelectedSpb(undefined);
      } catch (err: any) {
        console.error("Error creating PO SPB:", err);
        toast.error(
          err?.response?.data?.message ||
          err?.message ||
          "Gagal membuat Purchase Order"
        );
    }
  }

  return (
  <form
    onSubmit={handleSubmit}
    id="create-spb-po-form"
    className="grid grid-cols-12 gap-4"
  >
      {closed && (
          <div className="col-span-12 relative overflow-hidden rounded-xl border-[6px] border-red-700 bg-black">
            
            {/* STRIPE */}
            <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,rgba(255,0,0,0.5),rgba(255,0,0,0.5)_14px,rgba(0,0,0,0.7)_14px,rgba(0,0,0,0.7)_28px)] animate-pulse" />

            {/* CONTENT */}
            <div className="relative z-10 p-8 text-center space-y-3 text-red-100">
              <div className="text-4xl font-black tracking-widest uppercase">
                🚫 TRANSAKSI SPB-PO DITUTUP
              </div>

              <div className="text-lg font-semibold">
                SPB-DO TERKUNCI OLEH SISTEM
              </div>

              <div className="text-sm opacity-90">
                Periode SPB-PO sampai tanggal{" "}
                <span className="font-bold underline">
                  {so_date?.getDate()}
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
    {/* ================= ROW 1 ================= */}
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
            <CommandInput placeholder="Cari SPB..." />
            <CommandList>
              <CommandEmpty>Tidak ada SPB.</CommandEmpty>
              <CommandGroup>
                {spbs.map((spb) => (
                  <CommandItem
                    key={spb.spb_id}
                    value={spb.spb_no}
                    onSelect={() => {
                      setSelectedSpb(spb);
                      //setSelectedPart(undefined);
                      setSelectedParts(spb.details ?? []);
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
    <div className="col-span-12 lg:col-span-6 space-y-2">
      <Label>No PO<span className="text-red-500">*</span></Label>
      <Input name="po_no" required />
    </div>

    {/* ================= ROW 2 ================= */}
    <div className="col-span-12 lg:col-span-6 space-y-2">
      <Label>No SO<span className="text-red-500">*</span></Label>
      <Input name="so_no" />
    </div>

    <div className="col-span-12 lg:col-span-6 space-y-2">
      <Label>Tanggal SO<span className="text-red-500">*</span></Label>
      {/* //<Input type="date" name="so_date" /> */}
      <DatePicker value={so_date} onChange={setSoDate} />
    </div>
    <div className="col-span-12 mt-4">
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead className="w-[40px] text-center">No</TableHead>
        <TableHead>Part Number</TableHead>
        <TableHead>Part Name</TableHead>
        <TableHead className="text-center">Satuan</TableHead>
        <TableHead className="text-center">Qty</TableHead>
        <TableHead className="text-center">Aksi</TableHead>
      </TableRow>
    </TableHeader>

    <TableBody>
      {selectedParts.length > 0 ? (
        selectedParts.map((part, i) => (
          <TableRow key={i}>
            <TableCell className="text-center">{i + 1}</TableCell>

            <TableCell>{part.dtl_spb_part_number}</TableCell>

            <TableCell>{part.dtl_spb_part_name}</TableCell>

            <TableCell className="text-center">
              {part.dtl_spb_part_satuan}
            </TableCell>

            <TableCell className="text-center">
              {part.dtl_spb_qty}
            </TableCell>

            <TableCell className="text-center">
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={() =>
                  setSelectedParts(prev =>
                    prev.filter((_, idx) => idx !== i)
                  )
                }
              >
                Hapus
              </Button>
            </TableCell>
          </TableRow>
        ))
      ) : (
        <TableRow>
          <TableCell colSpan={6} className="text-center text-muted-foreground">
            Tidak ada part
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  </Table>
</div>
</fieldset>
  </form>
);
}
