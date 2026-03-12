import SectionContainer, {
  SectionHeader,
  SectionBody,
  SectionFooter,
} from "@/components/content-container";
import WithSidebar from "@/components/layout/WithSidebar";
import { MyPagination } from "@/components/my-pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DatePicker } from "@/components/date-picker";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/context/AuthContext";
import { getAllSpbInv } from "@/services/spb";
import type { SpbInvoice } from "@/types";
import { PagingSize } from "@/types/enum";
import { Plus, X, Filter, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import CreateSpbInvoiceForm from "@/components/form/create-spb-inv";

export default function SpbInvoicePage() {
  const { user } = useAuth();
  const [refresh, setRefresh] = useState(false);

  const [rows, setRows] = useState<SpbInvoice[]>([]);
  const [filtered, setFiltered] = useState<SpbInvoice[]>([]);
  const [toShow, setToShow] = useState<SpbInvoice[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  // 🔎 FILTER STATE
  const [noSpb, setNoSpb] = useState("");
  const [noInvoice, setNoInvoice] = useState("");
  const [spbLokasi, setSpbLokasi] = useState("");
  const [noDo, setNoDo] = useState("");
  const [invoiceDate, setInvoiceDate] = useState<Date | undefined>();
  const [emailDate, setEmailDate] = useState<Date | undefined>();

  /* =========================
     FETCH DATA
  ========================= */
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await getAllSpbInv();
        setRows(res);
      } catch {
        toast.error("Gagal mengambil data Invoice");
      }
    }
    fetchData();
  }, [refresh]);

  /* =========================
     FILTER
  ========================= */
  useEffect(() => {
    let temp = rows;

    if (noSpb) {
      temp = temp.filter((r) =>
        r.spb?.spb_no?.toLowerCase().includes(noSpb.toLowerCase())
      );
    }

    if (noInvoice) {
      temp = temp.filter((r) =>
        r.invoice_no?.toLowerCase().includes(noInvoice.toLowerCase())
      );
    }

    if (noDo) {
      temp = temp.filter((r) =>
        r.do?.do_no?.toLowerCase().includes(noDo.toLowerCase())
      );
    }

    if (invoiceDate) {
      temp = temp.filter((r) => {
        if (!r.invoice_date) return false;
        const d = new Date(r.invoice_date);
        return (
          d.getFullYear() === invoiceDate.getFullYear() &&
          d.getMonth() === invoiceDate.getMonth() &&
          d.getDate() === invoiceDate.getDate()
        );
      });
    }

    if (emailDate) {
      temp = temp.filter((r) => {
        if (!r.invoice_email_date) return false;
        const d = new Date(r.invoice_email_date);
        return (
          d.getFullYear() === emailDate.getFullYear() &&
          d.getMonth() === emailDate.getMonth() &&
          d.getDate() === emailDate.getDate()
        );
      });
    }
     if (spbLokasi) {
      temp = temp.filter((r) =>
        r.do?.po?.spb?.spb_gudang?.toLowerCase().includes(spbLokasi.toLowerCase())
      );
    }

    setFiltered(temp);
    setCurrentPage(1);
  }, [rows, noSpb, noInvoice, noDo, invoiceDate, emailDate,spbLokasi]);

  /* =========================
     PAGINATION
  ========================= */
  useEffect(() => {
    const start = (currentPage - 1) * PagingSize;
    const end = start + PagingSize;
    setToShow(filtered.slice(start, end));
  }, [filtered, currentPage]);

  function resetFilter() {
    setNoSpb("");
    setNoInvoice("");
    setNoDo("");
    setInvoiceDate(undefined);
    setEmailDate(undefined);
    toast.success("Filter direset");
  }

  return (
    <WithSidebar>
      <SectionContainer span={12}>
        <SectionHeader>SPB - Invoice</SectionHeader>

        <SectionBody className="grid grid-cols-12 gap-3">

          {/* 🔍 SEARCH BAR */}
          <div className="col-span-12 flex items-center gap-2">

            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari No SPB..."
                value={noSpb}
                onChange={(e) => setNoSpb(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* FILTER POPOVER */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon">
                  <Filter className="w-4 h-4" />
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-80 space-y-4">
                <div className="space-y-1">
                  <h4 className="font-medium">Filter Lanjutan</h4>
                  <p className="text-sm text-muted-foreground">
                    Saring data invoice.
                  </p>
                </div>

                <div className="grid gap-3">
                  <div>
                    <Label>No Invoice</Label>
                    <Input
                      value={noInvoice}
                      onChange={(e) => setNoInvoice(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>No DO</Label>
                    <Input
                      value={noDo}
                      onChange={(e) => setNoDo(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>Tanggal Invoice</Label>
                    <DatePicker
                      value={invoiceDate}
                      onChange={setInvoiceDate}
                    />
                  </div>

                  <div>
                    <Label>Tanggal Email</Label>
                    <DatePicker
                      value={emailDate}
                      onChange={setEmailDate}
                    />
                  </div>
                   <div>
                    <Label>Lokasi SPB</Label>
                    <Input
                      value={spbLokasi}
                      onChange={(e) => setSpbLokasi(e.target.value)}
                    />
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <Button variant="outline" size="icon" onClick={resetFilter}>
              <X className="w-4 h-4 text-red-500" />
            </Button>
          </div>

          {/* TABLE */}
          <div className="col-span-12 border rounded-sm overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No</TableHead>
                  <TableHead>No SPB</TableHead>
                  <TableHead>Lokasi</TableHead>
                  <TableHead>No DO</TableHead>
                  <TableHead>No Invoice</TableHead>
                  <TableHead>Tanggal Invoice</TableHead>
                  <TableHead>Tanggal Email</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {toShow.length > 0 ? (
                  toShow.map((row, i) => (
                    <TableRow key={row.spb_invoice_id}>
                      <TableCell>
                        {PagingSize * (currentPage - 1) + (i + 1)}
                      </TableCell>
                      <TableCell>{row.do?.po?.spb?.spb_no}</TableCell>
                      <TableCell>{row.do?.po?.spb?.spb_gudang}</TableCell>
                      <TableCell>{row.do?.do_no}</TableCell>
                      <TableCell>{row.invoice_no}</TableCell>
                      <TableCell>{row.invoice_date}</TableCell>
                      <TableCell>
                        {row.invoice_email_date ?? "-"}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      Tidak ada data
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </SectionBody>

        <SectionFooter>
          <MyPagination
            data={filtered}
            currentPage={currentPage}
            triggerNext={() => setCurrentPage((p) => p + 1)}
            triggerPrevious={() =>
              setCurrentPage((p) => (p > 1 ? p - 1 : 1))
            }
            triggerPageChange={setCurrentPage}
          />
        </SectionFooter>
      </SectionContainer>

      {user?.role === "finance" || user?.role === "superadmin" && (
        <SectionContainer span={12}>
          <SectionHeader>Buat Invoice</SectionHeader>
          <SectionBody>
            <CreateSpbInvoiceForm setRefresh={setRefresh} />
          </SectionBody>
          <SectionFooter>
            <Button
              type="submit"
              form="create-spb-invoice-form"
              className="w-full !bg-green-600 hover:!bg-green-700 !text-white flex items-center justify-center gap-2 h-11"
            >
              Simpan Invoice <Plus />
            </Button>
          </SectionFooter>
        </SectionContainer>
      )}
    </WithSidebar>
  );
}