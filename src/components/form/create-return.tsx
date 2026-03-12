import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { toast } from "sonner";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { DatePicker } from "../date-picker";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";

import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";

import { getAllSpb, getSpbByKode } from "@/services/spb";
import { createReturnSpb, generateRtn } from "@/services/return";

import type { Spb, SpbDetail } from "@/types";

interface Props {
  user: any;
  setRefresh: Dispatch<SetStateAction<boolean>>;
}

export default function CreateReturnSpbForm({
  user,
  setRefresh,
}: Props) {
  const [open, setOpen] = useState(false);
  const [spbList, setSpbList] = useState<Spb[]>([]);
  const [selectedSpb, setSelectedSpb] = useState<Spb>();
  const [details, setDetails] = useState<SpbDetail[]>([]);
  const [tanggal, setTanggal] = useState<Date | undefined>(new Date());
  const [returnQty, setReturnQty] = useState<Record<string, number>>({});
  const [rtnKode, setRtnKode] = useState("");
  const [loadingKode, setLoadingKode] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [rtnNote, setRtnNote] = useState("");


  useEffect(() => {
    loadKode();
  }, []);

  async function loadKode() {
    try {
      setLoadingKode(true);
      const kode = await generateRtn();
      if (!kode) throw new Error();
      setRtnKode(kode);
    } catch {
      toast.error("Gagal generate kode return");
      setRtnKode("");
    } finally {
      setLoadingKode(false);
    }
  }

  useEffect(() => {
    async function fetchSpb() {
      try {
        const res = await getAllSpb();
        setSpbList(res);
      } catch {
        toast.error("Gagal mengambil data SPB");
      }
    }
    fetchSpb();
  }, []);

  useEffect(() => {
    async function fetchDetail() {
      if (!selectedSpb) {
        setDetails([]);
        return;
      }

      try {
        const res = await getSpbByKode(selectedSpb.spb_no);
        setDetails(Array.isArray(res?.details) ? res.details : []);
        setReturnQty({});
      } catch {
        toast.error("Gagal mengambil detail SPB");
        setDetails([]);
      }
    }

    fetchDetail();
  }, [selectedSpb]);

  function getSisa(d: SpbDetail) {
    return Number(d.dtl_spb_qty) - Number(d.dtl_spb_qty_returned ?? 0);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!rtnKode) {
      toast.error("Kode return belum tersedia");
      return;
    }

    if (!selectedSpb || !tanggal) {
      toast.error("Data belum lengkap");
      return;
    }

    const items: { spb_dtl_id: number; qty_return: number }[] = [];

    for (const d of details) {
      const qty = returnQty[d.spb_dtl_id] ?? 0;
      if (qty <= 0) continue;

      const sisa = getSisa(d);

      if (qty > sisa) {
        toast.error(
          `Qty return ${d.dtl_spb_part_number} melebihi sisa`
        );
        return;
      }

      items.push({
        spb_dtl_id: d.spb_dtl_id,
        qty_return: qty,
      });
    }

    if (items.length === 0) {
      toast.error("Minimal 1 item harus direturn");
      return;
    }

    try {
      setLoadingSubmit(true);

      await createReturnSpb({
        rtn_kode: rtnKode,
        spb_id: selectedSpb.spb_id,
        rtn_tanggal: tanggal.toISOString().slice(0, 10),
        rtn_note: rtnNote,
        details: items,
      });

      toast.success("Return SPB berhasil dibuat");

      setRefresh((p) => !p);
      setSelectedSpb(undefined);
      setDetails([]);
      setReturnQty({});
      setTanggal(new Date());

      await loadKode(); 
    } catch (err: any) {
      toast.error(err.message ?? "Gagal membuat return");
    } finally {
      setLoadingSubmit(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} id="create-return-spb-form" className="space-y-6">
      <div className="border rounded-lg p-4 space-y-4">
        {/* <h3 className="font-semibold text-lg">Form Return SPB</h3> */}

        <div className="grid grid-cols-12 gap-4">

          <div className="col-span-12 lg:col-span-4 space-y-2">
            <Label>Kode Return</Label>
            <div className="flex gap-2">
              <Input value={rtnKode} disabled />
              <Button
                type="button"
                variant="outline"
                onClick={loadKode}
                disabled={loadingKode}
              >
                {loadingKode ? "Loading..." : "Refresh"}
              </Button>
            </div>
          </div>
          <div className="col-span-12 lg:col-span-4 space-y-2">
            <Label>Pilih SPB</Label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-between w-full">
                  {selectedSpb?.spb_no ?? "Cari SPB..."}
                  <ChevronsUpDownIcon className="h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>

              <PopoverContent className="p-0">
                <Command>
                  <CommandInput placeholder="Cari SPB..." />
                  <CommandList>
                    <CommandEmpty>Tidak ada</CommandEmpty>
                    <CommandGroup>
                      {spbList.map((s) => (
                        <CommandItem
                          key={s.spb_id}
                          onSelect={() => {
                            setSelectedSpb(s);
                            setOpen(false);
                          }}
                        >
                          <CheckIcon
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedSpb?.spb_id === s.spb_id
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {s.spb_no}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="col-span-12 lg:col-span-4 space-y-2">
            <Label>Tanggal Return</Label>
            <DatePicker value={tanggal} onChange={setTanggal} />
          </div>

          <div className="col-span-12 space-y-2">
            <Label>Catatan Return</Label>
            <Textarea
              placeholder="Contoh: barang rusak, salah kirim vendor, dll"
              value={rtnNote}
              onChange={(e) => setRtnNote(e.target.value)}
              className="min-h-[90px]"
            />
          </div>

        </div>
      </div>


      <div className="border rounded-lg p-4 space-y-4">

        <h3 className="font-semibold text-lg">Item SPB</h3>

        <div className="rounded-md border overflow-hidden">
          <Table>

            <TableHeader>
              <TableRow>
                <TableHead>Part Number</TableHead>
                <TableHead className="text-center">Qty SPB</TableHead>
                <TableHead className="text-center">Sudah Return</TableHead>
                <TableHead className="text-center">Sisa</TableHead>
                <TableHead className="text-center">Qty Return</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {details.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6">
                    Tidak ada data
                  </TableCell>
                </TableRow>
              )}

              {details.map((d) => {
                const sisa = getSisa(d);

                return (
                  <TableRow key={d.spb_dtl_id}>
                    <TableCell>{d.dtl_spb_part_number}</TableCell>

                    <TableCell className="text-center">
                      {d.dtl_spb_qty}
                    </TableCell>

                    <TableCell className="text-center">
                      {d.dtl_spb_qty_returned ?? 0}
                    </TableCell>

                    <TableCell className="text-center font-medium">
                      {sisa}
                    </TableCell>

                    <TableCell className="text-center">
                      <Input
                        type="number"
                        min={0}
                        max={sisa}
                        value={returnQty[d.spb_dtl_id] ?? ""}
                        onChange={(e) =>
                          setReturnQty((prev) => ({
                            ...prev,
                            [d.spb_dtl_id]: Number(e.target.value),
                          }))
                        }
                        className="w-24 mx-auto"
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>

          </Table>
        </div>

      </div>


      {/* <div className="flex justify-end">
        <Button
          type="submit"
          disabled={loadingSubmit}
          className="min-w-[140px]"
        >
          {loadingSubmit ? "Menyimpan..." : "Simpan Return"}
        </Button>
      </div> */}

    </form>
  );
}