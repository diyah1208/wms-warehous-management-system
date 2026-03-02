import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useMemo, useState } from "react";
import type { MRDetail, Stock } from "@/types";
import { updateMR } from "@/services/material-request";
import { useAuth } from "@/context/AuthContext";
import { Pencil } from "lucide-react";

interface Props {
  mrId: string;
  detail: MRDetail;
  stocks: Stock[];
  mrStatus: string;
  mrLokasi: string;
  onSuccess: () => void;
}

export function EditMRDetailDialog({
  mrId,
  detail,
  stocks,
  mrStatus,
  mrLokasi,
  onSuccess,
}: Props) {
  const isEditable = mrStatus === "open";
const [open, setOpen] = useState(false)

  const [partNumber, setPartNumber] = useState(detail.dtl_mr_part_number);
  const [partName, setPartName] = useState(detail.dtl_mr_part_name);
  const [satuan, setSatuan] = useState(detail.dtl_mr_satuan);
  const [prioritas, setPrioritas] = useState(detail.dtl_mr_prioritas);
  const [qtyRequest, setQtyRequest] = useState(detail.dtl_mr_qty_request);
  const [partId, setPartId] = useState(detail.part_id);
const { user } = useAuth();

  /** 🔹 stok saat ini (BERDASARKAN PART + LOKASI MR) */
  const currentStock = useMemo(() => {
    const stock = stocks.find(
      (s) =>
        s.barang?.part_number === partNumber &&
        s.stk_location?.toLowerCase() === mrLokasi.toLowerCase()
    );
    return stock?.stk_qty ?? 0;
  }, [stocks, partNumber, mrLokasi]);

  /** 🔹 saat ganti part number */
  function handlePartChange(pn: string) {
    const stock = stocks.find(
      (s) =>
        s.barang?.part_number === pn &&
        s.stk_location?.toLowerCase() === mrLokasi.toLowerCase()
    );
    if (!stock) return;

    setPartNumber(stock.barang.part_number);
    setPartName(stock.barang.part_name);
    setSatuan(stock.barang.part_satuan);
    setPartId(stock.part_id);
  }
async function handleSubmit() {
  try {
    await updateMR(mrId, {
      dtl_mr_id: detail.dtl_mr_id!,
      // part_id: detail.part_id!,
      part_id: partId!,
      dtl_mr_part_number: partNumber,
      dtl_mr_part_name: partName,
      dtl_mr_satuan: satuan,
      dtl_mr_prioritas: prioritas,
      dtl_mr_qty_request: qtyRequest,
      mr_last_edit_by: user?.nama, // 🔥 INI KUNCINYA
    });

    toast.success("Detail MR berhasil diupdate");
     setOpen(false);
    onSuccess();
  } catch (error) {
    toast.error("Gagal update detail MR");
  }
}


  return (
    <Dialog open={open} onOpenChange={setOpen}>
  <DialogTrigger asChild>
    <Button
  type="button"
  variant="edit"
  size="icon"
  disabled={!isEditable}
  title="Edit Detail MR"
>
  <Pencil />
</Button>

  </DialogTrigger>


      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Detail Material Request</DialogTitle>
          <DialogDescription>
            Anda hanya dapat mengubah Part Number, Prioritas, dan Jumlah
            Permintaan selama MR masih berstatus OPEN.
          </DialogDescription>
        </DialogHeader>

        {/* ===== FORM ===== */}
{/* ===== FORM ===== */}
<div className="grid grid-cols-12 gap-4">

  {/* Part Number - FULL */}
  <div className="col-span-12">
    <Label>Part Number<span className="text-red-500">*</span></Label>
    <Select
      value={partNumber}
      onValueChange={handlePartChange}
      disabled={!isEditable}
    >
      <SelectTrigger className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Part Number</SelectLabel>
          {stocks
            .filter(
              (s) =>
                s.stk_location?.toLowerCase() ===
                mrLokasi.toLowerCase()
            )
            .map((s) => (
              <SelectItem
                key={`${s.part_id}-${s.stk_location}`}
                value={s.barang.part_number}
              >
                {s.barang.part_number}
              </SelectItem>
            ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  </div>

  {/* Nama Part */}
  <div className="col-span-12 md:col-span-6">
    <Label>Nama Part</Label>
    <Input value={partName} disabled />
  </div>

  {/* Satuan */}
  <div className="col-span-12 md:col-span-6">
    <Label>Satuan</Label>
    <Input value={satuan} disabled />
  </div>

  {/* Prioritas */}
  <div className="col-span-12 md:col-span-6">
    <Label>Prioritas<span className="text-red-500">*</span></Label>
    <Select
      value={prioritas}
      onValueChange={setPrioritas}
      disabled={!isEditable}
    >
      <SelectTrigger className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="p1">P1</SelectItem>
        <SelectItem value="p2">P2</SelectItem>
        <SelectItem value="p3">P3</SelectItem>
      </SelectContent>
    </Select>
  </div>

  {/* Jumlah Permintaan */}
  <div className="col-span-12 md:col-span-6">
    <Label>Jumlah Permintaan<span className="text-red-500">*</span></Label>
    <Input
      type="number"
      value={qtyRequest}
      onChange={(e) => setQtyRequest(Number(e.target.value))}
      disabled={!isEditable}
    />
  </div>

  {/* Jumlah Diterima */}
  <div className="col-span-12 md:col-span-6">
    <Label>Jumlah Diterima</Label>
    <Input value={detail.dtl_mr_qty_received} disabled />
  </div>

  {/* Stok Saat Ini */}
  <div className="col-span-12 md:col-span-6">
    <Label>Stok Saat Ini</Label>
    <Input value={currentStock} disabled />
  </div>

</div>


        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Batal</Button>
          </DialogClose>
          <Button onClick={handleSubmit} disabled={!isEditable}
            className="!bg-orange-500 hover:!bg-orange-600 text-white">
            Edit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}