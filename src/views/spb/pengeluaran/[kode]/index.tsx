import SectionContainer, {
  SectionBody,
  SectionFooter,
  SectionHeader,
} from "@/components/content-container";
import WithSidebar from "@/components/layout/WithSidebar";
import type { Spb } from "@/types"; 
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner"; 
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { formatTanggal } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { downloadSpbPdf, getSpbByKode } from "@/services/spb";

export function SpbDetail() {
  const { kode } = useParams<{ kode: string }>();
  const [pr, setPr] = useState<Spb | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchMrDetail() {
      if (!kode) {
        toast.error("Kode Purchase Request tidak ditemukan di URL.");
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const res = await getSpbByKode(kode);
        if (res) {
          setPr(res);
        } else {
          toast.error(`Purchase Request dengan kode ${kode} tidak ditemukan.`);
          setPr(null);
        }
      } catch (error) {
        console.error("Gagal mengambil detail MR:", error);
        if (error instanceof Error) {
          toast.error(`Gagal mengambil detail MR: ${error.message}`);
        } else {
          toast.error(
            "Terjadi kesalahan saat mengambil detail Material Request."
          );
        }
        setPr(null);
      } finally {
        setIsLoading(false);
      }
    }
    fetchMrDetail();
  }, [kode]);
  if (isLoading && !pr) {
    return (
      <WithSidebar>
        <SectionContainer span={12}>
          <SectionHeader>Memuat Detail Purchase Request...</SectionHeader>
          <SectionBody className="grid grid-cols-12 gap-2">
            <div className="col-span-12 flex items-center justify-center border border-dashed border-border rounded-sm p-8 text-muted-foreground text-lg">
              Memuat data...
            </div>
          </SectionBody>
        </SectionContainer>
      </WithSidebar>
    );
  }

  if (!pr) {
    return (
      <WithSidebar>
        <SectionContainer span={12}>
          <SectionHeader>Purchase Request Tidak Ditemukan</SectionHeader>
          <SectionBody className="grid grid-cols-12 gap-2">
            <div className="col-span-12 flex items-center justify-center border border-dashed border-border rounded-sm p-8 text-muted-foreground text-lg">
              PR dengan kode "{kode}" tidak ditemukan.
            </div>
          </SectionBody>
          <SectionFooter>
            <p className="text-sm text-muted-foreground text-center w-full">
              Pastikan kode yang Anda masukkan benar.
            </p>
          </SectionFooter>
        </SectionContainer>
      </WithSidebar>
    );
  }

  return (
    <WithSidebar>
      {/* Detail PR */}
      <SectionContainer span={12}>
        <SectionHeader>Detail Surat Pengeluaran Barang: {pr.spb_no}</SectionHeader>
        <SectionBody className="grid grid-cols-12 gap-6">
          {/* Informasi Umum MR */}
          <div className="col-span-12 space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2 mb-4">
              Informasi Umum
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-muted-foreground">No. SPB</Label>
                <p className="font-medium text-base">{pr.spb_no}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Tanggal SPB</Label>
                <p className="font-medium text-base">{formatTanggal(pr.created_at)}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">PIC GMI</Label>
                <p className="font-medium text-base">{pr.spb_pic_gmi}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Kode Unit</Label>
                <p className="font-medium text-base">{pr.spb_kode_unit}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Type Unit</Label>
                <p className="font-medium text-base">{pr.spb_tipe_unit}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Brand</Label>
                <p className="font-medium text-base">{pr.spb_brand}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">HM</Label>
                <p className="font-medium text-base">{pr.spb_hm}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">PIC PPA</Label>
                <p className="font-medium text-base">{pr.spb_pic_ppa}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">
                  Lokasi
                </Label>
                <p className="font-medium text-base">{pr.spb_gudang}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Status</Label>
                <p className="font-medium text-base">{pr.spb_status}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">
                  Tanggal Submit SPB to PO
                </Label>
                {/* Pastikan mr.tanggal_mr adalah Timestamp sebelum memanggil toDate() */}
                <p className="font-medium text-base">
                  {formatTanggal(pr.spb_tanggal)}
                </p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">
                  Diperbarui Pada
                </Label>
                <p className="font-medium text-base">
                  {formatTanggal(pr.updated_at)}
                </p>
              </div>
            </div>
          </div>
        </SectionBody>
        <SectionFooter>
          {/* <EditMRDialog mr={mr} refresh={setRefresh} onSubmit={handleEditMR} /> */}
           <Button onClick={() => downloadSpbPdf(pr.spb_no)}>
             Export PDF
            </Button>
        </SectionFooter>
      </SectionContainer>

      <SectionContainer span={12}>
        <SectionHeader>Barang dalam SPB</SectionHeader>
        <SectionBody className="grid grid-cols-12 gap-6">
          {/* Daftar Barang */}
          <div className="col-span-12 space-y-4">
            <div className="w-full border border-border rounded-sm overflow-x-auto">
              <Table className="w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead>No</TableHead>
                    <TableHead>Part Number</TableHead>
                    <TableHead>Nama Part</TableHead>
                    <TableHead>Satuan</TableHead>
                    <TableHead>Jumlah</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.isArray(pr.details) && pr.details.length > 0 ? (
                    pr.details.map((item, index) => (
                      <TableRow
                        key={item.spb_detail_id ?? index}
                        className="[&>td]:border"
                      >
                        <TableCell className="text-center">
                          {index + 1}
                        </TableCell>
                        <TableCell>{item.dtl_spb_part_number}</TableCell>
                        <TableCell>{item.dtl_spb_part_name}</TableCell>
                        <TableCell>{item.dtl_spb_part_satuan}</TableCell>
                        <TableCell>{item.dtl_spb_qty}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center text-muted-foreground"
                      >
                        Tidak ada barang
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </SectionBody>
        <SectionFooter></SectionFooter>
      </SectionContainer>
    </WithSidebar>
  );
}
