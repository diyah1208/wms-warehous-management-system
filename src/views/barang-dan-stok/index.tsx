import SectionContainer, {
  SectionHeader,
  SectionBody,
  SectionFooter,
} from "@/components/content-container";
import { EditStockDialog } from "@/components/dialog/edit-stock";
import { EditPartDialog } from "@/components/dialog/edit-part";
import CreateMasterPartForm from "@/components/form/create-master-part";
import WithSidebar from "@/components/layout/WithSidebar";
import { MyPagination } from "@/components/my-pagination";
import { QuickTable } from "@/components/quick-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatTanggal } from "@/lib/utils";
import { getMasterParts,downloadBarangExcel } from "@/services/master-part";
import { getAllStocks,downloadStockExcel } from "@/services/stock";
import type { MasterPart, Stock } from "@/types";
import { PagingSize } from "@/types/enum";
import { HousePlus, FileSpreadsheet, QrCode, X, Filter, Search } from "lucide-react";
import { useEffect, useState, type Dispatch, type SetStateAction,useRef  } from "react";
import { toast } from "sonner";
import QRCode from "qrcode";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Upload } from "lucide-react";
import { importStockExcel } from "@/services/stock";
import { importMasterPartExcel } from "@/services/master-part";




export default function BarangDanStok() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [masterParts, setMasterParts] = useState<MasterPart[]>([]);
  const [refresh, setRefresh] = useState<boolean>(false);

useEffect(() => {
  async function fetchMasterPart() {
    try {
      const res = await getMasterParts();
      if (res) setMasterParts(res);
    } catch (error) {
      toast.error("Gagal mengambil data master part");
    }
  }

  async function fetchStocks() {
    try {
      const res = await getAllStocks();
      if (res) setStocks(res);
    } catch (error) {
      toast.error("Gagal mengambil data stok barang");
    }
  }

  fetchMasterPart();
  fetchStocks();
}, [refresh]);


  return (
    <WithSidebar>
      {/* <DataStokSection
        setRefresh={setRefresh}
        stocks={stocks}
        lokasiUser={user ? user.lokasi : ""}
      /> */}

      <DataStokSection stocks={stocks as Stock[]} 
      setRefresh={setRefresh}/>

      {/* Data Master Part */}
      <DataMasterPartSection masterParts={masterParts as MasterPart[]} 
      setRefresh={setRefresh}/>
      {/* Tambah */}
      <SectionContainer span={12}>
        <SectionHeader>Tambah Barang</SectionHeader>
        <SectionBody className="grid grid-cols-12 gap-2">
          <div className="col-span-12 rounded-sm text-center">
            <CreateMasterPartForm setRefresh={setRefresh} />
          </div>
        </SectionBody>
        <SectionFooter>
          <Button
            className="w-full !bg-green-600 hover:!bg-green-700 !text-white flex items-center justify-center gap-2 h-11"
            type="submit"
            form="create-master-part-form"
          >
            Tambah <HousePlus />
          </Button>
        </SectionFooter>
      </SectionContainer>
    </WithSidebar>
  );
}

