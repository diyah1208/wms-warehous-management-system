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
import { createPR } from "@/services/purchase-request";

interface CreatePRFormProps {
  user: UserComplete | UserDb;
  setRefresh: Dispatch<SetStateAction<boolean>>;
}

const sameId = (a: any, b: any) => String(a) === String(b);

function toMysqlDatetime(date: Date) {
  return date.toISOString().slice(0, 19).replace("T", " ");
}

export default function CreatePRForm({ user, setRefresh }: CreatePRFormProps) {
  const [tanggalPR, setTanggalPR] = useState<Date | undefined>(new Date());
  const [kodePR, setKodePR] = useState("");
  const [prItems, setPRItems] = useState<PRItemReceive[]>([]);
  const [, setMrIncluded] = useState<string[]>([]);

  const [open2, setOpen2] = useState(false);
  const [masterParts, setMasterParts] = useState<MasterPart[]>([]);
  const [mr, setMR] = useState<MRReceive[]>([]);
  const [filteredMr, setFilteredMR] = useState<MRReceive[]>([]);
  const [selectedMr, setSelectedMr] = useState<MRReceive>();

  // ================= FETCH =================
  useEffect(() => {
    getMasterParts()
      .then(setMasterParts)
      .catch(() =>
        toast.error("Gagal mengambil data master part")
      );
  }, []);

  useEffect(() => {
    getAllMr()
      .then((res) => {
        setMR(res);
        setFilteredMR(res);
      })
      .catch(() => toast.error("Gagal mengambil data MR"));
  }, []);

  // ================= SUBMIT =================
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!tanggalPR) {
      toast.error("Tanggal PR wajib diisi");
      return;
    }

    if (prItems.length === 0) {
      toast.error("Belum ada item untuk PR ini");
      return;
    }

    const data: PurchaseRequest = {
      pr_kode: kodePR,
      pr_status: "open",
      pr_lokasi: user.lokasi,
      pr_pic: user.nama,
      pr_tanggal: toMysqlDatetime(tanggalPR),
      details: prItems.map((item) => ({
        part_id: String(item.part_id),
        mr_id: String(item.mr_id),
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
      toast.success("Purchase Request berhasil dibuat");
      setPRItems([]);
      setMrIncluded([]);
      setTanggalPR(new Date());
      setRefresh((p) => !p);
    } catch {
      toast.error("Gagal membuat PR (kode PR mungkin duplikat)");
    }
  }

  // ================= ADD ITEM =================
  function handleAddItem() {
    if (!selectedMr || !selectedMr.details?.length) {
      toast.error("Pilih MR terlebih dahulu");
      return;
    }

    const isMrExhausted = prItems.some(
      (item) =>
        sameId(item.mr_id, selectedMr.mr_id) &&
        item.dtl_pr_qty >= (item.dtl_mr_qty_request ?? 0)
    );

    if (isMrExhausted) {
      toast.error("MR ini sudah habis");
      return;
    }

    const newItems: PRItemReceive[] = [];

    selectedMr.details.forEach((detail) => {
      const part = masterParts.find((p) =>
        sameId(p.part_id, detail.part_id)
      );
      if (!part) return;

      const isDuplicate = prItems.some(
        (item) =>
          sameId(item.mr_id, selectedMr.mr_id) &&
          sameId(item.part_id, detail.part_id)
      );

      if (isDuplicate) return;

      newItems.push({
        mr_id: String(selectedMr.mr_id),
        part_id: String(detail.part_id),
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
    toast.success("Item MR berhasil ditambahkan");
  }

  // ================= REMOVE =================
  function handleRemoveItem(index: number) {
    setPRItems((prev) => prev.filter((_, i) => i !== index));
    toast.success("Item berhasil dihapus");
  }

  // ================= UI =================
  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-12 gap-4">
      {/* FORM HEADER */}
      <div className="col-span-6 space-y-4">
        <div>
          <Label>Kode PR *</Label>
          <Input value={kodePR} onChange={(e) => setKodePR(e.target.value)} required />
        </div>

        <div>
          <Label>Tanggal PR *</Label>
          <DatePicker value={tanggalPR} onChange={setTanggalPR} />
        </div>
      </div>

      <div className="col-span-6 space-y-4">
        <div>
          <Label>Person in Charge</Label>
          <Input value={user.nama} disabled />
        </div>

        <div>
          <Label>Lokasi</Label>
          <Select value={user.lokasi} disabled>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {LokasiList.map((l) => (
                  <SelectItem key={l.kode} value={l.nama}>
                    {l.nama}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* MR PICKER */}
      <div className="col-span-8">
        <Popover open={open2} onOpenChange={setOpen2}>
          <PopoverTrigger asChild>
            <Button variant="outline" disabled={!kodePR}>
              {selectedMr?.mr_kode ?? "Pilih Material Request"}
              <ChevronsUpDownIcon className="ml-2 h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0">
            <Command>
              <CommandInput placeholder="Cari MR" />
              <CommandList>
                <CommandEmpty>Tidak ada</CommandEmpty>
                <CommandGroup>
                  {filteredMr.map((m) => (
                    <CommandItem
                      key={m.mr_kode}
                      value={m.mr_kode}
                      onSelect={() => {
                        setSelectedMr(m);
                        setOpen2(false);
                      }}
                    >
                      <CheckIcon className="mr-2 h-4 w-4" />
                      {m.mr_kode}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <div className="col-span-4">
        <Button type="button" onClick={handleAddItem} disabled={!selectedMr}>
          <ClipboardPlus className="mr-2 h-4 w-4" /> Tambah Barang
        </Button>
      </div>

      {/* TABLE */}
      <div className="col-span-12">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No</TableHead>
              <TableHead>Part Number</TableHead>
              <TableHead>Part Name</TableHead>
              <TableHead>Satuan</TableHead>
              <TableHead>Qty MR</TableHead>
              <TableHead>Qty PR</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {prItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  Tidak ada item MR
                </TableCell>
              </TableRow>
            ) : (
              prItems.map((item, i) => (
                <TableRow key={i}>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell>{item.dtl_pr_part_number}</TableCell>
                  <TableCell>{item.dtl_pr_part_name}</TableCell>
                  <TableCell>{item.dtl_pr_satuan}</TableCell>
                  <TableCell>{item.dtl_mr_qty_request}</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min={1}
                      value={item.dtl_pr_qty}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (val > (item.dtl_mr_qty_request ?? 0)) {
                          toast.error("Qty PR melebihi Qty MR");
                          return;
                        }
                        setPRItems((prev) =>
                          prev.map((it, idx) =>
                            idx === i ? { ...it, dtl_pr_qty: val } : it
                          )
                        );
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRemoveItem(i)}
                    >
                      <Trash2 />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="col-span-12">
        <Button type="submit" className="w-full bg-green-600">
          Tambah PR
        </Button>
      </div>
    </form>
  );
}
