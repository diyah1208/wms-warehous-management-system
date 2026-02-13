import {
  type Dispatch,
  type SetStateAction,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { toast } from "sonner";
import axios from "axios";
import { ClipboardPlus, Trash2, Check, ChevronsUpDown } from "lucide-react";

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

import { createJobCosting } from "@/services/job-costing";
import { getAllStocks } from "@/services/stock";
import type { JobCostingPayload, MasterPart, Stock } from "@/types";
import { cn } from "@/lib/utils";
import { getMasterParts } from "@/services/master-part";


/* ================= TYPES ================= */

type JobCostingItemUI = {
  part_no: string;
  part_name: string;
  qty: number;
  unit: string;
};

interface Props {
  setRefresh: Dispatch<SetStateAction<boolean>>;
  createdBy: string;
  lokasiUser: string;
}

export default function CreateJobCostingForm({
  setRefresh,
  createdBy,
  lokasiUser,
}: Props)
 {
  const [batchNo, setBatchNo] = useState("");
  const [jcDate, setJcDate] = useState("");
  const [description, setDescription] = useState("");

  const [stocks, setStocks] = useState<Stock[]>([]);
  const [masterParts, setMasterParts] = useState<MasterPart[]>([]);

  const [items, setItems] = useState<JobCostingItemUI[]>([]);

  /* SELECT STATE */
  const [open, setOpen] = useState(false);
  const [selectedPart, setSelectedPart] = useState<MasterPart | null>(null);
const [openFinish, setOpenFinish] = useState(false);
const [selectedFinishPart, setSelectedFinishPart] = useState<MasterPart | null>(null);

  /* ================= FETCH STOCK ================= */
useEffect(() => {
  getMasterParts()
    .then((data) => {
      console.log("MASTER PART API:", data);
      setMasterParts(data);
    })
    .catch(() => toast.error("Gagal ambil master part"));
}, []);

  useEffect(() => {
    getAllStocks()
      .then(setStocks)
      .catch(() => toast.error("Gagal ambil stock"));
  }, []);

  /* ================= PERFORMANCE MAP ================= */

  const partMap = useMemo(() => {
    const map = new Map<string, MasterPart>();
    masterParts.forEach((p) => map.set(p.part_number, p));
    return map;
  }, [masterParts]);

  const stockMap = useMemo(() => {
    const map = new Map<string, Stock>();
    stocks.forEach((s) => {
      map.set(`${s.part_id}_${s.stk_location}`, s);
    });
    return map;
  }, [stocks, lokasiUser]);

  // function getStockByPartNo(partNo: string) {
  //   const part = partMap.get(partNo);
  //   if (!part) return undefined;
  //   return stockMap.get(`${part.part_id}_${lokasiUser}`);
  // }
function getStockByPartNo(partNo: string) {
  const part = partMap.get(partNo);

  console.log("PART:", part);
  console.log("lokasiUser:", lokasiUser);

  const relatedStocks = stocks.filter(
    (s) => s.part_id === part?.part_id
  );

  console.log("STOCK PART IN ALL LOCATION:", relatedStocks);

  const stock = stockMap.get(`${part?.part_id}_${lokasiUser}`);

  console.log("FINAL STOCK:", stock);

  return stock;
}

  /* ================= ADD ITEM ================= */

  function addItem() {
    if (!selectedPart) return toast.error("Pilih barang");

    const stock = getStockByPartNo(selectedPart.part_number);

    if (!stock || stock.stk_qty <= 0)
      return toast.error("Stock tidak mencukupi");

    if (items.some((i) => i.part_no === selectedPart.part_number))
      return toast.error("Barang sudah ditambahkan");

    setItems((p) => [
      ...p,
      {
        part_no: selectedPart.part_number,
        part_name: selectedPart.part_name,
        qty: 1,
        unit: selectedPart.part_satuan,
      },
    ]);

    setSelectedPart(null);
  }

  function removeItem(i: number) {
    setItems((p) => p.filter((_, x) => x !== i));
  }

  function updateQty(i: number, v: number) {
    setItems((p) =>
      p.map((x, y) => (y === i ? { ...x, qty: v } : x))
    );
  }

  /* ================= SUBMIT ================= */

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!batchNo || !jcDate || !description)
      return toast.error("Form belum lengkap");

    for (const item of items) {
      const stock = getStockByPartNo(item.part_no);
      if (!stock || item.qty > stock.stk_qty)
        return toast.error(`Stock ${item.part_no} kurang`);
    }

    const payload: JobCostingPayload = {
      batch_no: batchNo,
      jc_date: jcDate,
      description,
      created_by: createdBy,
      lokasi: lokasiUser, 
      items: items.map((i) => ({
        part_no: i.part_no,
        qty: i.qty,
        unit: i.unit,
        item_description: description,
      })),
    };

    try {
      await createJobCosting(payload);
      toast.success("Job Costing berhasil");

      setRefresh((p) => !p);
      setBatchNo("");
      setJcDate("");
      setDescription("");
      setItems([]);
    } catch (e) {
      if (axios.isAxiosError(e))
        toast.error(e.response?.data?.message ?? "Gagal simpan");
    }
  }

  /* ================= UI ================= */