function MasterPartCollumnsGenerator(
  setRefresh: Dispatch<SetStateAction<boolean>>
) {
  return [
    {
      header: "Part Number",
      accessorKey: "part_number",
    },
    {
      header: "Part Name",
      accessorKey: "part_name",
    },
    {
      header: "Satuan",
      accessorKey: "part_satuan",
    },
    {
      header: "Deskripsi",
      accessorKey: "part_description",
    },
    {
      header: "Created At",
      accessorKey: "created_at",
      cell: (value: any) => formatTanggal(value),
    },
    {
      header: "Updated At",
      accessorKey: "updated_at",
      cell: (value: any) => formatTanggal(value),
    },
    {
      header: "Aksi",
      accessorKey: "aksi",
      cell: (_: any, row: MasterPart) => (
        <div className="flex justify-center gap-2">
          <EditPartDialog refresh={setRefresh} part={row} />
          <Button
            size="icon"
            variant="edit"
            className="text-orange-600 hover:text-orange-700"
            onClick={async () => {
            const qr = await QRCode.toDataURL(
              `${row.part_number}|${row.part_name}|${row.part_description}`
            );

            const win = window.open("", "_blank");
            if (!win) return;

            win.document.write(`
              <html>
                <head>
                  <title>Print QR</title>
                  <style>
                    @page {
                      size: A4;
                      margin: 10mm;
                    }

                    body {
                      margin: 0;
                      font-family: Arial, sans-serif;
                    }

                    /* LABEL SAJA YANG KECIL */
                    .label {
                      width: 6cm;
                      height: 3cm;
                      padding: 4px;
                      box-sizing: border-box;
                    }

                    /* HEADER ATAS */
                    .header {
                      display: flex;
                      justify-content: space-between;
                      align-items: center;
                      margin-bottom: 2px;
                    }

                    .brand {
                      font-size: 9px;
                      font-weight: bold;
                    }

                    .logo {
                      height: 16px;
                    }

                    /* CONTENT */
                    .content {
                      display: flex;
                      gap: 4px;
                    }

                    .qr {
                      width: 45px;
                      height: 45px;
                    }

                    .text-area {
                      flex: 1;
                      display: flex;
                      flex-direction: column;
                      gap: 2px;
                    }

                    .box {
                      border: 1px solid #000;
                      text-align: center;
                      padding: 2px;
                    }

                    .part-no {
                      font-size: 10px;
                      font-weight: bold;
                    }

                    .part-name {
                      font-size: 8px;
                    }
                    .part-description {
                      font-size: 8px;
                    }
                  </style>
                </head>
                <body onload="window.print();window.close();">
                <div class="label">
                  <!-- HEADER -->
                  <div class="header">
                    <div class="brand">LOURDES AUTOPART</div>
                    <img src="/Logo-Lourdes.png" class="logo" />
                  </div>
                  <div class="content">
                    <img src="${qr}" class="qr" />
                    <div class="text-area">
                      <div class="box part-no">
                        ${row.part_number}
                      </div>
                      <div class="box part-name">
                        ${row.part_name}
                      </div>
                      <div class="box part-description">
                        ${row.part_description}
                      </div>
                    </div>
                  </div>
                </div>
              </body>
              </html>
            `);
            win.document.close();
            }} >
          <QrCode className="h-4 w-4" />
        </Button>
        </div>
      ),
    }
  ];
}

