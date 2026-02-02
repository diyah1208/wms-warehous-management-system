import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { toast } from "sonner";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
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
import { LokasiList } from "@/types/enum";

import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";
import type { MasterVendor } from "@/types";

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
import { createSpb, generateSpb } from "@/services/spb";

import type {
  MasterPart,
  SpbCreate,
  SpbDetail,
  UserComplete,
  UserDb,
  Stock,
} from "@/types";
import { getAllStocks } from "@/services/stock";
import { AddItemSpbDialog } from "../dialog/add-item-spb";
import { Textarea } from "../ui/textarea";
import { getMasterVendors } from "@/services/vendor";


interface CreateSpbFormProps {
  user: UserComplete | UserDb;
  setRefresh: Dispatch<SetStateAction<boolean>>;
}

function toMysqlDatetime(date: Date) {
  return date.toISOString().slice(0, 19).replace("T", " ");
}

export default function CreateSpbForm({
  user,
  setRefresh,
}: CreateSpbFormProps) {
  const [kodeSpb, setKodeSpb] = useState<string>("Loading...");
  const [tanggalSpb, setTanggalSpb] = useState<Date | undefined>(new Date());

  const [spbNoWo, setSpbNoWo] = useState("");
  const [spbSection, setSpbSection] = useState("");
  const [spbPicPpa, setSpbPicPpa] = useState("");
  const [spbKodeUnit, setSpbKodeUnit] = useState("");
  const [spbTipeUnit, setSpbTipeUnit] = useState("");
  const [spbBrand, setSpbBrand] = useState("");
  const [spbHm, setSpbHm] = useState<number | undefined>(undefined);
  const [spbRemark, setSpbRemark] = useState("");
  const [spbGudang, setSpbGudang] = useState(user.lokasi ?? "");


  const [spbItems, setSpbItems] = useState<SpbDetail[]>([]);

  const [open, setOpen] = useState(false);
  const [, setMasterParts] = useState<MasterPart[]>([]);
  const [filteredParts, setFilteredParts] = useState<MasterPart[]>([]);
  const [selectedPart, setSelectedPart] = useState<MasterPart>();
  const [stocks, setStocks] = useState<Stock[]>([]);

  const [vendors, setVendors] = useState<MasterVendor[]>([]);
  const [openBrand, setOpenBrand] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<MasterVendor | null>(null);

  useEffect(() => {
    async function fetchParts() {
      try {
        const parts = await getMasterParts();
        setMasterParts(parts);
        setFilteredParts(parts);
      } catch {
        toast.error("Gagal mengambil data master part");
      }
    }
    fetchParts();
    fetchKodeSpbWithToast();
  }, []);



   useEffect(() => {
    async function fetchStock() {
      try {
        const parts = await getAllStocks();
        setStocks(parts);
      } catch {
        toast.error("Gagal mengambil data master part");
      }
    }
    fetchStock();
  }, []);

  async function fetchKodeSpbWithToast() {
    //const toastId = toast.loading("Menghasilkan Kode SPB...");
    try {
      const kode = await generateSpb();
      setKodeSpb(kode);
      //toast.success("Kode SPB siap", { id: toastId });
    } catch {
      toast.error("Gagal generate kode SPB");
    }
  }

  function handleAddItem(part: MasterPart, qty: number) {
    if (!part || qty <= 0) {
      toast.error("Part dan qty harus valid");
      return;
    }

    if (
      spbItems.some(
        (i) => i.dtl_spb_part_number === part.part_number
      )
    ) {
      toast.warning("Item sudah ada");
      return;
    }

    const newItem = {
      part_id: part.part_id!,
      dtl_spb_part_number: part.part_number,
      dtl_spb_part_name: part.part_name,
      dtl_spb_part_satuan: part.part_satuan,
      dtl_spb_qty: qty,
      created_at: toMysqlDatetime(new Date()),
      updated_at: toMysqlDatetime(new Date()),
    } as SpbDetail;

    setSpbItems((prev) => [...prev, newItem]);
    toast.success("Item ditambahkan");
  }

  function handleRemoveItem(index: number) {
    setSpbItems((prev) => prev.filter((_, i) => i !== index));
  }

  function validateForm(): boolean {
    if (!tanggalSpb) {
      toast.error("Tanggal SPB wajib diisi");
      return false;
    }
    if (!spbGudang) {
      toast.error("Gudang wajib dipilih");
      return false;
    }
    if (!spbNoWo.trim()) {
      toast.error("No WO wajib diisi");
      return false;
    }
    if (!spbSection.trim()) {
      toast.error("Section wajib diisi");
      return false;
    }
    if (!spbPicPpa.trim()) {
      toast.error("PIC PPA wajib diisi");
      return false;
    }
    if (!spbKodeUnit.trim()) {
      toast.error("Kode Unit wajib diisi");
      return false;
    }
    if (!spbTipeUnit.trim()) {
      toast.error("Tipe Unit wajib diisi");
      return false;
    }
    if (!spbBrand.trim()) {
      toast.error("Brand wajib diisi");
      return false;
    }
    if (!spbHm || spbHm <= 0) {
      toast.error("HM wajib diisi dan lebih dari 0");
      return false;
    }
    if (spbItems.length === 0) {
      toast.error("Minimal 1 item SPB harus ditambahkan");
      return false;
    }

    return true;
  }


  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // if (!kodeSpb || !tanggalSpb || spbItems.length === 0) {
    //   toast.warning("Data belum lengkap");
    //   return;
    // }
    if (!tanggalSpb) {
      toast.error("Tanggal SPB wajib diisi");
      return false;
    }
    if (!validateForm()) return;

    const payload: SpbCreate = {
      spb_tanggal: toMysqlDatetime(tanggalSpb),
      spb_no: kodeSpb,
      spb_no_wo: spbNoWo,
      spb_section: spbSection,
      spb_pic_gmi: user.nama,
      spb_pic_ppa: spbPicPpa,
      spb_kode_unit: spbKodeUnit,
      spb_tipe_unit: spbTipeUnit,
      spb_brand: spbBrand,
      spb_hm: spbHm,
      spb_problem_remark: spbRemark,
      spb_gudang: spbGudang,
      created_at: toMysqlDatetime(new Date()),
      updated_at: toMysqlDatetime(new Date()),
      details: spbItems,
    };

    try {
      await createSpb(payload);
      toast.success("SPB berhasil dibuat");

      setSpbItems([]);
      setTanggalSpb(new Date());
      fetchKodeSpbWithToast();
      setRefresh((prev) => !prev);
    } catch {
      toast.error("Gagal membuat SPB");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      id="create-spb-form"
      className="grid grid-cols-12 gap-4"
    >
      {/* HEADER */}
      <div className="col-span-12 lg:col-span-4 space-y-2">
        <Label>No SPB<span className="text-red-500">*</span></Label>
        <div className="flex gap-2">
          <Input value={kodeSpb} disabled />
          <Button type="button" variant="outline" onClick={fetchKodeSpbWithToast}>
            Refresh
          </Button>
        </div>
      </div>

      <div className="col-span-12 lg:col-span-4 space-y-2">
        <Label>Tanggal SPB to PO<span className="text-red-500">*</span></Label>
        <DatePicker value={tanggalSpb} onChange={setTanggalSpb} />
      </div>

      <div className="col-span-12 lg:col-span-4 space-y-2">
        <Label>Gudang<span className="text-red-500">*</span></Label>
        <input type="hidden" name="spb_gedung" value={user.lokasi} />
        <Input value={user!.lokasi} onChange={(e) => setSpbGudang(e.target.value)} disabled/>
      </div>

      {/* FORM HEADER LANJUTAN */}
      <div className="col-span-12 lg:col-span-4 space-y-2">
        <Label>No WO<span className="text-red-500">*</span></Label>
        <Input value={spbNoWo} onChange={(e) => setSpbNoWo(e.target.value)} />
      </div>

      <div className="col-span-12 lg:col-span-4 space-y-2">
        <Label>Section<span className="text-red-500">*</span></Label>
        <Input value={spbSection} onChange={(e) => setSpbSection(e.target.value)} />
      </div>

      <div className="col-span-12 lg:col-span-4 space-y-2">
        <Label>PIC GMI<span className="text-red-500">*</span></Label>
        <input type="hidden" name="spb_pic_gmi" value={user.nama} />
        <Input value={user!.nama} onChange={(e) => setSpbPicPpa(e.target.value)} disabled/>
      </div>

      <div className="col-span-12 lg:col-span-4 space-y-2">
        <Label>PIC PPA<span className="text-red-500">*</span></Label>
        <Input value={spbPicPpa} onChange={(e) => setSpbPicPpa(e.target.value)}/>
      </div>

      <div className="col-span-12 lg:col-span-4 space-y-2">
        <Label>Kode Unit<span className="text-red-500">*</span></Label>
        <Input value={spbKodeUnit} onChange={(e) => setSpbKodeUnit(e.target.value)} />
      </div>

      <div className="col-span-12 lg:col-span-4 space-y-2">
        <Label>Tipe Unit<span className="text-red-500">*</span></Label>
        <Input value={spbTipeUnit} onChange={(e) => setSpbTipeUnit(e.target.value)} />
      </div>

      <div className="col-span-12 lg:col-span-4 space-y-2">
        <Label>Brand<span className="text-red-500">*</span></Label>
        <Input
          value={spbBrand}
          onChange={(e) => setSpbBrand(e.target.value)}
        />
      </div>

      <div className="col-span-12 lg:col-span-4 space-y-2">
        <Label>HM<span className="text-red-500">*</span></Label>
        <Input
          type="number"
          value={spbHm ?? ""}
          onChange={(e) => setSpbHm(Number(e.target.value) || undefined)}
        />
      </div>

      <div className="col-span-12 space-y-2">
        <Label>Problem / Remark</Label>
        <Textarea
          value={spbRemark}
          onChange={(e) => setSpbRemark(e.target.value)}
        />
      </div>

      {/* ADD ITEM */}
      <div className="col-span-12">
        <div className="flex items-center gap-2">

          {/* PART SEARCH */}
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="flex-1 justify-between"
              >
                {selectedPart
                  ? `${selectedPart.part_number} | ${selectedPart.part_name}`
                  : "Cari part..."}
                <ChevronsUpDownIcon className="h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>

            <PopoverContent className="p-0 w-[420px]">
              <Command>
                <CommandInput placeholder="Cari part..." />
                <CommandList>
                  <CommandEmpty>Tidak ada part.</CommandEmpty>
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
                        <CheckIcon
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

          {/* TAMBAH BARANG (SMALL BUTTON) */}
          <AddItemSpbDialog
            selectedPart={selectedPart}
            onAddItem={handleAddItem}
            triggerButton={
              <Button
                size="sm"
                variant="outline"
                disabled={!selectedPart}
                className="
                    whitespace-nowrap
                    bg-green-600
                    text-white
                    hover:bg-green-700
                    disabled:bg-green-300
                    disabled:text-white
                  "
              >
                + Tambah
              </Button>
            }
          />
        </div>
      </div>
      {/* TABLE */}
      <div className="col-span-12">
        <Table>
          <TableHeader>
            <TableRow className="border [&>*]:border">
              <TableHead>No</TableHead>
              <TableHead>Part Number</TableHead>
              <TableHead>Part Name</TableHead>
              <TableHead>Satuan</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Stock {spbGudang}</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {spbItems.length > 0 ? (
              spbItems.map((item, idx) => (
                <TableRow key={idx} className="border [&>*]:border">
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell>{item.dtl_spb_part_number}</TableCell>
                  <TableCell>{item.dtl_spb_part_name}</TableCell>
                  <TableCell>{item.dtl_spb_part_satuan}</TableCell>
                  <TableCell>{item.dtl_spb_qty}</TableCell>
                  <TableCell>
                    {
                      stocks.find(
                        (s) =>
                          s.part_id === item.part_id &&
                          spbGudang === s.stk_location
                      )?.stk_qty
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
                  colSpan={6}
                  className="text-center text-muted-foreground"
                >
                  Tidak ada item SPB
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </form>
  );
}
