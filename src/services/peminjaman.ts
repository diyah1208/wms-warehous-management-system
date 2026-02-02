import api from "@/lib/axios";
import type { Peminjaman } from "@/types";

export async function getAllPeminjaman(): Promise<Peminjaman[]> {
  const res = await api.get("/peminjaman");
  return res.data;
}

export async function getPeminjamanByKode(kode: string): Promise<Peminjaman> {
  const res = await api.get(`/peminjaman/kode/${encodeURIComponent(kode)}`);
  return res.data;
}

export async function createPeminjaman(data: any): Promise<boolean> {
  try {
    const payload = {
      pmj_kode: data.pmj_kode,
      pmj_lokasi: data.pmj_lokasi,
      pmj_tanggal: data.pmj_tanggal,
      pmj_peminjam: data.pmj_peminjam,
      pmj_keterangan: data.pmj_keterangan,
      details: data.details.map((d: any) => ({
        part_id: d.part_id,
        dtl_pmj_part_number: d.dtl_pmj_part_number,
        dtl_pmj_part_name: d.dtl_pmj_part_name,
        dtl_pmj_part_satuan: d.dtl_pmj_part_satuan,
        dtl_pmj_qty_borrowed: d.dtl_pmj_qty_borrowed,
        dtl_pmj_qty_returned: 0,
      })),
    };

    const res = await api.post("/peminjaman", payload);
    return res.data.status === true;
  } catch (err: any) {
    throw err;
  }
}

export async function returnPeminjamanParts(payload: any, pmj_id: number) {
  const res = await api.post(`/peminjaman/${pmj_id}/return-part`, payload);
  return res.data; 
}

export async function generatePmj(): Promise<string> {
  const res = await api.get(`/peminjaman/generate-kode`)
  return res.data;
}


