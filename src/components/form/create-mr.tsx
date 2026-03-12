import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { toast } from "sonner";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { createMR, generateKodeMR } from "@/services/material-request";
import type { MasterPart, MRDetail, MRReceive, UserComplete, UserDb } from "@/types";
import { DatePicker } from "../date-picker";
import {
  Select,

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
import { AddItemMRDialog } from "../dialog/add-item-mr";
import { Button } from "../ui/button";
// import { LokasiList } from "@/types/enum";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { ChevronsUpDownIcon, ClipboardPlus, Trash2 } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
// import { cn } from "@/lib/utils";
import { getMasterParts } from "@/services/master-part";


interface CreateMRFormProps {
  user: UserComplete | UserDb;
  setRefresh: Dispatch<SetStateAction<boolean>>;
}

function toMysqlDatetime(date: Date) {
  return date.toISOString().slice(0, 19).replace("T", " ");
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

export default function CreateMRForm({ user, setRefresh }: CreateMRFormProps) {
  const [kodeMR, setKodeMR] = useState<string>("Loading...");
  const [duedate, setDueDate] = useState<Date | undefined>(undefined);
  const [tanggalMR, setTanggalMR] = useState<Date | undefined>(new Date());
  const closed = isClosedDate(tanggalMR);
  const [mrItems, setMRItems] = useState<MRDetail[]>([]);

  // Pencarian master part
  const [open, setOpen] = useState<boolean>(false);
  const [, setMasterParts] = useState<MasterPart[]>([]);
  const [filteredParts, setFilteredParts] = useState<MasterPart[]>([]);
  const [selectedPart, setSelectedPart] = useState<MasterPart>();
  function toMysqlDatetime(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  // Fetch master parts
  useEffect(() => {
    async function fetchMasterParts() {
      try {
        const parts = await getMasterParts();
        setMasterParts(parts);
        setFilteredParts(parts);
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

  // Fetch kode MR
  // async function fetchKodeMR() {
  //   toast.info("Menghasilkan Kode MR baru...");
  //   try {
  //     const kode = await generateKodeMR(user.lokasi);
  //     setKodeMR(kode);
  //     toast.success("Kode MR sudah terbaru.");
  //     console.log("KODE MASUK", kode)
  //   } catch (error) {
  //     if (error instanceof Error) {
  //       toast.error(`Gagal menghasilkan Kode MR: ${error.message}`);
  //     } else {
  //       toast.error("Terjadi kesalahan saat menghasilkan Kode MR.");
  //     }
  //   }
  // }
  
  async function fetchKodeMRSilent() {
  try {
    const kode = await generateKodeMR(user.lokasi);
    setKodeMR(kode);
  } catch (e) {
    console.error(e);
  }
}

async function fetchKodeMRWithToast() {
  const toastId = toast.loading("Menghasilkan Kode MR baru...");

  try {
    const kode = await generateKodeMR(user.lokasi);
    setKodeMR(kode);
    toast.success("Kode MR sudah terbaru.", { id: toastId });
  } catch (e) {
    toast.error("Gagal generate kode MR", { id: toastId });
  }
}

useEffect(() => {
  if (!user?.lokasi) return;
  fetchKodeMRSilent();
}, [user?.lokasi]);


  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const lokasi = user.lokasi;
    const status = "open";

    if (
      !kodeMR ||
      !duedate ||
      !tanggalMR ||
      !lokasi ||
      !status ||
      mrItems.length === 0 ||
      !kodeMR ||
      !user
    ) {
      toast.warning("Data belum lengkap.");
      // console.log(
      //   "Data belum lengkap:",
      //   kodeMR,
      //   duedate,
      //   tanggalMR,
      //   lokasi,
      //   status,
      //   mrItems.length,
      //   kodeMR,
      //   user
      // );
      return;
    }

  const data: MRReceive = {
  mr_kode: kodeMR,
  mr_tanggal: toMysqlDatetime(tanggalMR),
  mr_due_date: toMysqlDatetime(duedate),
  mr_lokasi: lokasi,
  mr_pic: user.nama,
  mr_status: status,
  details: mrItems,
  created_at: toMysqlDatetime(new Date()),
  updated_at: toMysqlDatetime(new Date()),
  mr_last_edit_at: toMysqlDatetime(new Date()),
  mr_last_edit_by: user.nama,
};

    try {
      const res = await createMR(data);
    if (res) {
  toast.success("Material Request berhasil dibuat.");

  setRefresh((prev) => !prev);

  // reset form state
  setMRItems([]);
  setSelectedPart(undefined);
  setTanggalMR(new Date());
  setDueDate(undefined);

  // generate kode MR baru
  fetchKodeMRSilent();

  form.reset();
} else {
        toast.error("Gagal membuat Material Request. Silakan coba lagi.");
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Gagal membuat MR: ${error.message}`);
      } else {
        toast.error("Terjadi kesalahan saat membuat MR.");
      }
      return;
    }
  }

  function handleAddItem(part: MasterPart, qty: number, dtl_mr_prioritas: string) {
    if (!part || !qty || qty <= 0) {
      toast.error(
        "Mohon lengkapi semua detail item dan pastikan kuantitas valid."
      );
      return;
    }

    if (mrItems.some((item) => item.dtl_mr_part_number === part.part_number)) {
      toast.warning("Item dengan part number ini sudah ada di daftar.");
      return;
    }

    const newItem: MRDetail = {
      part_id: part.part_id,
      dtl_mr_part_name: part.part_name,
      dtl_mr_part_number: part.part_number,
      dtl_mr_satuan: part.part_satuan,
      dtl_mr_qty_request: qty,
      dtl_mr_prioritas,
      dtl_mr_qty_received: 0,
    };

    setMRItems((prevItems) => [...prevItems, newItem]);
    toast.success("Item berhasil ditambahkan ke daftar.");
  }

  function handleRemoveItem(index: number) {
    setMRItems((prevItems) => prevItems.filter((_, i) => i !== index));
    toast.success("Item berhasil dihapus dari daftar.");
  }

  return (
<form
  onSubmit={handleSubmit}
  id="create-mr-form"
  className="grid grid-cols-12 gap-6"
>
  {/* {closed && (
        <div className="col-span-12 relative overflow-hidden rounded-xl border-[6px] border-red-700 bg-black">
          
          <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,rgba(255,0,0,0.5),rgba(255,0,0,0.5)_14px,rgba(0,0,0,0.7)_14px,rgba(0,0,0,0.7)_28px)] animate-pulse" />

          <div className="relative z-10 p-8 text-center space-y-3 text-red-100">
            <div className="text-4xl font-black tracking-widest uppercase">
              🚫 TRANSAKSI MATERIAL REQUEST DITUTUP
            </div>

            <div className="text-lg font-semibold">
              MATERIAL REQUEST TERKUNCI OLEH SISTEM
            </div>

            <div className="text-sm opacity-90">
              Periode MR sampai tanggal{" "}
              <span className="font-bold underline">
                {tanggalMR?.getDate()}
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
<div className="col-span-12 grid grid-cols-12 gap-4">
  <div className="col-span-12 md:col-span-4">
    <Label>Kode MR</Label>
    <div className="flex gap-2">
      <Input disabled value={kodeMR ?? ""} />
      <Button variant="outline" type="button" onClick={fetchKodeMRWithToast}>
        Refresh
      </Button>
    </div>
  </div>

  <div className="col-span-12 md:col-span-4">
    <Label>Person in Charge</Label>
    <Input disabled value={user.nama} />
  </div>

  <div className="col-span-12 md:col-span-4">
    <Label>Lokasi</Label>
    <Select disabled>
      <SelectTrigger>
        <SelectValue placeholder={user.lokasi} />
      </SelectTrigger>
    </Select>
  </div>
</div>
<div className="col-span-12 grid grid-cols-12 gap-4">
  <div className="col-span-12 md:col-span-4">
    <Label>Tanggal MR</Label>
    <DatePicker value={tanggalMR} onChange={setTanggalMR} />
  </div>

  <div className="col-span-12 md:col-span-4">
    <Label>Tanggal Due Date<span className="text-red-500">*</span></Label>
    <DatePicker value={duedate ?? undefined} onChange={setDueDate} />
  </div>

  <div className="col-span-12 md:col-span-4">
    <Label>Part Number<span className="text-red-500">*</span></Label>

    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          className="w-full justify-between overflow-hidden"
        >
          <span className="truncate text-left">
            {selectedPart
              ? `${selectedPart.part_number} | ${selectedPart.part_name}`
              : "Cari part number..."}
          </span>

          <ChevronsUpDownIcon className="h-4 w-4 opacity-50 shrink-0" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-(--radix-popover-trigger-width) p-0">
        <Command>
          <CommandInput placeholder="Cari part number..." />
          <CommandList>
            <CommandEmpty>Tidak ada.</CommandEmpty>
            <CommandGroup>
              {filteredParts.map((part) => (
                <CommandItem
                  key={part.part_number}
                  value={part.part_number}
                  onSelect={() => {
                    setSelectedPart(part);
                    setOpen(false);
                  }}
                >
                  {part.part_number} | {part.part_name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  </div>
</div>

<div className="col-span-12">
  <AddItemMRDialog
    selectedPart={selectedPart}
    onAddItem={handleAddItem}
    triggerButton={
      
      <Button
  className="w-full !bg-green-600 hover:!bg-green-700 !text-white"
             
  disabled={!selectedPart}
>
  <ClipboardPlus className="h-4 w-4" />
  <span>Tambah Barang</span>
</Button>
    }
  />
</div>

     

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
              <TableHead className="font-semibold text-center">Qty</TableHead>
              <TableHead className="font-semibold text-center">
                Prioritas
              </TableHead>
              <TableHead className="font-semibold text-center">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mrItems.length > 0 ? (
              mrItems?.map((item, index) => (
                <TableRow key={index} className="border [&>*]:border">
                  <TableCell className="w-[50px]">{index + 1}</TableCell>
                  <TableCell className="text-start">
                    {item.dtl_mr_part_number}
                  </TableCell>
                  <TableCell className="text-start">{item.dtl_mr_part_name}</TableCell>
                  <TableCell>{item.dtl_mr_satuan}</TableCell>
                  <TableCell>{item.dtl_mr_qty_request}</TableCell>
                  <TableCell>{item.dtl_mr_prioritas}</TableCell>
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
      {/* </fieldset> */}
    </form>
  );
}