console.log("MASTER PARTS:", masterParts);

  return (
    <form onSubmit={handleSubmit} id="jobcosting-form" className="space-y-6">
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-6">
          <Label>No Job Costing<span className="text-red-500">*</span></Label>
          <Input placeholder="Masukkan no job costing" value={batchNo} onChange={(e) => setBatchNo(e.target.value)} />
        </div>

        <div className="col-span-6">
          <Label>Tanggal<span className="text-red-500">*</span></Label>
          <Input type="date" value={jcDate} onChange={(e) => setJcDate(e.target.value)} />
        </div>
      </div>

      {/* ================= PILIH BARANG (SPB STYLE) ================= */}
      <div className="grid grid-cols-12 gap-4">
      {/* BARANG */}
      <div className="col-span-6">
        <Label>Barang<span className="text-red-500">*</span></Label>

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-between overflow-hidden"
            >
              <span className="truncate text-left">
                {selectedPart
                  ? `${selectedPart.part_number} - ${selectedPart.part_name}`
                  : "Pilih barang"}
              </span>

              <ChevronsUpDown className="h-4 w-4 opacity-50 shrink-0" />
            </Button>
          </PopoverTrigger>

          <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
            <Command>
              <CommandInput placeholder="Cari part..." />
              <CommandList>
                <CommandEmpty>Tidak ada part.</CommandEmpty>
                <CommandGroup>
                  {masterParts.map((part) => (
                    <CommandItem
                      key={part.part_number}
                      onSelect={() => {
                        setSelectedPart(part);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedPart?.part_number === part.part_number
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      {part.part_number} | {part.part_name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

{/* FINISH PART */}
<div className="col-span-6">
  <Label>Finish Part<span className="text-red-500">*</span></Label>

  <Popover open={openFinish} onOpenChange={setOpenFinish}>
    <PopoverTrigger asChild>
      <Button
        variant="outline"
        className="w-full justify-between overflow-hidden"
      >
        <span className="truncate text-left">
          {selectedFinishPart
            ? `${selectedFinishPart.part_number} - ${selectedFinishPart.part_name}`
            : "Pilih finish part"}
        </span>

        <ChevronsUpDown className="h-4 w-4 opacity-50 shrink-0" />
      </Button>
    </PopoverTrigger>

    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
      <Command>
        <CommandInput placeholder="Cari finish part..." />
        <CommandList>
          <CommandEmpty>Tidak ada part.</CommandEmpty>
          <CommandGroup>
            {masterParts.map((part) => (
              <CommandItem
                key={part.part_number}
                onSelect={() => {
                  setSelectedFinishPart(part);
                  setOpenFinish(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selectedFinishPart?.part_number === part.part_number
                      ? "opacity-100"
                      : "opacity-0"
                  )}
                />
                {part.part_number} | {part.part_name}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </PopoverContent>
  </Popover>
</div>

        {/* KETERANGAN */}
        <div className="col-span-6">
          <Label>Keterangan<span className="text-red-500">*</span></Label>
          <Input
          placeholder="Masukkan keterangan" 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </div>

      <Button type="button" onClick={addItem} className="w-full !bg-green-600">
        <ClipboardPlus className="mr-2 h-4 w-4" /> Tambah Barang
      </Button>

      {/* ================= TABLE ================= */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>No</TableHead>
            <TableHead>Part</TableHead>
            <TableHead>Nama</TableHead>
            <TableHead>Qty</TableHead>
            <TableHead>Unit</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Aksi</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {items.map((i, idx) => (
            <TableRow key={idx}>
              <TableCell>{idx + 1}</TableCell>
              <TableCell>{i.part_no}</TableCell>
              {/* <TableCell className="max-w-[250px] break-words whitespace-normal">{i.part_name}</TableCell> */}
              {/* <TableCell>{i.part_name}</TableCell> */}
              <TableCell>
                <div className="w-[260px] whitespace-normal break-words">
                  {i.part_name}
                </div>
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  min={1}
                  value={i.qty}
                  onChange={(e) => updateQty(idx, Number(e.target.value))}
                />
              </TableCell>
              <TableCell>{i.unit}</TableCell>
              <TableCell>{getStockByPartNo(i.part_no)?.stk_qty ?? 0}</TableCell>
              <TableCell>
                <Button size="icon" variant="destructive" onClick={() => removeItem(idx)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </form>
  );
}