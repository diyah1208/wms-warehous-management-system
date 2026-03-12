import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { toast } from "sonner";

import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";

import type { PO, PurchaseRequest, UserComplete, UserDb, MasterVendor} from "@/types";

import {
  Select,
  SelectContent,
  SelectGroup,
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
import { getOpenPr } from "@/services/purchase-request";
import { createPO } from "@/services/purchase-order";
import { DatePicker } from "../date-picker";
import { getMasterVendors } from "@/services/vendor";
import { formatRupiah, parseRupiah } from "@/lib/utils";

interface CreatePOFormProps {
  user: UserComplete | UserDb;
  setRefresh: Dispatch<SetStateAction<boolean>>;
}
 function toMysqlDatetime(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

export default function CreatePOForm({ user, setRefresh }: CreatePOFormProps) {
  const [open, setOpen] = useState(false);
  const [prList, setPrList] = useState<PurchaseRequest[]>([]);
  const [selectedPR, setSelectedPR] = useState<PurchaseRequest | undefined>();
  type PODetailInput = {
  part_id?: string | number;
  part_number: string;
  part_name: string;
  satuan: string;
  qty_pr: number;
  qty_po: number;
  harga: number;
  vendor_id?: string;
};

const [poDetails, setPoDetails] = useState<PODetailInput[]>([]);

  const [estimasi, setEstimasi] = useState<Date | undefined>();
  const [paymentTerm, setPaymentTerm] = useState<
  "CASH" | "COD" | "NET 7" | "NET 14" | "NET 30" | ""
>("");
  const [status, setStatus] = useState("pending");
  const [subStatus, setSubStatus] = useState(""); // Sub status baru
  const [kode, setKode] = useState(""); 
  const [keterangan, setKeterangan] = useState(""); 
type VendorOption = {
  vendor_id?: string;   // ✅ optional
  vendor_name: string;
};



const [vendorList, setVendorList] = useState<VendorOption[]>([]);
const [editingIndex, setEditingIndex] = useState<number | null>(null);



  useEffect(() => {
    async function fetchPR() {
      try {
        const res = await getOpenPr(); 
        //console.log("📦 Data PR dari API:", res);
        setPrList(Array.isArray(res) ? res : []);
      } catch (err) {
        console.error("Error fetching PR:", err);
        toast.error("Gagal mengambil data PR");
        setPrList([]);
      }
    }
    fetchPR();
  }, []);
useEffect(() => {
  async function fetchVendor() {
    try {
      const res: MasterVendor[] = await getMasterVendors();

      const mapped: VendorOption[] = res
        .filter((v) => v.is_active !== false) // optional
        .map((v) => ({
       vendor_id: v.vendor_id?.toString(), // ✅ TANPA ""
  vendor_name: `${v.vendor_no} - ${v.vendor_name}`,
        }));

      setVendorList(mapped);
    } catch (err) {
      toast.error("Gagal mengambil data vendor");
    }
  }
  fetchVendor();
}, []);

  // Reset sub status ketika status utama berubah
  useEffect(() => {
    setSubStatus("");
  }, [status]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!estimasi) {
      toast.error("Tanggal estimasi wajib diisi");
      return;
    }

    if (!selectedPR) {
      toast.error("Referensi PR wajib dipilih");
      return;
    }

    if (!kode.trim()) {
      toast.error("Kode PO wajib diisi");
      return;
    }
if (!paymentTerm) {
  toast.error("Payment Term wajib dipilih");
  return;
}

    if (!subStatus) {
      toast.error("Sub status wajib dipilih");
      return;
    }

  const invalidDetail = poDetails.some(
  (d) => d.qty_po <= 0 || d.harga <= 0 
);

if (invalidDetail) {
  toast.error("Qty PO dan Harga wajib diisi");
  return;
}



const payload: PO = {
  po_kode: kode.trim(),
  pr_id: selectedPR.pr_id!,
  po_tanggal: toMysqlDatetime(new Date()),
 po_estimasi: estimasi.toLocaleDateString("sv-SE"),
po_payment_term: paymentTerm,

  // 🔥 INI YANG DIPERBAIKI
  po_status: status,
  po_detail_status: subStatus,

  po_keterangan: keterangan.trim(),
  po_pic: user.nama,

  
details: poDetails.map((d) => ({
  part_id: d.part_id,
  dtl_po_part_number: d.part_number,
  dtl_po_part_name: d.part_name,
  dtl_po_satuan: d.satuan,
  dtl_po_qty: d.qty_po,

  // 🔥 HARUS ADA
  dtl_po_harga: Number(d.harga),
  vendor_id: Number(d.vendor_id),
})),



  created_at: toMysqlDatetime(new Date()),
  updated_at: toMysqlDatetime(new Date()),
};


    //console.log("📤 Payload yang dikirim:", payload);

    try {
      await createPO(payload);
      toast.success("Purchase Order berhasil dibuat");
      
      setKode("");
      setKeterangan("");
      setSelectedPR(undefined);
      setEstimasi(undefined);
      setStatus("pending");
      setSubStatus("");
      setOpen(false);
      
      setRefresh((prev) => !prev);
    } catch (err: any) {
      console.error("Error creating PO:", err);
      const errorMsg = err?.response?.data?.message || err?.message || "Gagal membuat PO";
      toast.error(errorMsg);
    }
  }

  return (
    <form
      id="create-po-form"
      onSubmit={handleSubmit}
      className="grid grid-cols-12 gap-4"
    >
      {/* KIRI */}
      <div className="col-span-12 lg:col-span-6 flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label>Kode PO<span className="text-red-500">*</span></Label>
          <Input 
            name="kode" 
            placeholder="Masukkan kode PO" 
            value={kode}
            onChange={(e) => setKode(e.target.value)}
            required 
          />
        </div>
   <div className="flex flex-col gap-2">
          <Label>Status Utama<span className="text-red-500">*</span></Label>
          <Select 
            name="status" 
            required 
            value={status} 
            onValueChange={setStatus}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Pilih status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="purchased">Purchased</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
  <Label>Vendor<span className="text-red-500">*</span></Label>

  <Select
    onValueChange={(val) => {
      setPoDetails((prev) =>
        prev.map((d) => ({
          ...d,
          vendor_id: val,
        }))
      );
    }}
  >
    <SelectTrigger className="w-full">
      <SelectValue placeholder="Pilih Vendor" />
    </SelectTrigger>

    <SelectContent>
      <SelectGroup>
        {vendorList
          .filter(
            (v): v is { vendor_id: string; vendor_name: string } =>
              v.vendor_id !== undefined
          )
          .map((v) => (
            <SelectItem key={v.vendor_id} value={v.vendor_id}>
              {v.vendor_name}
            </SelectItem>
          ))}
      </SelectGroup>
    </SelectContent>
  </Select>
</div>

<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  {/* Tanggal Estimasi */}
  <div className="flex flex-col gap-2">
    <Label>
      Tanggal Estimasi<span className="text-red-500">*</span>
    </Label>
    <DatePicker value={estimasi} onChange={setEstimasi} />
  </div>

  {/* Payment Term */}
  <div className="flex flex-col gap-2">
    <Label>
      Payment Term<span className="text-red-500">*</span>
    </Label>
    <Select
      value={paymentTerm}
      onValueChange={(val) =>
        setPaymentTerm(val as typeof paymentTerm)
      }
      required
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Pilih Payment Term" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="CASH">Cash</SelectItem>
        <SelectItem value="COD">COD</SelectItem>
        <SelectItem value="NET 7">Net 7</SelectItem>
        <SelectItem value="NET 14">Net 14</SelectItem>
        <SelectItem value="NET 30">Net 30</SelectItem>
      </SelectContent>
    </Select>
  </div>
  </div>
    </div>


    

    

      {/* KANAN */}
      <div className="col-span-12 lg:col-span-6 flex flex-col gap-4">
     
    <div className="flex flex-col gap-2">
          <Label>Referensi PR<span className="text-red-500">*</span></Label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="justify-between"
              >
                {selectedPR ? selectedPR.pr_kode : "Pilih PR"}
                <ChevronsUpDownIcon className="h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>

            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
              <Command>
                <CommandInput placeholder="Pilih PR" />
                <CommandList>
                  <CommandEmpty>Tidak ada PR tersedia</CommandEmpty>
                  <CommandGroup>
                    {prList.length > 0 ? (
                      prList.map((pr) => (
                    <CommandItem
  key={pr.pr_id || pr.pr_kode}
  value={pr.pr_kode}
  onSelect={(currentValue) => {
   // console.log("✅ Selected:", currentValue, pr);

    setSelectedPR(pr);

    // 🔥 TAMBAHAN INI
    setPoDetails(
      pr.details.map((d) => ({
        part_id: d.part_id,
        part_number: d.dtl_pr_part_number,
        part_name: d.dtl_pr_part_name,
        satuan: d.dtl_pr_satuan,
        qty_pr: d.dtl_pr_qty,
        qty_po: Number(d.dtl_pr_qty), // default isi sama dgn PR
        harga: 0,
        vendor_id: undefined,
      }))
    );

    setOpen(false);
  }}
>

                          <CheckIcon
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedPR?.pr_kode === pr.pr_kode
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          <div className="flex flex-col">
                            <span className="font-medium">{pr.pr_kode}</span>
                            <span className="text-xs text-muted-foreground">
                              {pr.pr_lokasi} • {pr.pr_tanggal}
                            </span>
                          </div>
                        </CommandItem>
                      ))
                    ) : (
                      <div className="py-6 text-center text-sm text-muted-foreground">
                        Memuat data PR...
                      </div>
                    )}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Sub Status berdasarkan Status Utama */}
        {status && (
          <div className="flex flex-col gap-2">
            <Label>Detail Status<span className="text-red-500">*</span></Label>
            <Select 
              name="subStatus" 
              required 
              value={subStatus} 
              onValueChange={setSubStatus}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih detail status" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {status === "pending" && (
                    <>
                      <SelectItem value="OPEN 3A">
                        OPEN 3A - Barang belum dikirim (No Payment Issue)
                      </SelectItem>
                      <SelectItem value="OPEN 3B">
                        OPEN 3B - Barang belum dikirim (Ada Payment Issue)
                      </SelectItem>
                    </>
                  )}
                  {status === "purchased" && (
                    <SelectItem value="OPEN 4">
                      OPEN 4 - Barang sudah dikirim tapi belum sampai WH
                    </SelectItem>
                  )}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <Label>Person in Charge</Label>
          <Input value={user.nama} disabled />
        </div>
         <div className="flex flex-col gap-2">
  <Label>Keterangan</Label>
  <Textarea
    name="keterangan"
    placeholder="Keterangan"
    value={keterangan}
    onChange={(e) => setKeterangan(e.target.value)}
    className="min-h-[10px] resize-none"
  />
</div>
      </div>

      {/* KETERANGAN */}




      {/* TABLE ITEM PR */}
      <div className="col-span-12">
        <Label className="mb-2 block">
          Item dari PR {selectedPR ? `(${selectedPR.pr_kode})` : ""}
        </Label>
        <div className="border rounded-sm overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border [&>*]:border">
                <TableHead className="font-semibold text-center">No</TableHead>
                <TableHead className="font-semibold text-center">Part Number</TableHead>
                <TableHead className="font-semibold text-center">Part Name</TableHead>
                <TableHead className="font-semibold text-center">Satuan</TableHead>
                <TableHead className="font-semibold text-center">Qty PR</TableHead>
                  <TableHead className="font-semibold text-center">Qty PO</TableHead>
                  <TableHead className="font-semibold text-center">Input Harga</TableHead>
                  {/* <TableHead className="font-semibold text-center">Vendor</TableHead> */}

              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedPR?.details && selectedPR.details.length > 0 ? (
               poDetails.map((item, i) => (

                  <TableRow key={i} className="border [&>*]:border">
                    <TableCell className="text-center">{i + 1}</TableCell>
                <TableCell className="text-start">{item.part_number}</TableCell>
<TableCell className="text-start">{item.part_name}</TableCell>
<TableCell className="text-center">{item.satuan}</TableCell>
<TableCell className="text-center">{item.qty_pr}</TableCell>

                    <TableCell className="text-center">
  <Input
    type="number"
    min={1}
    value={item.qty_po}
    onChange={(e) => {
      const val = Number(e.target.value);
      setPoDetails((prev) =>
        prev.map((d, idx) =>
          idx === i ? { ...d, qty_po: val } : d
        )
      );
    }}
    className="text-center"
  />
</TableCell>

<TableCell className="text-center">
<Input
  type="text"
  inputMode="numeric"
  value={
    editingIndex === i
      ? item.harga.toString()
      : formatRupiah(item.harga)
  }
  placeholder="Rp 0,00"
  onFocus={() => setEditingIndex(i)}
  onBlur={() => setEditingIndex(null)}
  onChange={(e) => {
    const raw = parseRupiah(e.target.value);

    setPoDetails((prev) =>
      prev.map((d, idx) =>
        idx === i ? { ...d, harga: raw } : d
      )
    );
  }}
  className="text-right"
/>

</TableCell>
{/* <TableCell className="text-center">
  <Select
    value={item.vendor_id}
    onValueChange={(val) => {
      setPoDetails((prev) =>
        prev.map((d, idx) =>
          idx === i ? { ...d, vendor_id: val } : d
        )
      );
    }}
  >
    <SelectTrigger>
      <SelectValue placeholder="Pilih Vendor" />
    </SelectTrigger>
    <SelectContent>
      <SelectGroup>
  {vendorList
  .filter((v): v is { vendor_id: string; vendor_name: string } => 
    v.vendor_id !== undefined
  )
  .map((v) => (
    <SelectItem key={v.vendor_id} value={v.vendor_id}>
      {v.vendor_name}
    </SelectItem>
  ))}

      </SelectGroup>
    </SelectContent>
  </Select>
</TableCell> */}


                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    {selectedPR 
                      ? "Tidak ada item dalam PR ini" 
                      : "Pilih PR terlebih dahulu untuk melihat item"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </form>
  );
}