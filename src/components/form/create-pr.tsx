import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { toast } from "sonner";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { getAllMr } from "@/services/material-request";
import type { MasterPart, MRReceive, PRItemReceive, PurchaseRequest, UserComplete, UserDb } from "@/types";
import { DatePicker } from "../date-picker";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Button } from "../ui/button";
import { LokasiList } from "@/types/enum";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { CheckIcon, ChevronsUpDownIcon, ClipboardPlus, Trash2 } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { cn } from "@/lib/utils";
import { getMasterParts } from "@/services/master-part";
import { AddItemPRDialog } from "../dialog/add-item-pr";
import { createPR } from "@/services/purchase-request";

interface CreatePRFormProps {
  user: UserComplete | UserDb;
  setRefresh: Dispatch<SetStateAction<boolean>>;
}

function toMysqlDatetime(date: Date) {
  return date.toISOString().slice(0, 19).replace("T", " ");
}

export default function CreatePRForm({ user, setRefresh }: CreatePRFormProps) {
  const [tanggalPR, setTanggalPR] = useState<Date | undefined>(new Date());
  const [prItems, setPRItems] = useState<PRItemReceive[]>([]);
  const [, setMrIncluded] = useState<string[]>([]);
const [kodePR, setKodePR] = useState<string>("");
  const [qty, setQty] = useState<number>(1);
  // Pencarian master part
  const [open2, setOpen2] = useState<boolean>(false);
  const [masterParts, setMasterParts] = useState<MasterPart[]>([]);
  const [mr, setMR] = useState<MRReceive[]>([]);
  const [filteredMr, setFilteredMR] = useState<MRReceive[]>([]);
  const [selectedPart, setSelectedPart] = useState<MasterPart>();
  const [selectedMr, setSelectedMr] = useState<MRReceive>();
// PART YANG TERSEDIA BERDASARKAN MR
const availableParts: MasterPart[] = selectedMr
  ? masterParts.filter(
      (part) =>
        part.part_id !== undefined &&
        selectedMr.details?.some(
          (d) => d.part_id === part.part_id
        )
    )
  : [];

  // Fetch master parts
  useEffect(() => {
    async function fetchMasterParts() {
      try {
        const parts = await getMasterParts();
        setMasterParts(parts);
      } catch (error) {
        if (error instanceof Error) {
          toast.error(`Gagal mengambil data master part: ${error.message}`);
        } else {
          toast.error("Terjadi kesalahan saat mengambil data master part.");
        }
      }
    }

    fetchMasterParts();
  }, []);

  // Fetch Mr
  useEffect(() => {
    async function fetchMR() {
      try {
        const mr = await getAllMr();
        setMR(mr);
        setFilteredMR(mr);
      } catch (error) {
        if (error instanceof Error) {
          toast.error(`Gagal mengambil data MR: ${error.message}`);
        } else {
          toast.error("Terjadi kesalahan saat mengambil data MR.");
        }
      }
    }

    fetchMR();
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (prItems.length === 0) {
      toast.error("Belum ada item untuk PR ini.");
      return;
    }
    if (!tanggalPR) {
      toast.error("Tanggal PR wajib diisi");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const kodePR = formData.get("kodePR") as string;

    const data: PurchaseRequest = {
      pr_kode: kodePR,
      pr_status: "open",
      pr_lokasi: user.lokasi,
      pr_pic: user.nama,
      pr_tanggal: toMysqlDatetime(tanggalPR),

      details: prItems.map((item) => ({
        part_id: item.part_id,
        mr_id: item.mr_id,  

        dtl_pr_part_number: item.dtl_pr_part_number,
        dtl_pr_part_name: item.dtl_pr_part_name,
        dtl_pr_satuan: item.dtl_pr_satuan,
        dtl_pr_qty: Number(item.dtl_pr_qty),
      })),

      created_at: toMysqlDatetime(new Date()),
      updated_at: toMysqlDatetime(new Date()),
    };

    try {
      const res = await createPR(data);
      if (res) {
        toast.success("Purchase Request berhasil dibuat.");
        setMrIncluded([]);
        setRefresh((prev) => !prev);
        setPRItems([]);
        setTanggalPR(new Date());
      } else {
        toast.error("Gagal membuat Purchase Request. Silakan coba lagi.");
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Gagal membuat PR! Kode PR tidak boleh sama.`);
      } else {
        toast.error("Terjadi kesalahan saat membuat PR.");
      }
      return;
    }
  }

function handleAddItem() {
  if (!selectedMr || !selectedMr.details) {
    toast.error("Pilih MR terlebih dahulu");
    return;
  }

  // 🔥 CEK: apakah MR ini sudah HABIS dipakai
  const isMrExhausted = prItems.some(
    (item) =>
      item.mr_id === selectedMr.mr_id &&
      (item.dtl_mr_qty_request ?? 0) > 0 &&
      item.dtl_pr_qty >= (item.dtl_mr_qty_request ?? 0)
  );

  if (isMrExhausted) {
    toast.error("MR ini sudah habis dan tidak bisa digunakan lagi");
    return;
  }

  const newItems: PRItemReceive[] = [];

  selectedMr.details.forEach((detail) => {
    const part = masterParts.find(
      (p) => p.part_id === detail.part_id
    );
    if (!part) return;

    // ❌ CEK DUPLIKAT PART DALAM MR YANG SAMA
    const isDuplicate = prItems.some(
      (item) =>
        item.mr_id === selectedMr.mr_id &&
        item.part_id === detail.part_id
    );

    if (isDuplicate) return;

    newItems.push({
      mr_id: selectedMr.mr_id,
      part_id: detail.part_id,
      dtl_pr_part_number: part.part_number,
      dtl_pr_part_name: part.part_name,
      dtl_pr_satuan: part.part_satuan,

      // 🔥 DEFAULT JUMLAH = 0 (USER WAJIB ISI)
      dtl_pr_qty: 0,

      // REFERENSI QTY MR
      dtl_mr_qty_request: detail.dtl_mr_qty_request,
      mr: selectedMr,
    });
  });

  if (newItems.length === 0) {
    toast.warning("Semua item dari MR ini sudah ditambahkan");
    return;
  }

  setPRItems((prev) => [...prev, ...newItems]);

  // 🔥 RESET MR SETELAH DIPAKAI
  setSelectedMr(undefined);

  toast.success("Item MR berhasil ditambahkan ke PR");
}


  function handleRemoveItem(index: number) {
    setPRItems((prevItems) => prevItems.filter((_, i) => i !== index));
    toast.success("Item berhasil dihapus dari daftar.");
  }

  return (
    <form
      onSubmit={handleSubmit}
      id="create-pr-form"
      className="grid grid-cols-12 gap-4"
    >
      <div className="flex flex-col col-span-12 lg:col-span-6 gap-4">
        {/* Kode PR */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="kodePR">Kode PR<span className="text-red-500">*</span></Label>
          <Input
  name="kodePR"
  placeholder="Input Kode PR"
  className="lg:tracking-wider"
  value={kodePR}
  onChange={(e) => setKodePR(e.target.value)}
  required
/>

        </div>

        {/* Tanggal PR */}
        <div className="flex flex-col gap-2">
          <Label>Tanggal PR<span className="text-red-500">*</span></Label>
          <div className="flex items-center">
            <DatePicker value={tanggalPR} onChange={setTanggalPR} />
          </div>
        </div>
      </div>

      <div className="flex flex-col col-span-12 lg:col-span-6 gap-4">
        {/* PIC */}
        <div className="flex flex-col gap-2">
          <Label>Person in Charge</Label>
          <div className="flex items-center">
            <Input value={user.nama} name="pic" disabled />
          </div>
        </div>

        {/* Lokasi */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="lokasi">Lokasi</Label>
          <div className="flex items-center">
            <Select required name="lokasi" value={user.lokasi} disabled>
              <SelectTrigger className="w-full" name="lokasi" id="lokasi">
                <SelectValue
                  placeholder={user.lokasi}
                  defaultValue={user.lokasi}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Daftar Lokasi</SelectLabel>
                  {LokasiList?.map((lokasi) => (
                    <SelectItem key={lokasi.kode} value={lokasi.nama}>
                      {lokasi.nama}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Tambah Item PR */}
      <div className="col-span-12 grid grid-cols-12 gap-4">
        {/* Combobox Referensi MR */}
        <Popover open={open2} onOpenChange={setOpen2}>
          <PopoverTrigger asChild>
            <Button
  variant="outline"
  role="combobox"
  aria-expanded={open2}
  disabled={!kodePR.trim()}   // ⬅️ KUNCI UTAMA
  className={cn("col-span-12 lg:col-span-8 justify-between")}
>

              {selectedMr
                ? `${mr.find((m: MRReceive) => m.mr_kode === selectedMr?.mr_kode)?.mr_kode} | Part: ${selectedPart?.part_number || 'Loading...'}`
                : "Pilih Material Request"}
              <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-(--radix-popover-trigger-width) p-0">
            <Command>
              <CommandInput placeholder="Pilih MR" />
              <CommandList>
                <CommandEmpty>Tidak ada.</CommandEmpty>
                <CommandGroup>
                  {filteredMr?.map((m) => (
                    <CommandItem
                      key={m.mr_kode}
                      value={m.mr_kode}
onSelect={(currentValue) => {
  const selectedMrData = mr.find(
    (mrItem) => mrItem.mr_kode === currentValue
  );

  if (!selectedMrData) {
    toast.error("MR tidak ditemukan");
    return;
  }

  setSelectedMr(selectedMrData);
  setOpen2(false);
}}


                    >
                      <CheckIcon
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedMr?.mr_kode === m.mr_kode
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      {`${m.mr_kode}`}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

<Button
  type="button"
  disabled={!kodePR.trim() || !selectedMr}
  onClick={handleAddItem}
  className="col-span-12 md:col-span-4
             !bg-green-600 hover:!bg-green-700 text-white"
>
  <ClipboardPlus className="h-4 w-4" />
  <span>Tambah Barang</span>
</Button>


      </div>

      {/* Item yang masuk PR */}
      <div className="col-span-12">
        <Table>
          <TableHeader>
            <TableRow className="border [&>*]:border">
              <TableHead className="w-[50px] font-semibold text-center">
                No
              </TableHead>
              <TableHead className="font-semibold text-center">
                Part Number
              </TableHead>
              <TableHead className="font-semibold text-center">
                Part Name
              </TableHead>
              <TableHead className="font-semibold text-center">
                Satuan
              </TableHead>
              {/* <TableHead className="font-semibold text-center">Qty PR</TableHead> */}
              <TableHead className="font-semibold text-center">Qty MR</TableHead>
              <TableHead className="font-semibold text-center">
                QTY PR
              </TableHead>
              <TableHead className="font-semibold text-center">
                Berdasarkan MR
              </TableHead>
              <TableHead className="font-semibold text-center">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {prItems.length > 0 ? (
              prItems?.map((item, index) => (
                <TableRow key={index} className="border [&>*]:border">
                  <TableCell className="w-[50px]">{index + 1}</TableCell>
                  <TableCell className="text-start">
                    {item.dtl_pr_part_number}
                  </TableCell>
                  <TableCell className="text-start">{item.dtl_pr_part_name}</TableCell>
                  <TableCell>{item.dtl_pr_satuan}</TableCell>
                  {/* <TableCell>{item.dtl_pr_qty}</TableCell> */}
                  <TableCell>{item.dtl_mr_qty_request}</TableCell>
<TableCell className="text-center">
  <Input
    type="number"
    min={1}
    className="w-24 mx-auto text-center"
    value={item.dtl_pr_qty}
    onChange={(e) => {
      const raw = e.target.value;
      if (raw === "") return;

      const value = Number(raw);
      const mrQty = item.dtl_mr_qty_request ?? 0;

      if (value < 1) return;

      // 🔥 VALIDASI UTAMA
      if (value > mrQty) {
        toast.error("Qty PR tidak boleh melebihi Qty MR");
        return;
      }

      setPRItems((prev) =>
        prev.map((it, i) =>
          i === index
            ? { ...it, dtl_pr_qty: value }
            : it
        )
      );
    }}
  />
</TableCell>


                  <TableCell>{item.mr?.mr_kode}</TableCell>
                  <TableCell>
                   <Button
  type="button"
  size="sm"
  variant="delete"
  onClick={() => handleRemoveItem(index)}
  className="flex items-center gap-2"
>
  <Trash2/>
</Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-muted-foreground"
                >
                  Tidak ada item MR.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </form>
  );
}