function DataMasterPartSection({  
  masterParts,
  setRefresh,
  }: {
    masterParts: MasterPart[];
    setRefresh: Dispatch<SetStateAction<boolean>>;
  }) {
  const [filteredMasterParts, setFilteredMasterParts] = useState<MasterPart[]>(
    []
  );
  const [tableMasterParts, setTableMasterParts] = useState<MasterPart[]>([]);

  // Pagination
  const pageSize = PagingSize;
  const [currentPage, setCurrentPage] = useState<number>(1);
  const importPartRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    setFilteredMasterParts(masterParts);
    setTableMasterParts(masterParts.slice(0, pageSize));
  }, [masterParts]);

  useEffect(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    setTableMasterParts(filteredMasterParts.slice(startIndex, endIndex));
  }, [currentPage, filteredMasterParts]);

  // Filtering
  const [pn, setPn] = useState<string>("");
  const [pnm, setPnm] = useState<string>("");
  const [uom, setUom] = useState<string>("");

  function filterMP() {
    let filtered = filteredMasterParts;

    if (pn) {
      filtered = filtered.filter((mp) =>
        mp.part_number.toLowerCase().includes(pn.toLowerCase())
      );
    }

    if (uom) {
      filtered = filtered.filter((mp) =>
        mp.part_satuan.toLowerCase().includes(uom.toLowerCase())
      );
    }

    if (pnm) {
      filtered = filtered.filter((mp) =>
        mp.part_name.toLowerCase().includes(pnm.toLowerCase())
      );
    }

    setFilteredMasterParts(filtered);
    setTableMasterParts(filtered.slice(0, PagingSize));
  }

  function resetFilters() {
    setPn("");
    setPnm("");
    setUom("");
    setFilteredMasterParts(masterParts);
    setTableMasterParts(masterParts.slice(0, pageSize));
    setCurrentPage(1);
  }

  return (
    <SectionContainer span={12}>
      <SectionHeader>Daftar Barang</SectionHeader>
      <SectionBody className="grid grid-cols-12 gap-2">
        <div className="flex flex-col gap-4 col-span-12">
          <div className="flex flex-col md:flex-row md:items-end gap-3">
          {/* Filtering */}
            <div className="flex-1">
              <Input
                placeholder="Cari berdasarkan part number"  
                value={pn}
                onChange={(e) => setPn(e.target.value)}
              />
            </div>

          <div className="flex items-center gap-2">
            {/* Search by kode */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        onClick={filterMP}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Search className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Cari Part</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

            
          <Popover>
            <PopoverTrigger asChild>
              <TooltipProvider>
                <Tooltip>
                  <Popover>
                    <PopoverTrigger asChild>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="icon">
                          <Filter className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Part Number</label>
                        <Input
                          placeholder="Part number"
                          value={pnm}
                          onChange={(e) => setPnm(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Part Name</label>
                        <Input
                          placeholder="Part name"
                          value={pn}
                          onChange={(e) => setPn(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Satuan</label>
                        <Input
                          placeholder="uom"
                          value={uom}
                          onChange={(e) => setUom(e.target.value)}
                        />
                      </div>
                    </PopoverContent>
                  </Popover>

                  <TooltipContent>Filter Tambahan</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </PopoverTrigger>
              <PopoverContent className="w-80 space-y-4">

                {/* ACTION */}
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setPn("");
                      setPnm("");
                      setUom("");
                      setFilteredMasterParts(masterParts);
                      setCurrentPage(1);
                    }}
                  >
                    Reset
                  </Button>

                  <Button
                    size="sm"
                    onClick={() => {
                      filterMP();
                    }}
                  >
                    Terapkan
                  </Button>
                </div>
              </PopoverContent>
          </Popover>
            {/* Clear filter button */}
            <div className="col-span-6 md:col-span-3 lg:col-span-2">
              <div className="flex items-center gap-2">
                
                {/* RESET FILTER */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={resetFilters}
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Reset Filter</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                {/* EXPORT EXCEL */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={downloadBarangExcel}
                      >
                        {/* icon export */}
                        <FileSpreadsheet className="h-4 w-4 text-green-600" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Export Excel</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                {/* <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => importPartRef.current?.click()}
                      >
                        <Upload className="h-4 w-4 text-blue-600" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Import Master Part</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <input
                  ref={importPartRef}
                  type="file"
                  hidden
                  accept=".xlsx,.xls"
                  onChange={async (e) => {
                    if (!e.target.files?.length) return;

                    try {
                      await importMasterPartExcel(e.target.files[0]);
                      toast.success("Import master part berhasil");
                      setRefresh((prev) => !prev);
                    } catch {
                      toast.error("Gagal import master part");
                    } finally {
                      e.target.value = "";
                    }
                  }}
                /> */}
              </div>
            </div>
          </div>
          </div>
          <QuickTable
            data={tableMasterParts}
            columns={MasterPartCollumnsGenerator(setRefresh)}
            page={currentPage}
          />
        </div>
      </SectionBody>
      <SectionFooter>
        <MyPagination
          data={filteredMasterParts}
          triggerNext={() => setCurrentPage((prev) => prev + 1)}
          triggerPrevious={() => setCurrentPage((prev) => prev - 1)}
          triggerPageChange={(page) => {
            setCurrentPage(page);
          }}
          currentPage={currentPage}
        />
      </SectionFooter>
    </SectionContainer>
  );
}
function DataStokSection({
  stocks,
  setRefresh,
}: {
  stocks: Stock[];
  setRefresh: Dispatch<SetStateAction<boolean>>;
}) {
  const { user } = useAuth();
  const lokasiUser = user?.lokasi;
  const importStockRef = useRef<HTMLInputElement>(null);


  type PivotStockRow = {
    part_number: string;
    part_name: string;
    part_satuan: string;
    [lokasi: string]: any;
  };

  const [filteredStock, setFilteredStock] = useState<PivotStockRow[]>([]);
  const [tableStocks, setTableStocks] = useState<PivotStockRow[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const [pn, setPn] = useState("");
  const [pnm, setPnm] = useState("");
  const [uom, setUom] = useState("");
  const [lokasiFilter, setLokasiFilter] = useState("");

  useEffect(() => {
    const start = (currentPage - 1) * PagingSize;
    const end = start + PagingSize;
    setTableStocks(filteredStock.slice(start, end));
  }, [currentPage, filteredStock]);

  function getUniqueLokasi(data: Stock[]) {
    return Array.from(
      new Set(data.map((s) => s.stk_location).filter(Boolean))
    );
  }

  function pivotStockByLokasi(data: Stock[]) {
    const map = new Map<string, PivotStockRow>();

    data.forEach((s) => {
      const pn = s.barang?.part_number ?? "-";

      if (!map.has(pn)) {
        map.set(pn, {
          part_number: pn,
          part_name: s.barang?.part_name ?? "-",
          part_satuan: s.barang?.part_satuan ?? "-",
        });
      }

      map.get(pn)![s.stk_location] = s.stk_qty ?? 0;
    });

    return Array.from(map.values());
  }

  useEffect(() => {
    let data = [...stocks];

    if (pn) {
      data = data.filter((s) =>
        s.barang?.part_number
          ?.toLowerCase()
          .includes(pn.toLowerCase())
      );
    }

    if (pnm) {
      data = data.filter((s) =>
        s.barang?.part_name
          ?.toLowerCase()
          .includes(pnm.toLowerCase())
      );
    }

    if (uom) {
      data = data.filter((s) =>
        s.barang?.part_satuan
          ?.toLowerCase()
          .includes(uom.toLowerCase())
      );
    }

    if (lokasiFilter) {
      data = data.filter((s) =>
        s.stk_location
          ?.toLowerCase()
          .includes(lokasiFilter.toLowerCase())
      );
    }

    setFilteredStock(pivotStockByLokasi(data));
    setCurrentPage(1);
  }, [stocks, pn, pnm, uom, lokasiFilter]);

  function findStock(partNumber: string): Stock | undefined {
    return stocks.find(
      (s) =>
        s.barang?.part_number === partNumber 
    );
  }

  function StockColumnsGenerator() {
    const lokasiList = getUniqueLokasi(stocks);

    return [
      { header: "Part Number", accessorKey: "part_number" },
      { header: "Part Name", accessorKey: "part_name" },
      { header: "Satuan", accessorKey: "part_satuan" },

      ...lokasiList.map((lok) => ({
        header: lok,
        accessorKey: lok,
        cell: (_: any, row: any) => row[lok] ?? 0,
      })),

      {
        header: "Aksi",
        accessorKey: "aksi",
        cell: (_: any, row: any) => {
          const stock = findStock(row.part_number);

          if (!stock) {
            return (
              <span className="text-xs text-muted-foreground">
                Tidak ada stok
              </span>
            );
          }

          return (
            <EditStockDialog
              stock={stock}
              refresh={setRefresh}
            />
          );
        },
      },
    ];
  }

  return (
    <SectionContainer span={12}>
      <SectionHeader>Daftar Stok Barang</SectionHeader>
      <SectionBody className="grid grid-cols-12 gap-2">
        <div className="flex flex-col gap-4 col-span-12">
          {/* FILTER */}
        <div className="flex items-center gap-2">

          {/* SEARCH */}
          <div className="relative flex-1">
            <Input
              placeholder="Cari Part Number"
              value={pn}
              onChange={(e) => setPn(e.target.value)}
              className="pr-10"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>

          {/* FILTER */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </PopoverTrigger>

            <PopoverContent className="w-80 space-y-3">
              <Input
                placeholder="Part Name"
                value={pnm}
                onChange={(e) => setPnm(e.target.value)}
              />
              <Input
                placeholder="Satuan"
                value={uom}
                onChange={(e) => setUom(e.target.value)}
              />
              <Input
                placeholder="Lokasi"
                value={lokasiFilter}
                onChange={(e) => setLokasiFilter(e.target.value)}
              />
            </PopoverContent>
          </Popover>

          {/* EXPORT */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={downloadStockExcel}
                >
                  <FileSpreadsheet className="h-4 w-4 text-green-600" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Export Excel</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {/* IMPORT STOCK */}
          {/* <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => importStockRef.current?.click()}
                >
                  <Upload className="h-4 w-4 text-blue-600" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Import Stock</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <input
            ref={importStockRef}
            type="file"
            hidden
            accept=".xlsx,.xls"
            onChange={async (e) => {
              if (!e.target.files?.length) return;

              try {
                await importStockExcel(e.target.files[0]);
                toast.success("Import stock berhasil");
                setRefresh((prev) => !prev);
              } catch (err) {
                toast.error("Gagal import stock");
              } finally {
                e.target.value = "";
              }
            }}
          /> */}
        </div>
          <QuickTable
            data={tableStocks}
            columns={StockColumnsGenerator()}
            page={currentPage}
          />
        </div>
      </SectionBody>

      <SectionFooter>
        <MyPagination
          data={filteredStock}
          currentPage={currentPage}
          triggerNext={() => setCurrentPage((p) => p + 1)}
          triggerPrevious={() => setCurrentPage((p) => p - 1)}
          triggerPageChange={setCurrentPage}
        />
      </SectionFooter>
    </SectionContainer>
  );
}


