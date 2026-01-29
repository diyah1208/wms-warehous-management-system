import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { toast } from "sonner";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import type { POReceive, PurchaseRequest, UserComplete, UserDb } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
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
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { CheckIcon, ChevronsUpDownIcon, Pencil } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { cn } from "@/lib/utils";
import { getPrById } from "@/services/purchase-request";
import { Textarea } from "../ui/textarea";
import { createRI, getPurchasedPO } from "@/services/receive-item";
import { LokasiList } from "@/types/enum";
import { DatePicker } from "../date-picker";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CreatePOFormProps {
  user: UserComplete | UserDb;
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


export default function CreateRIForm({ user, setRefresh }: CreatePOFormProps) {
  const [open, setOpen] = useState(false);
  const [, setPO] = useState<POReceive[]>([]);
  const [filteredPO, setFilteredPO] = useState<POReceive[]>([]);
  const [selectedPO, setSelectedPO] = useState<POReceive>();
  const [selectedPR, setSelectedPR] = useState<PurchaseRequest>();
  const [tanggal, setTanggal] = useState<Date | undefined>(new Date());

  const [receiveQty, setReceiveQty] = useState<Record<string, number>>({});
  const [openQtyDialog, setOpenQtyDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const closed = isClosedDate(tanggal);

  /* =======================
   * FETCH PR BY PO
   * ======================= */
  useEffect(() => {
    async function fetchPR(kode: string) {
      try {
        const res = await getPrById(kode);
        if (!res) return;
        setSelectedPR(res);
        setReceiveQty({});
      } catch {
        toast.error("Gagal mengambil PR");
      }
    }

    if (!selectedPO) return;
    fetchPR(selectedPO.pr_id);
  }, [selectedPO]);

  /* =======================
   * FETCH PURCHASED PO
   * ======================= */
  useEffect(() => {
    async function fetchPO() {
      try {
        const res = await getPurchasedPO();
        setPO(res);
        setFilteredPO(res);
      } catch {
        toast.error("Gagal mengambil data PO");
      }
    }
    fetchPO();
  }, []);

  function getQtyReceived(partId?: string) {
    if (!selectedPO || !partId) return 0;
    return (
      selectedPO.details.find((d) => d.part_id === partId)
        ?.dtl_qty_received ?? 0
    );
  }

  /* =======================
   * SUBMIT RI
   * ======================= */
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (closed) {
      toast.error("Periode transaksi sudah ditutup");
      return;
    }

    if (!selectedPO || !selectedPR || !tanggal) {
      toast.error("Data belum lengkap");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const ri_kode = formData.get("kode") as string;
    const ri_lokasi = formData.get("penerima") as string;
    const ri_keterangan = formData.get("keterangan") as string;

    if (!ri_kode || !ri_lokasi) {
      toast.error("Kode & lokasi wajib diisi");
      return;
    }
    

    const details = selectedPR.details.map((d) => {
      const partId = d.part_id ?? "";
      const qty = receiveQty[partId];

      if (!qty || qty <= 0) {
        throw new Error(
          `Qty receive untuk part ${d.dtl_pr_part_number} belum diisi`
        );
      }
      return {
        part_id: d.part_id,
        mr_id: d.mr_id,
        dtl_ri_part_number: d.dtl_pr_part_number,
        dtl_ri_part_name: d.dtl_pr_part_name,
        dtl_ri_satuan: d.dtl_pr_satuan,
        dtl_ri_qty: qty,
      };
    });

    const payload = {
      ri_kode,
      po_id: selectedPO.po_id,
      ri_lokasi,
      ri_tanggal: tanggal.toISOString().slice(0, 10),
      ri_keterangan,
      ri_pic: user.nama,
      details,
    };
    try{
    const success = await createRI(payload);
    if (!success) {
      toast.error("Gagal membuat Receive Item");
      return;
    }

    toast.success("Receive Item berhasil dibuat");
    setRefresh((p) => !p);
    event.currentTarget.reset();
    setSelectedPO(undefined);
    setSelectedPR(undefined);
    setReceiveQty({});
    }catch (err: any) {
        const message = err?.response?.data?.message;

        if (message) {
          toast.error(message);
        } else {
          console.error(err);
        }
      }
  }

  function getQtyPo(partId?: string) {
    if (!selectedPO || !partId) return undefined;
    return selectedPO.details.find((d) => d.part_id === partId)?.dtl_po_qty;
  }
  
  return (
    <form
      id="create-ri-form"
      onSubmit={handleSubmit}
      className="grid grid-cols-12 gap-4 relative"
    >
      {closed && (
        <div className="col-span-12 relative overflow-hidden rounded-xl border-[6px] border-red-700 bg-black">
          
          {/* STRIPE */}
          <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,rgba(255,0,0,0.5),rgba(255,0,0,0.5)_14px,rgba(0,0,0,0.7)_14px,rgba(0,0,0,0.7)_28px)] animate-pulse" />

          {/* CONTENT */}
          <div className="relative z-10 p-8 text-center space-y-3 text-red-100">
            <div className="text-4xl font-black tracking-widest uppercase">
              🚫 TRANSAKSI RI DITUTUP
            </div>

            <div className="text-lg font-semibold">
              RECEIVE ITEM TERKUNCI OLEH SISTEM
            </div>

            <div className="text-sm opacity-90">
              Periode RI sampai tanggal{" "}
              <span className="font-bold underline">
                {tanggal?.getDate()}
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
        {/* HEADER */}
        <div className="col-span-12 lg:col-span-6 space-y-4">
          <div>
            <Label>Kode RI</Label>
            <Input name="kode" required />
          </div>

          <div>
            <Label>Receive dari PO</Label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-between w-full">
                  {selectedPO?.po_kode ?? "Cari PO..."}
                  <ChevronsUpDownIcon className="h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0">
                <Command>
                  <CommandInput placeholder="Cari PO..." />
                  <CommandList>
                    <CommandEmpty>Tidak ada</CommandEmpty>
                    <CommandGroup>
                      {filteredPO.map((m) => (
                        <CommandItem
                          key={m.po_kode}
                          onSelect={() => {
                            setSelectedPO(m);
                            setOpen(false);
                          }}
                        >
                          <CheckIcon
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedPO?.po_kode === m.po_kode
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {m.po_kode}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* LOKASI & TANGGAL */}
        <div className="col-span-12 lg:col-span-6 space-y-4">
          <div>
            <Label>Gudang</Label>
            <Select name="penerima" required>
              <SelectTrigger>
                <SelectValue placeholder="Pilih gudang" />
              </SelectTrigger>
              <SelectContent>
                {LokasiList.map((l) =>
                  l.nama === "unassigned" ? null : (
                    <SelectItem key={l.kode} value={l.nama}>
                      {l.nama}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Tanggal RI</Label>
            <DatePicker value={tanggal} onChange={setTanggal} />
          </div>
        </div>

        {/* KETERANGAN */}
        <div className="col-span-12">
          <Label>Keterangan</Label>
          <Textarea name="keterangan" />
        </div>

        {/* ================= TABLE ================= */}
        <div className="col-span-12">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No</TableHead>
                <TableHead>Part Number</TableHead>
                <TableHead>Part Name</TableHead>
                <TableHead>Satuan</TableHead>
                <TableHead className="text-center">Qty Dikirim (PO)</TableHead>
                <TableHead className="text-center">Qty Diterima</TableHead>
                <TableHead>MR</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedPR?.details.map((item, i) => {
                const partId = item.part_id ?? "";
                const qtyPo = getQtyPo(partId) ?? item.dtl_pr_qty;

                return (
                  <TableRow key={i}>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell>{item.dtl_pr_part_number}</TableCell>
                    <TableCell>{item.dtl_pr_part_name}</TableCell>
                    <TableCell>{item.dtl_pr_satuan}</TableCell>
                    <TableCell className="text-center">{qtyPo}</TableCell>
                    <TableCell className="text-center">
                      {getQtyReceived(partId) + (receiveQty[partId] ?? 0)}
                    </TableCell>
                    <TableCell>{item.mr?.mr_kode}</TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        size="icon"
                        variant="edit"
                        disabled={closed}
                        className="text-orange-600 hover:text-orange-700"
                        onClick={() => {
                          if (closed) return;
                          setSelectedItem(item);
                          setOpenQtyDialog(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </fieldset>

      {/* ================= DIALOG EDIT QTY ================= */}
      <Dialog open={openQtyDialog} onOpenChange={setOpenQtyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Qty Receive</DialogTitle>
          </DialogHeader>

          {selectedItem && (
            <>
              <Label>Qty Dikirim</Label>
              <Input
                value={
                  getQtyPo(selectedItem.part_id) ??
                  selectedItem.dtl_pr_qty
                }
                disabled
              />

              <Label>Qty Diterima</Label>
              <Input
                type="number"
                min={1}
                max={
                  getQtyPo(selectedItem.part_id) ??
                  selectedItem.dtl_pr_qty
                }
                value={
                  receiveQty[selectedItem.part_id ?? ""] ??
                  (getQtyPo(selectedItem.part_id) ??
                    selectedItem.dtl_pr_qty)
                }
                onChange={(e) =>
                  
                  setReceiveQty((prev) => ({
                    ...prev,
                    [selectedItem.part_id ?? ""]: Number(e.target.value),
                  }))
                }
              />
            </>
          )}

          <div className="flex justify-end">
            <Button
              type="button"
              className="!bg-green-600 hover:!bg-green-700 text-white"
              onClick={() => setOpenQtyDialog(false)}
            >
              Simpan
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </form>
  );
}