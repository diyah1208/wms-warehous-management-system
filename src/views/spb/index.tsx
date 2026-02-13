import { useEffect, useMemo, useState } from "react";
import WithSidebar from "@/components/layout/WithSidebar";
import SectionContainer, {
  SectionHeader,
  SectionBody,
} from "@/components/content-container";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, Search, X } from "lucide-react";

import { downloadSpbExcel, getAllReport } from "@/services/spb";
import type { SpbReport } from "@/types";
import { formatTanggal } from "@/lib/utils";
import { toast } from "sonner";

export default function ReportSpb() {
  const [data, setData] = useState<SpbReport[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getAllReport().then(setData);
  }, []);

  const filtered = useMemo(() => {
    let result = [...data];
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
    return result;
  }, [data, search]);

  function resetFilter() {
    setSearch("");
    toast.success("Filter direset");
  }

  return (
    <WithSidebar>
      <SectionContainer span={12}>
        <SectionHeader>Report SPB</SectionHeader>
        <SectionBody>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[260px]">
              <Input
                placeholder="Cari SPB / Part / PO / DO / Invoice"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pr-10 bg-transparent"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>

            <Button variant="outline" size="icon" onClick={resetFilter}>
              <X className="w-4 h-4" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={downloadSpbExcel}
              className="text-green-600 border-green-600 hover:bg-green-50"
            >
              <FileSpreadsheet className="w-4 h-4" />
            </Button>
          </div>
        </SectionBody>
      </SectionContainer>

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

              {/* SCROLL */}
              <div className="w-full overflow-x-auto overflow-y-auto max-h-[65vh]">
                <table className="w-full min-w-[2200px] text-xs border text-zinc-900 dark:text-zinc-100">
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
                        "DATE INPUT",
                        "STATUS",
                        "TGL SPB to PO",
                        "NO PO",
                        "NO SO",
                        "DATE INPUT",
                        "NO DO",
                        "DATE INPUT",
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
                      
                      <td className="border border-border px-3 py-2">{i + 1}</td>
                      
                      {/* TGL SPB */}
                      <td className="border border-border px-3 py-2">
                        {formatTanggal(spb.spb_tanggal)}
                      </td>
                      
                      <td className="border px-3 py-2 font-medium">{spb.spb_no}</td>
                      
                      <td className="border border-border px-3 py-2">{spb.dtl_spb_part_number}</td>
                      <td className="border border-border px-3 py-2">{spb.dtl_spb_part_name}</td>
                      <td className="border border-border px-3 py-2">{spb.dtl_spb_qty}</td>
                      <td className="border border-border px-3 py-2">{spb.dtl_spb_part_satuan}</td>
                      
                      <td className="border border-border px-3 py-2">{spb.spb_kode_unit || "-"}</td>
                      <td className="border border-border px-3 py-2">{spb.spb_tipe_unit || "-"}</td>
                      <td className="border border-border px-3 py-2">{spb.spb_brand || "-"}</td>
                      <td className="border border-border px-3 py-2">{spb.spb_hm ?? "-"}</td>
                      <td className="border border-border px-3 py-2">{spb.spb_problem_remark || "-"}</td>
                      
                      <td className="border border-border px-3 py-2">{spb.spb_section}</td>
                      <td className="border border-border px-3 py-2">{spb.spb_pic_gmi}</td>
                      <td className="border border-border px-3 py-2">{spb.spb_pic_ppa}</td>
                      
                      <td className="border border-border px-3 py-2">{spb.spb_no_wo}</td>
                      
                      {/* DATE INPUT SPB */}
                      <td className="border border-border px-3 py-2">
                        {formatTanggal(spb.spb_created_at)}
                      </td>
                      
                      {/* STATUS */}
                      <td className="border border-border px-3 py-2">{spb.spb_status}</td>
                      
                      {/* TGL SPB TO PO */}
                      <td className="border border-border px-3 py-2">
                        {formatTanggal(spb.spb_tanggal)}
                      </td>
                      
                      <td className="border border-border px-3 py-2">{spb.po_no ?? "-"}</td>
                      <td className="border border-border px-3 py-2">{spb.so_no ?? "-"}</td>
                      
                      {/* DATE INPUT PO */}
                      <td className="border border-border px-3 py-2">
                        {formatTanggal(spb.po_created_at)}
                      </td>
                      
                      <td className="border border-border px-3 py-2">{spb.do_no ?? "-"}</td>
                      
                      {/* DATE INPUT DO */}
                      <td className="border border-border px-3 py-2">
                        {formatTanggal(spb.do_created_at)}
                      </td>
                      
                      <td className="border border-border px-3 py-2">{spb.invoice_no ?? "-"}</td>
                      
                      <td className="border border-border px-3 py-2">
                        {formatTanggal(spb.invoice_date)}
                      </td>
                      
                      <td className="border border-border px-3 py-2">
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

        {/* JANGAN DIHAPUS */}
        <div className="h-[420px]" />
      </div>
    </WithSidebar>
  );
}
