import api from "@/lib/axios";
import type {
  Spb,
  SpbPo,
  SpbDo,
  SpbInvoice,
  SpbReport,
  SpbCreate,
} from "@/types";


export async function getAllSpb(): Promise<Spb[]> {
  const res = await api.get("/spb");
  return res.data.data ?? res.data;
}
export async function getAllSpbPo(): Promise<SpbPo[]> {
  const res = await api.get("/spb/po");
  return res.data.data ?? res.data;
}
export async function getAllSpbDo(): Promise<SpbDo[]> {
  const res = await api.get("/spb/do");
  return res.data.data ?? res.data;
}

export async function getAllSpbInv(): Promise<SpbInvoice[]> {
  const res = await api.get("/spb/invoice");
  return res.data.data ?? res.data;
}

export async function getAllReport(): Promise<SpbReport[]> {
  const res = await api.get("/spb/report");
  return res.data.data ?? res.data;
}

export async function getSpbDetail(spbId: number): Promise<Spb> {
  const res = await api.get(`/spb/${spbId}`);
  return res.data.data ?? res.data;
}
export async function generateSpb(): Promise<string> {
  const res = await api.get(`/spb/generate-kode`)
  return res.data;
}

export async function createSpb(data: SpbCreate) {

  const payload = {
    spb_tanggal: data.spb_tanggal,
    spb_no: data.spb_no,
    spb_no_wo: data.spb_no_wo,
    spb_section: data.spb_section,
    spb_pic_gmi: data.spb_pic_gmi,
    spb_pic_ppa: data.spb_pic_ppa,
    spb_kode_unit: data.spb_kode_unit,
    spb_tipe_unit: data.spb_tipe_unit,
    spb_brand: data.spb_brand,
    spb_hm: data.spb_hm,
    spb_problem_remark: data.spb_problem_remark,
    spb_gudang: data.spb_gudang,
    spb_pic: data.spb_hm,
    created_at: data.created_at,
    updated_at: data.updated_at,

    details: data.details.map((d) => ({
      part_id: d.part_id,
      dtl_spb_part_number: d.dtl_spb_part_number,
      dtl_spb_part_name: d.dtl_spb_part_name,
      dtl_spb_part_satuan: d.dtl_spb_part_satuan,
      dtl_spb_qty: d.dtl_spb_qty,
      created_at: d.created_at,
      updated_at: d.updated_at,
    })),
  };

  return api.post("/spb", payload);
}

export async function createSpbPo(data: {
  spb_id: number;
  po_no: string;
  so_no?: string;
  so_date?: string;
}): Promise<SpbPo> {
  const res = await api.post("/spb/po", data);
  return res.data.data ?? res.data;
}

export async function createSpbDo(data: {
    spb_id: number;
    do_no: string;
    do_date?: string;
    do_status_part?: string;
}
): Promise<SpbDo> {
  const res = await api.post(`/spb/do`, data);
  return res.data.data ?? res.data;
}


export async function createSpbInvoice(
  data: {
    spb_id: number,
    spb_do_id?: number,
    invoice_no: string;
    invoice_date?: string;
    invoice_email_date?: string;
  }
): Promise<SpbInvoice> {
  const res = await api.post(`/spb/invoice`, data);
  return res.data.data ?? res.data;
}

export async function getSpbByKode(spb_no: string): Promise<Spb | null> {
  try {
    const res = await api.get(
      `/spb/kode/${encodeURIComponent(spb_no)}`
    );

    return res.data ?? null;

  } catch (error: any) {

    if (error.response?.status === 404) return null;

    console.error("Error fetching spb by kode:", error);
    throw new Error("Failed to fetch spb by kode");
  }
}

export async function downloadSpbExcel() {
  const res = await api.get("/spb/export-excel", {
    responseType: "blob",
  });

  const blob = new Blob([res.data], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "DAFTAR_SPB.xlsx";
  document.body.appendChild(a);
  a.click();

  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}


export async function downloadSpbPdf(kode: string) {
  const res = await api.get(
    `/spb/print/${encodeURIComponent(kode)}`,
    { responseType: "blob" }
  );

  const blob = new Blob([res.data], { type: "application/pdf" });
  const url = window.URL.createObjectURL(blob);

  window.open(url);
}