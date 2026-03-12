import { useEffect, useMemo, useState } from "react";
import WithSidebar from "@/components/layout/WithSidebar";
import SectionContainer, {
  SectionHeader,
  SectionBody,
} from "@/components/content-container";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DatePicker } from "@/components/date-picker";

import { FileSpreadsheet, Search, X, Filter } from "lucide-react";

import { downloadSpbExcel, getAllReport } from "@/services/spb";
import type { SpbReport } from "@/types";
import { formatTanggal } from "@/lib/utils";
import { toast } from "sonner";

export default function ReportSpb() {
  const [data, setData] = useState<SpbReport[]>([]);
  const [search, setSearch] = useState("");

  // 🔥 FILTER STATE
  const [statusFilter, setStatusFilter] = useState<
    "" | "NO_PO" | "NO_DO" | "NO_INV"
  >("");
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  useEffect(() => {
    getAllReport().then(setData);
  }, []);

const filtered = useMemo(() => {
  let result = [...data];

  // 🔍 GLOBAL SEARCH
  if (search) {
    const q = search.toLowerCase();
    result = result.filter(
      (s) =>
        s.spb_no?.toLowerCase().includes(q) ||
        s.dtl_spb_part_name?.toLowerCase().includes(q) ||
        s.dtl_spb_part_number?.toLowerCase().includes(q) ||
        s.po_no?.toLowerCase().includes(q) ||
        s.do_no?.toLowerCase().includes(q) ||
        s.invoice_no?.toLowerCase().includes(q)
    );
  }

  // 🔥 STATUS FILTER (PENTING FIX DI SINI)
  if (statusFilter === "NO_PO") {
    result = result.filter(
      (s) => !s.po_no || s.po_no.trim() === ""
    );
  }

  if (statusFilter === "NO_DO") {
    result = result.filter(
      (s) =>
        s.po_no &&
        s.po_no.trim() !== "" &&
        (!s.do_no || s.do_no.trim() === "")
    );
  }

  if (statusFilter === "NO_INV") {
    result = result.filter(
      (s) =>
        s.do_no &&
        s.do_no.trim() !== "" &&
        (!s.invoice_no || s.invoice_no.trim() === "")
    );
  }

  if (startDate) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    result = result.filter((s) => {
      if (!s.spb_tanggal) return false;
      const spbDate = new Date(s.spb_tanggal);
      spbDate.setHours(0, 0, 0, 0);
      return spbDate >= start;
    });
  }

  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    result = result.filter((s) => {
      if (!s.spb_tanggal) return false;
      const spbDate = new Date(s.spb_tanggal);
      return spbDate <= end;
    });
  }

  return result;
}, [data, search, statusFilter, startDate, endDate]);

  function resetFilter() {
    setSearch("");
    setStatusFilter("");
    setStartDate(undefined);
    setEndDate(undefined);
    toast.success("Filter direset");
  }

  return (
    <WithSidebar>
      <SectionContainer span={12}>
        <SectionHeader>Report SPB</SectionHeader>

        <SectionBody>
          <div className="flex flex-wrap items-center gap-3">

            {/* SEARCH */}
            <div className="relative flex-1 min-w-[260px]">
              <Input
                placeholder="Cari SPB / Part / PO / DO / Invoice"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pr-10 bg-transparent"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>

            {/* FILTER POPOVER */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon">
                  <Filter className="w-4 h-4" />
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-80 space-y-4">
                <div>
                  <h4 className="font-medium">Filter Report</h4>
                  <p className="text-sm text-muted-foreground">
                    Saring berdasarkan status & tanggal
                  </p>
                </div>

                <div className="grid gap-3">

                  <div>
                    <Label>Status Progress</Label>
                    <select
                      value={statusFilter}
                      onChange={(e) =>
                        setStatusFilter(e.target.value as any)
                      }
                      className="w-full border rounded-md px-2 py-1 text-sm"
                    >
                      <option value="">Semua</option>
                      <option value="NO_PO">Belum PO</option>
                      <option value="NO_DO">Belum DO</option>
                      <option value="NO_INV">Belum Invoice</option>
                    </select>
                  </div>

                  <div>
                    <Label>Dari Tanggal SPB</Label>
                    <DatePicker value={startDate} onChange={setStartDate} />
                  </div>

                  <div>
                    <Label>Sampai Tanggal SPB</Label>
                    <DatePicker value={endDate} onChange={setEndDate} />
                  </div>

                </div>
              </PopoverContent>
            </Popover>

            {/* RESET */}
            <Button variant="outline" size="icon" onClick={resetFilter}>
              <X className="w-4 h-4" />
            </Button>

            {/* EXPORT */}
            <Button
              variant="outline"
              size="icon"
              onClick={() =>
                downloadSpbExcel({
                  search,
                  status: statusFilter,
                  startDate,
                  endDate,
                })
              }
            >
              <FileSpreadsheet className="w-4 h-4" />
            </Button>
          </div>
        </SectionBody>
      </SectionContainer>

      {/* TABLE */}
      <div className="relative mt-4">
        <div className="absolute inset-x-0">
          <div className="px-4">
            <div className="rounded-md border bg-white dark:bg-zinc-900 p-4 shadow-sm w-full">
              <div className="flex justify-between items-center mb-3">
                <p className="font-semibold">
                  Daftar SPB
                  <span className="ml-2 text-xs text-muted-foreground">
                    ({filtered.length} data)
                  </span>
                </p>
              </div>

              <div className="w-full overflow-x-auto overflow-y-auto max-h-[65vh]">
                <table className="w-full min-w-[2200px] text-xs border">
                <thead className="bg-gray-50 dark:bg-zinc-800">
                  <tr>
                    {[
                      "NO",
                      "TGL SPB",
                      "NO SPB",
                      "PART NUMBER",
                      "PART NAME",
                      "QTY",
                      "UOM",
                      "KODE UNIT",
                      "TYPE UNIT",
                      "BRAND",
                      "HM",
                      "PROBLEM / REMARK",
                      "SECTION",
                      "PIC GMI",
                      "PIC PPA",
                      "NO WO",
                      "DATE INPUT SPB",
                      "STATUS",
                      "TGL SPB to PO",
                      "NO PO",
                      "NO SO",
                      "DATE INPUT PO",
                      "NO DO",
                      "DATE INPUT DO",
                      "NO INVOICE",
                      "TGL INVOICE",
                      "TGL EMAIL",
                    ].map((h) => (
                      <th
                        key={h}
                        className="border px-3 py-2 text-left whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                  <tbody>
                    {filtered.length > 0 ? (
                      filtered.map((spb, i) => (
                        <tr key={i} className="border-b hover:bg-gray-50 dark:hover:bg-zinc-800">
                          <td className="border px-3 py-2">{i + 1}</td>

                          <td className="border px-3 py-2">
                            {formatTanggal(spb.spb_tanggal)}
                          </td>

                          <td className="border px-3 py-2 font-medium">
                            {spb.spb_no}
                          </td>

                          <td className="border px-3 py-2">
                            {spb.dtl_spb_part_number}
                          </td>

                          <td className="border px-3 py-2">
                            {spb.dtl_spb_part_name}
                          </td>

                          <td className="border px-3 py-2">
                            {spb.dtl_spb_qty}
                          </td>

                          <td className="border px-3 py-2">
                            {spb.dtl_spb_part_satuan}
                          </td>

                          <td className="border px-3 py-2">
                            {spb.spb_kode_unit || "-"}
                          </td>

                          <td className="border px-3 py-2">
                            {spb.spb_tipe_unit || "-"}
                          </td>

                          <td className="border px-3 py-2">
                            {spb.spb_brand || "-"}
                          </td>

                          <td className="border px-3 py-2">
                            {spb.spb_hm ?? "-"}
                          </td>

                          <td className="border px-3 py-2">
                            {spb.spb_problem_remark || "-"}
                          </td>

                          <td className="border px-3 py-2">
                            {spb.spb_section}
                          </td>

                          <td className="border px-3 py-2">
                            {spb.spb_pic_gmi}
                          </td>

                          <td className="border px-3 py-2">
                            {spb.spb_pic_ppa}
                          </td>

                          <td className="border px-3 py-2">
                            {spb.spb_no_wo}
                          </td>

                          <td className="border px-3 py-2">
                            {formatTanggal(spb.spb_created_at)}
                          </td>

                          <td className="border px-3 py-2">
                            {spb.spb_status}
                          </td>

                          <td className="border px-3 py-2">
                            {formatTanggal(spb.spb_tanggal)}
                          </td>

                          <td className="border px-3 py-2">
                            {spb.po_no ?? "-"}
                          </td>

                          <td className="border px-3 py-2">
                            {spb.so_no ?? "-"}
                          </td>

                          <td className="border px-3 py-2">
                            {formatTanggal(spb.po_created_at)}
                          </td>

                          <td className="border px-3 py-2">
                            {spb.do_no ?? "-"}
                          </td>

                          <td className="border px-3 py-2">
                            {formatTanggal(spb.do_created_at)}
                          </td>

                          <td className="border px-3 py-2">
                            {spb.invoice_no ?? "-"}
                          </td>

                          <td className="border px-3 py-2">
                            {formatTanggal(spb.invoice_date)}
                          </td>

                          <td className="border px-3 py-2">
                            {formatTanggal(spb.invoice_email_date)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={27} className="text-center py-10">
                          Tidak ada data
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="h-[420px]" />
      </div>
    </WithSidebar>
  );
}