import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { toast } from "sonner";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { DatePicker } from "../date-picker";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { cn } from "@/lib/utils";
import { Textarea } from "../ui/textarea";

import type {
  MasterPart,
  PeminjamanDetail,
  Stock,
  UserComplete,
  UserDb,
} from "@/types";

import { getMasterParts } from "@/services/master-part";
import { getAllStocks } from "@/services/stock";
import { generatePmj, createPeminjaman } from "@/services/peminjaman";
import { AddItemPeminjamanDialog } from "../dialog/add-item-peminjaman";

interface CreatePeminjamanFormProps {
  user: UserComplete | UserDb;
  setRefresh: Dispatch<SetStateAction<boolean>>;
}

function toMysqlDatetime(date: Date) {
  return date.toISOString().slice(0, 19).replace("T", " ");
}

export default function CreatePeminjamanForm({
  user,
  setRefresh,
}: CreatePeminjamanFormProps) {
  /** ================= HEADER ================= */
  const [pmjKode, setPmjKode] = useState("Loading...");
  const [pmjTanggal, setPmjTanggal] = useState<Date | undefined>(new Date());
  const [pmjLokasi] = useState(user.lokasi ?? "");
  const [pmjPeminjam] = useState(user.nama ?? "");
  const [pmjKeterangan, setPmjKeterangan] = useState("");

  const [items, setItems] = useState<PeminjamanDetail[]>([]);

  const [open, setOpen] = useState(false);
  const [parts, setParts] = useState<MasterPart[]>([]);
  const [selectedPart, setSelectedPart] = useState<MasterPart>();
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loadingKode, setLoadingKode] = useState(false);



  useEffect(() => {
    (async () => {
      try {
        setParts(await getMasterParts());
        setStocks(await getAllStocks());
        setPmjKode(await generatePmj());
      } catch {
        toast.error("Gagal load data awal");
      }
    })();
  }, []);

  async function handleRefreshKode() {
  try {
    setLoadingKode(true);
    const newKode = await generatePmj();
    setPmjKode(newKode);
    toast.success("Kode peminjaman diperbarui");
  } catch {
    toast.error("Gagal refresh kode peminjaman");
  } finally {
    setLoadingKode(false);
  }
}

  function handleAddItem(part: MasterPart, qty: number) {
    if (!part || qty <= 0) {
      toast.error("Part & qty tidak valid");
      return;
    }

    if (items.some((i) => i.part_id === part.part_id)) {
      toast.warning("Part sudah ditambahkan");
      return;
    }

    const newItem = {
      part_id: part.part_id,
      dtl_pmj_part_number: part.part_number,
      dtl_pmj_part_name: part.part_name,
      dtl_pmj_part_satuan: part.part_satuan,
      dtl_pmj_qty_borrowed: qty,
      dtl_pmj_qty_returned: 0,
      created_at: toMysqlDatetime(new Date()),
      updated_at: toMysqlDatetime(new Date()),
    } as PeminjamanDetail;

    setItems((prev) => [...prev, newItem]);
    toast.success("Item ditambahkan");
  }

  function handleRemoveItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!pmjTanggal) {
      toast.error("Tanggal wajib diisi");
      return;
    }

    if (items.length === 0) {
      toast.error("Minimal 1 item dipinjam");
      return;
    }

    const payload = {
      pmj_kode: pmjKode,
      pmj_lokasi: pmjLokasi,
      pmj_tanggal: toMysqlDatetime(pmjTanggal),
      pmj_peminjam: pmjPeminjam,
      pmj_keterangan: pmjKeterangan,
      details: items,
    };

    try {
      await createPeminjaman(payload);
      toast.success("Peminjaman berhasil disimpan");

      setItems([]);
      setPmjKeterangan("");
      setPmjKode(await generatePmj());
      setRefresh((p) => !p);
    } catch {
      toast.error("Gagal menyimpan peminjaman");
    }
  }

  return (
    <form
      id="create-peminjaman-form"
      onSubmit={handleSubmit}
      className="grid grid-cols-12 gap-6"
    >

      <div className="col-span-12 grid grid-cols-1 md:grid-cols-2 gap-4">

        <div className="space-y-2">
          <Label>Kode Peminjaman</Label>

          <div className="flex gap-2">
            <Input
              value={pmjKode}
              disabled
              className="h-11 flex-1"
            />
            <Button variant="outline" type="button" disabled={loadingKode} onClick={handleRefreshKode}>
              Refresh
            </Button>
          </div>
        </div>


        <div className="space-y-2">
          <Label>Tanggal</Label>
          <DatePicker value={pmjTanggal} onChange={setPmjTanggal} />
        </div>

        <div className="space-y-2">
          <Label>Lokasi</Label>
          <input type="hidden" name="pmj_lokasi" value={pmjLokasi} />
          <Input value={pmjLokasi} disabled className="h-11" />
        </div>

        <div className="space-y-2">
          <Label>Peminjam</Label>
          <input type="hidden" name="pmj_peminjam" value={pmjPeminjam} />
          <Input value={pmjPeminjam} disabled className="h-11" />
        </div>

      </div>


      <div className="col-span-12 space-y-2">
        <Label>Keterangan</Label>
        <Textarea
          className="min-h-[90px]"
          value={pmjKeterangan}
          onChange={(e) => setPmjKeterangan(e.target.value)}
        />
      </div>

      <div className="col-span-12 flex gap-3 items-center">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="flex-1 justify-between h-11"
            >
              {selectedPart
                ? `${selectedPart.part_number} | ${selectedPart.part_name}`
                : "Cari part"}
              <ChevronsUpDownIcon className="h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>

          <PopoverContent className="p-0 w-[420px]">
            <Command>
              <CommandInput placeholder="Cari part..." />
              <CommandList>
                <CommandEmpty>Part tidak ditemukan</CommandEmpty>
                <CommandGroup>
                  {parts.map((part) => (
                    <CommandItem
                      key={part.part_id}
                      onSelect={() => {
                        setSelectedPart(part);
                        setOpen(false);
                      }}
                    >
                      <CheckIcon
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedPart?.part_id === part.part_id
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

        <AddItemPeminjamanDialog
          selectedPart={selectedPart}
          onAddItem={handleAddItem}
          triggerButton={
            <Button size="sm" disabled={!selectedPart} className="h-11">
              + Tambah
            </Button>
          }
        />
      </div>

      {/* ================= TABLE ================= */}

      <div className="col-span-12 border rounded-md overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No</TableHead>
              <TableHead>Part</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead>Satuan</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Stock {pmjLokasi}</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {items.length > 0 ? (
              items.map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell>{item.dtl_pmj_part_number}</TableCell>
                  <TableCell>{item.dtl_pmj_part_name}</TableCell>
                  <TableCell>{item.dtl_pmj_part_satuan}</TableCell>
                  <TableCell>{item.dtl_pmj_qty_borrowed}</TableCell>
                  <TableCell>
                    {
                      stocks.find(
                        (s) =>
                          s.part_id === item.part_id &&
                          s.stk_location === pmjLokasi
                      )?.stk_qty ?? 0
                    }
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRemoveItem(idx)}
                    >
                      Hapus
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground py-6"
                >
                  Belum ada part dipinjam
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </form>
  );
}
