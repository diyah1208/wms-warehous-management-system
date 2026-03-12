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

import { createSpbDo, getAllSpb } from "@/services/spb";
import type { Spb } from "@/types";
import { DatePicker } from "../date-picker";

interface CreateSpbDoFormProps {
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
export default function CreateSpbDoForm({ setRefresh }: CreateSpbDoFormProps) {
  const [open, setOpen] = useState(false);
  const [spbs, setSpbs] = useState<Spb[]>([]);
  const [selectedPo, setSelectedPo] = useState<any>();
  const [selectedPoDetails, setSelectedPoDetails] = useState<any[]>([]);
  const [selectedSpb, setSelectedSpb] = useState<Spb | undefined>();
  const [do_date, setDodate] = useState<Date | undefined>(undefined);
  const closed = isClosedDate(do_date);

  function formatDateLocal(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}


  /* =========================
     FETCH SPB (SUDAH PO, BELUM DO) 
  ========================= */
  useEffect(() => {
    async function fetchSpb() {
      try {
        const res = await getAllSpb();
        //console.log("DATA SPB DARI API:", res);
        setSpbs(res);
      } catch {
        toast.error("Gagal mengambil data SPB");
      }
    }
    fetchSpb();
  }, []);
  useEffect(() => {
  // console.log("SELECTED SPB:", selectedSpb);
}, [selectedSpb]);

  /* =========================
     SUBMIT
  ========================= */
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!selectedPo) {
      toast.warning("PO harus dipilih");
      return;
    }
    

    const formData = new FormData(e.currentTarget);

    try {
      await createSpbDo({
        spb_po_id: selectedPo.spb_po_id,
        do_no: formData.get("do_no") as string,
        do_date: do_date ? formatDateLocal(do_date) : "",
        details: selectedPoDetails.map(p => ({
          spb_po_dtl_id: p.spb_po_dtl_id
        }))
      });

      toast.success("DO berhasil dibuat");
      setRefresh((prev) => !prev);
    } catch (err: any) {
        console.error("Error creating  SPB:", err);
        toast.error(
          err?.response?.data?.message ||
          err?.message ||
          "Gagal membuat Delivery Order"
        );
    }
  }

  return (
  <form
    onSubmit={handleSubmit}
    id="create-spb-do-form"
    className="grid grid-cols-12 gap-4"
  >
    {/* {closed && (
        <div className="col-span-12 relative overflow-hidden rounded-xl border-[6px] border-red-700 bg-black">
          
          <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,rgba(255,0,0,0.5),rgba(255,0,0,0.5)_14px,rgba(0,0,0,0.7)_14px,rgba(0,0,0,0.7)_28px)] animate-pulse" />

          <div className="relative z-10 p-8 text-center space-y-3 text-red-100">
            <div className="text-4xl font-black tracking-widest uppercase">
              🚫 TRANSAKSI SPB-DO DITUTUP
            </div>

            <div className="text-lg font-semibold">
              SPB-DO TERKUNCI OLEH SISTEM
            </div>

            <div className="text-sm opacity-90">
              Periode SPB-DO sampai tanggal{" "}
              <span className="font-bold underline">
                {do_date?.getDate()}
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
      > */}
    {/* ================= ROW 1 ================= */}
    <div className="col-span-12 lg:col-span-4 space-y-2">
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
                      //console.log("CLICK SPB:", spb); // debug
                    setSelectedSpb(spb);
                    setSelectedPo(undefined); // reset PO
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
    {(selectedSpb?.po?.length ?? 0) > 0 && (
      <div className="col-span-12 lg:col-span-4 space-y-2">
        <Label>Pilih PO</Label>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              {selectedPo ? selectedPo.po_no : "Pilih PO..."}
              <ChevronsUpDownIcon className="h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>

          <PopoverContent className="p-0">
            <Command>
              <CommandList>
                {(selectedSpb?.po ?? []).map((po:any) => (
                  <CommandItem
                    key={po.spb_po_id}
                    // onSelect={() => setSelectedPo(po)}
                    onSelect={() => {
                      // console.log("PO YANG DIPILIH:", po);
                      //   console.log("DETAILNYA:", po.details);
                      setSelectedPo(po);
                      setSelectedPoDetails(po.details ?? []);
                    }}
                    >
                    <CheckIcon
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedPo?.spb_po_id === po.spb_po_id
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    {po.po_no}
                  </CommandItem>
                ))}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    )}

    <div className="col-span-12 lg:col-span-4 space-y-2">
      <Label>No DO<span className="text-red-500">*</span></Label>
      <Input name="do_no" required />
    </div>

    <div className="col-span-12 lg:col-span-4 space-y-2">
      <Label>Tanggal DO<span className="text-red-500">*</span></Label>
      {/* <Input type="date" name="do_date" required /> */}
        {/* <DatePicker value={do_date} onChange={setDodate(undefined)}/> */}
        <DatePicker value={do_date} onChange={setDodate} />
    </div>
    {selectedPoDetails.length > 0 && (
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
        {selectedPoDetails.map((part, i) => (
          <TableRow key={i} className="border [&>*]:border">
            <TableCell>{i + 1}</TableCell>
            <TableCell>{part.spb_detail?.dtl_spb_part_number}</TableCell>
            <TableCell>{part.spb_detail?.dtl_spb_part_name}</TableCell>
            <TableCell>{part.spb_detail?.dtl_spb_part_satuan}</TableCell>
            <TableCell>{part.spb_detail?.dtl_spb_qty}</TableCell>

            <TableCell>
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={() =>
                  setSelectedPoDetails(prev =>
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
{/* </fieldset> */}

  </form>
);
}
