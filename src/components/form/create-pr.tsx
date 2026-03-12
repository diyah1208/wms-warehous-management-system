import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { toast } from "sonner";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { getAllMr } from "@/services/material-request";
import type {
  MasterPart,
  MRReceive,
  PRItemReceive,
  PurchaseRequest,
  UserComplete,
  UserDb,
} from "@/types";
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
import {
  CheckIcon,
  ChevronsUpDownIcon,
  ClipboardPlus,
  Trash2,
} from "lucide-react";
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
import { createPR } from "@/services/purchase-request";

interface CreatePRFormProps {
  user: UserComplete | UserDb;
  setRefresh: Dispatch<SetStateAction<boolean>>;
}

// ✅ FIX STRING: helper pembanding ID
const sameId = (a: any, b: any) => String(a) === String(b);

 function toMysqlDatetime(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

const CLOSING_DAY = 5;

function isClosedDate(dlvDate?: Date) {
  if (!dlvDate) return false;

  const today = new Date();

  // mulai tutup tepat jam 00:00 tanggal 5
  const closingStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    5,
    0, 0, 0
  );

  // kalau sekarang masih sebelum tgl 5 → belum closing
  if (today < closingStart) return false;

  // kalau sudah tanggal 5 atau lewat:
  // semua tanggal <= tanggal 5 DIKUNCI
  return dlvDate <= closingStart;
}
export default function CreatePRForm({ user, setRefresh }: CreatePRFormProps) {
  const [tanggalPR, setTanggalPR] = useState<Date | undefined>(new Date());
  const closed = isClosedDate(tanggalPR);
  const [prItems, setPRItems] = useState<PRItemReceive[]>([]);
  const [, setMrIncluded] = useState<string[]>([]);
  const [kodePR, setKodePR] = useState<string>("");

  const [open2, setOpen2] = useState<boolean>(false);
  const [masterParts, setMasterParts] = useState<MasterPart[]>([]);
  const [mr, setMR] = useState<MRReceive[]>([]);
  const [filteredMr, setFilteredMR] = useState<MRReceive[]>([]);
  const [selectedPart, setSelectedPart] = useState<MasterPart>();
  const [selectedMr, setSelectedMr] = useState<MRReceive>();

  // ================= PART TERSEDIA BERDASARKAN MR =================
  const availableParts: MasterPart[] = selectedMr
    ? masterParts.filter(
        (part) =>
          part.part_id !== undefined &&
          selectedMr.details?.some((d) =>
            sameId(d.part_id, part.part_id) // ✅ FIX STRING
          )
      )
    : [];

  // ================= FETCH MASTER PART =================
  useEffect(() => {
    async function fetchMasterParts() {
      try {
        const parts = await getMasterParts();
        setMasterParts(parts);
      } catch {
        toast.error("Gagal mengambil data master part");
      }
    }
    fetchMasterParts();
  }, []);

  // ================= FETCH MR =================
  // useEffect(() => {
  //   async function fetchMR() {
  //     try {
  //       const mr = await getAllMr();
  //       setMR(mr);
  //       setFilteredMR(mr);
  //     } catch {
  //       toast.error("Gagal mengambil data MR");
  //     }
  //   }
  //   fetchMR();
  // }, []);
  useEffect(() => {
  async function fetchMR() {
    try {
      const mr = await getAllMr();

      const validMr = mr.filter((m) => m.mr_status === "open");

      setMR(validMr);
      setFilteredMR(validMr);
    } catch {
      toast.error("Gagal mengambil data MR");
    }
  }

  fetchMR();
}, []);

  // ================= SUBMIT =================
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!tanggalPR) {
      toast.error("Tanggal PR wajib diisi");
      return;
    }

    if (prItems.length === 0) {
      toast.error("Belum ada item untuk PR ini.");
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
        part_id: String(item.part_id), // ✅ FIX STRING
        mr_id: String(item.mr_id),     // ✅ FIX STRING
        dtl_pr_part_number: item.dtl_pr_part_number,
        dtl_pr_part_name: item.dtl_pr_part_name,
        dtl_pr_satuan: item.dtl_pr_satuan,
        dtl_pr_qty: Number(item.dtl_pr_qty),
      })),
      created_at: toMysqlDatetime(new Date()),
      updated_at: toMysqlDatetime(new Date()),
    };

    try {
      await createPR(data);
      toast.success("Purchase Request berhasil dibuat.");
      setMrIncluded([]);
      setRefresh((prev) => !prev);
      setPRItems([]);
      setTanggalPR(new Date());
    } catch {
      toast.error("Gagal membuat PR! Kode PR tidak boleh sama.");
    }
  }

  // ================= TAMBAH ITEM =================
  function handleAddItem() {
    if (!selectedMr || !selectedMr.details) {
      toast.error("Pilih MR terlebih dahulu");
      return;
    }

    const isMrExhausted = prItems.some(
      (item) =>
        sameId(item.mr_id, selectedMr.mr_id) && // ✅ FIX STRING
        item.dtl_pr_qty >= (item.dtl_mr_qty_request ?? 0)
    );

    if (isMrExhausted) {
      toast.error("MR ini sudah habis dan tidak bisa digunakan lagi");
      return;
    }

    const newItems: PRItemReceive[] = [];

    selectedMr.details.forEach((detail) => {
      const part = masterParts.find((p) =>
        sameId(p.part_id, detail.part_id) // ✅ FIX STRING
      );
      if (!part) return;

      const isDuplicate = prItems.some(
        (item) =>
          sameId(item.mr_id, selectedMr.mr_id) && // ✅ FIX STRING
          sameId(item.part_id, detail.part_id)    // ✅ FIX STRING
      );

      if (isDuplicate) return;

      newItems.push({
        mr_id: String(selectedMr.mr_id),     // ✅ FIX STRING
        part_id: String(detail.part_id),     // ✅ FIX STRING
        dtl_pr_part_number: part.part_number,
        dtl_pr_part_name: part.part_name,
        dtl_pr_satuan: part.part_satuan,
        dtl_pr_qty: 0,
        dtl_mr_qty_request: detail.dtl_mr_qty_request,
        mr: selectedMr,
      });
    });

    if (newItems.length === 0) {
      toast.warning("Semua item dari MR ini sudah ditambahkan");
      return;
    }

    setPRItems((prev) => [...prev, ...newItems]);
    setSelectedMr(undefined);
    toast.success("Item MR berhasil ditambahkan ke PR");
  }

  // ================= REMOVE =================
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
      {/* {closed && (
        <div className="col-span-12 relative overflow-hidden rounded-xl border-[6px] border-red-700 bg-black">
          
          <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,rgba(255,0,0,0.5),rgba(255,0,0,0.5)_14px,rgba(0,0,0,0.7)_14px,rgba(0,0,0,0.7)_28px)] animate-pulse" />

          <div className="relative z-10 p-8 text-center space-y-3 text-red-100">
            <div className="text-4xl font-black tracking-widest uppercase">
              🚫 TRANSAKSI PURCHASE REQUEST DITUTUP
            </div>

            <div className="text-lg font-semibold">
              PURCHASE REQUEST TERKUNCI OLEH SISTEM
            </div>

            <div className="text-sm opacity-90">
              Periode PR sampai tanggal{" "}
              <span className="font-bold underline">
                {tanggalPR?.getDate()}
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
      ></fieldset> */}
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
