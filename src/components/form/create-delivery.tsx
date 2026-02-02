import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { toast } from "sonner";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { getAllMr } from "@/services/material-request";
import type {
  DeliveryDetail,
  DeliveryReceive,
  MRDetail,
  MRReceive,
  Stock,
  UserComplete,
  UserDb,
} from "@/types";
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
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Button } from "../ui/button";
import { DeliveryEkspedisi, LokasiList } from "@/types/enum";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { CheckIcon, ChevronsUpDownIcon, PackagePlus } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { cn } from "@/lib/utils";
import { createDelivery } from "@/services/delivery";
import { getAllStocks } from "@/services/stock";
import { AddItemDeliveryDialog } from "../dialog/add-item-delivery";
import { DatePicker } from "../date-picker";


interface CreateDeliveryFormProps {
  user: UserComplete | UserDb;
  setRefresh: Dispatch<SetStateAction<boolean>>;
}

function toMysqlDatetime(date: Date) {
  return date.toISOString().slice(0, 19).replace("T", " ");
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

export default function CreateDeliveryForm({
  user,
  setRefresh,
}: CreateDeliveryFormProps) {
  const [, setKey] = useState(+new Date());
  const [open, setOpen] = useState<boolean>(false);
  // const [, setTanggalPR] = useState<Date | undefined>(new Date());

  const [, setMR] = useState<MRReceive[]>([]);  
  const [filteredMr, setFilteredMR] = useState<MRReceive[]>([]);
  const [selectedMr, setSelectedMr] = useState<MRReceive>();
  const [selectedFrom, setSelectedFrom] = useState<string>("");
  const [dlvTanggal, setDlvTanggal] = useState<Date | undefined>(undefined);
  const closed = isClosedDate(dlvTanggal);


  const [stocks, setStocks] = useState<Stock[]>([]);
  const [deliveryItems, setDeliveryItems] = useState<DeliveryDetail[]>([]);

  useEffect(() => {
    if (!selectedMr) {
      setDeliveryItems([]);
      return;
    }
  }, [selectedMr]);

  useEffect(() => {
    async function fetchMR() {
      try {
        const mrData = await getAllMr();
        const validMR = Array.isArray(mrData) ? mrData : [];
        setMR(validMR);
        setFilteredMR(validMR);
      } catch {
        toast.error("Gagal mengambil data MR.");
        setMR([]);
        setFilteredMR([]);
      }
    }
    fetchMR();
  }, []);

  useEffect(() => {
    async function fetchStock() {
      try {
        const res = await getAllStocks();
        setStocks(Array.isArray(res) ? res : []);
      } catch {
        toast.error("Gagal mengambil data Stocks.");
        setStocks([]);
      }
    }
    fetchStock();
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedMr) {
      toast.error("Silakan pilih MR dahulu.");
      return;
    }
    if (!dlvTanggal) {
      toast.error("Tanggal delivery wajib dipilih.");
      return;
    }


    if (deliveryItems.length === 0) {
      toast.error("Delivery tidak boleh kosong.");
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);

    const dlv_kode = formData.get("dlv_kode") as string;
    const dlv_ekspedisi = formData.get("dlv_ekspedisi") as string;
    const dlv_no_resi = (formData.get("dlv_no_resi") as string) ?? "";
    const dlv_jumlah_koli = formData.get("dlv_jumlah_koli") as string;

    const data: DeliveryReceive = {
      dlv_kode,
      dlv_ekspedisi,
      dlv_dari_gudang: selectedFrom,
      dlv_ke_gudang: selectedMr.mr_lokasi,
      dlv_status: "pending",
      dlv_pic: user.nama,
      dlv_no_resi,
      dlv_tanggal: dlvTanggal.toISOString().slice(0, 10),
      dlv_jumlah_koli: dlv_jumlah_koli ? parseInt(dlv_jumlah_koli) : 0,
      mr_id: selectedMr.mr_id,
      created_at: toMysqlDatetime(new Date()),
      updated_at: toMysqlDatetime(new Date()),

      details: deliveryItems.map((d) => ({
        part_id: d.part_id,
        dtl_dlv_part_number: d.dtl_dlv_part_number,
        dtl_dlv_part_name: d.dtl_dlv_part_name,
        dtl_dlv_satuan: d.dtl_dlv_satuan,
        qty: d.qty,
        qty_pending: d.qty_pending,
        qty_on_delivery: d.qty_on_delivery,
        qty_delivered: d.qty_delivered,
        created_at: d.created_at,
        updated_at: d.updated_at,
      })),
    };

    try {
      const res = await createDelivery(data);

      if (res) {
        toast.success("Delivery berhasil dibuat.");
        setRefresh((prev) => !prev);
        form.reset();
        setSelectedMr(undefined);
        setDeliveryItems([]);
        setKey(+new Date());
        setSelectedFrom("");
      } else {
        toast.error("Gagal membuat Delivery.");
      }
    } catch (err: any) {
      const response = err?.response?.data;
      if (response?.errors) {
        Object.values(response.errors).forEach((messages: any) => {
          messages.forEach((msg: string) => {
            toast.error(msg);
          });
        });
        return;
      }
      if (response?.message) {
        toast.error(response.message);
        return;
      }
      toast.error("Kesalahan server.");
    }
  }

  function handleAddItem(mr_item: MRDetail, qty: number) {
    if (!selectedFrom) {
      toast.error("Pilih lokasi pengirim.");
      return;
    }

    if (!selectedMr) {
      toast.error("Pilih MR dahulu.");
      return;
    }
    if (!dlvTanggal) {
    toast.error("Tanggal delivery wajib dipilih.");
    return;
  }


    if (qty <= 0) {
      toast.error("Qty tidak valid.");
      return;
    }

    const exists = deliveryItems.find(
      (item) => item.dtl_dlv_part_number === mr_item.dtl_mr_part_number
    );

    if (exists) {
      toast.error("Item sudah ada.");
      return;
    }

    const stock = stocks.find(
    (s) =>
      s.part_id === mr_item.part_id &&
      s.stk_location === selectedFrom
  );

  if (!stock) {
    toast.error("Stok tidak ditemukan di gudang.");
    return;
  }

  if (qty > stock.stk_qty) {
    toast.error("Stok gudang tidak mencukupi.");
    return;
  }

  const sisaMr =
    mr_item.dtl_mr_qty_request - mr_item.dtl_mr_qty_received;

  if (qty > sisaMr) {
    toast.error("Qty melebihi sisa permintaan MR.");
    return;
  }

    const newItem: DeliveryDetail = {
      part_id: mr_item.part_id,
      dtl_dlv_part_number: mr_item.dtl_mr_part_number,
      dtl_dlv_part_name: mr_item.dtl_mr_part_name,
      dtl_dlv_satuan: mr_item.dtl_mr_satuan,
      qty,
      qty_pending: qty,
      qty_on_delivery: 0,
      qty_delivered: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setDeliveryItems((prev) => [...prev, newItem]);
    toast.success("Item berhasil ditambahkan.");
  }

  return (
    <form id="create-delivery-form" onSubmit={handleSubmit} className="grid grid-cols-12 gap-4">
      {closed && (
        <div className="col-span-12 relative overflow-hidden rounded-xl border-[6px] border-red-700 bg-black">
          
          {/* STRIPE */}
          <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,rgba(255,0,0,0.5),rgba(255,0,0,0.5)_14px,rgba(0,0,0,0.7)_14px,rgba(0,0,0,0.7)_28px)] animate-pulse" />

          {/* CONTENT */}
          <div className="relative z-10 p-8 text-center space-y-3 text-red-100">
            <div className="text-4xl font-black tracking-widest uppercase">
              🚫 TRANSAKSI DELIVERY DITUTUP
            </div>

            <div className="text-lg font-semibold">
              DELIVERY TERKUNCI OLEH SISTEM
            </div>

            <div className="text-sm opacity-90">
              Periode DELIVERY sampai tanggal{" "}
              <span className="font-bold underline">
                {dlvTanggal?.getDate()}
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
      <div className="flex flex-col col-span-12 lg:col-span-6 gap-4">
        <input type="hidden" name="dlv_pic" value={user.nama} />
        <div className="flex flex-col gap-2">
          <Label>Kode IT<span className="text-red-500">*</span></Label>
          <Input name="dlv_kode" required />
        </div>

        <div className="flex flex-col gap-2">
          <Label>Delivery untuk MR<span className="text-red-500">*</span></Label>

          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="justify-between">
                {selectedMr ? selectedMr.mr_kode : "Cari MR..."}
                <ChevronsUpDownIcon className="h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>

            <PopoverContent className="p-0">

              <Command>
                <CommandInput placeholder="Cari MR..." />

                <CommandList>
                  <CommandEmpty>Tidak ada.</CommandEmpty>

                  <CommandGroup>
                    {filteredMr.map((m) => (
                      <CommandItem
                        key={m.mr_kode}
                        value={m.mr_kode}
                        onSelect={() => {
                          setSelectedMr(m);
                          setOpen(false);
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
                        {m.mr_kode}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex flex-col gap-2">
          <Label>Tanggal Delivery<span className="text-red-500">*</span></Label>

          <DatePicker
            value={dlvTanggal}
            onChange={setDlvTanggal}
          />
        </div>
        <div className="flex flex-col gap-2">
          
          <Label>Pilih Ekspedisi<span className="text-red-500">*</span></Label>

          <Select required name="dlv_ekspedisi">
            <SelectTrigger>
              <SelectValue placeholder="Pilih ekspedisi" />
            </SelectTrigger>

            <SelectContent>
              <SelectGroup>
                <SelectLabel>Daftar Ekspedisi</SelectLabel>

                {DeliveryEkspedisi.map((eks, idx) => (
                  <SelectItem key={idx} value={eks}>
                    {eks}
                  </SelectItem>
                ))}

              </SelectGroup>
            </SelectContent>

          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label>Nomor Resi</Label>
          <Input name="dlv_no_resi" />
        </div>

      </div>

      <div className="flex flex-col col-span-12 lg:col-span-6 gap-4">

        <div className="flex flex-col gap-2">
          <Label>Dari Gudang<span className="text-red-500">*</span></Label>

          <Select required onValueChange={(v) => setSelectedFrom(v)}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih lokasi" />
            </SelectTrigger>

            <SelectContent>
              {LokasiList.filter(
                (lokasi) => lokasi.kode !== "unassigned"
              ).map((lokasi) => (
                <SelectItem key={lokasi.kode} value={lokasi.nama}>
                  {lokasi.nama}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label>Ke Gudang<span className="text-red-500">*</span></Label>

          <Select disabled value={selectedMr?.mr_lokasi ?? ""}>
            <SelectTrigger>
              <SelectValue placeholder="Tujuan" />
            </SelectTrigger>
            <SelectContent>
              {LokasiList.filter(
                (loc) => loc.nama === selectedMr?.mr_lokasi
              ).map((loc) => (
                <SelectItem key={loc.kode} value={loc.nama}>
                  {loc.nama}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label>Jumlah Koli</Label>
          <Input name="dlv_jumlah_koli" type="number" min={0} />
        </div>

      </div>

      {/* MR TABLE  */}
      <div className="col-span-12 flex flex-col gap-2">
        <Table>
          <TableCaption>Daftar Barang MR</TableCaption>

          <TableHeader>
            <TableRow className="border [&>*]:border">
              <TableHead>No</TableHead>
              <TableHead>Part Number</TableHead>
              <TableHead>Part Name</TableHead>
              <TableHead>Satuan</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Received</TableHead>
              <TableHead>Stock {selectedFrom}</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>

            {selectedMr && selectedMr.details.length > 0 ? (
              selectedMr.details.map((item, idx) => (
                <TableRow key={idx} className="border [&>*]:border">
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell>{item.dtl_mr_part_number}</TableCell>
                  <TableCell>{item.dtl_mr_part_name}</TableCell>
                  <TableCell>{item.dtl_mr_satuan}</TableCell>
                  <TableCell>{item.dtl_mr_qty_request}</TableCell>
                  <TableCell>{item.dtl_mr_qty_received}</TableCell>

                  <TableCell>
                    {
                      stocks.find(
                        (s) =>
                          s.part_id === item.part_id &&
                          selectedFrom === s.stk_location
                      )?.stk_qty
                    }
                  </TableCell>

                  <TableCell>
                    <AddItemDeliveryDialog
                      mr_item={item}
                      dari={selectedFrom}
                      onAddItem={handleAddItem}
                      triggerButton={
                      <Button
                        size="icon"
                        type="button"
                        disabled={!selectedFrom}
                        variant="outline"
                        className="
                          border-green-600
                          text-green-600
                          bg-white
                          hover:bg-green-50
                          h-9 w-9
                          rounded-md
                          flex items-center justify-center
                        "
                      >
                        <PackagePlus className="h-4 w-4" />
                      </Button>
                      }
                    />
                  </TableCell>

                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center text-muted-foreground"
                >
                  Tidak ada item MR
                </TableCell>
              </TableRow>
            )}

          </TableBody>

        </Table>
      </div>

      {/* DELIVERY ITEMS TABLE */}
      <div className="col-span-12 flex flex-col gap-2">
        <Table>
          <TableCaption>Daftar Barang untuk Delivery Ini</TableCaption>

          <TableHeader>
            <TableRow className="border [&>*]:border">
              <TableHead>No</TableHead>
              <TableHead>Part Number</TableHead>
              <TableHead>Part Name</TableHead>
              <TableHead>Satuan</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Stock {selectedFrom}</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>

            {deliveryItems.length > 0 ? (
              deliveryItems.map((item, idx) => (
                <TableRow key={idx} className="border [&>*]:border">
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell>{item.dtl_dlv_part_number}</TableCell>
                  <TableCell>{item.dtl_dlv_part_name}</TableCell>
                  <TableCell>{item.dtl_dlv_satuan}</TableCell>
                  <TableCell>{item.qty}</TableCell>

                  <TableCell>
                    {
                      stocks.find(
                        (s) =>
                          s.part_id === item.part_id &&
                          selectedFrom === s.stk_location
                      )?.stk_qty
                    }
                  </TableCell>

                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground"
                >
                  Tidak ada item delivery
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