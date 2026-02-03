import api from "@/lib/axios";
// import axios from "axios";

import type {
  MRReceive,
  UpdateMRItemPayload,
  UpdateMRStatusPayload,
} from "@/types";
// import apiPublic from "@/lib/apiPublic";

const BASE_URL = "/mr";

/* =====================================================
 * GENERATE KODE MR
 * ===================================================== */
export async function generateKodeMR(lokasi: string): Promise<string> {
  const res = await api.get(`${BASE_URL}/generate-kode`, {
    params: { lokasi },
  });
  return res.data;
}

/* =====================================================
 * GET OPEN MR
 * ===================================================== */
export async function getOpenMR() {
  const res = await api.get(`${BASE_URL}/open`);
  return res.data;
}


export async function createMR(data: MRReceive) {
  const payload = {
    mr_tanggal: data.mr_tanggal,
    mr_due_date: data.mr_due_date,
    mr_lokasi: data.mr_lokasi,
    mr_pic: data.mr_pic,
    mr_status: data.mr_status,
    mr_last_edit_by: data.mr_last_edit_by, // 🔥 WAJIB
    mr_last_edit_at: data.mr_last_edit_at,
    details: data.details.map((d) => ({
      part_id: d.part_id,
      dtl_mr_part_number: d.dtl_mr_part_number,
      dtl_mr_part_name: d.dtl_mr_part_name,
      dtl_mr_satuan: d.dtl_mr_satuan,
      dtl_mr_prioritas: d.dtl_mr_prioritas,
      dtl_mr_qty_request: d.dtl_mr_qty_request ?? 0,
    })),
  };

  return api.post(`${BASE_URL}`, payload);
}

/* =====================================================
 * GET ALL MR
 * ===================================================== */
export async function getAllMr(): Promise<MRReceive[]> {
  const res = await api.get(`${BASE_URL}`);
  return res.data;
}

/* =====================================================
 * GET MR BY KODE
 * ===================================================== */
export async function getMrByKode(kode: string): Promise<MRReceive | null> {
  const safe = encodeSafe(kode);
  try {
    const res = await api.get(`/mr/kode/${safe}`);
    return res.data ?? null;
  } catch (err: any) {
    if (err.response?.status === 404) return null;
    throw err;
  }
}

/* =====================================================
 * UPDATE MR
 * - STATUS  → { mr_status }
 * - ITEM    → { dtl_mr_id, ... }
 * ===================================================== */
export async function updateMR(
  mrId: string,
  payload: UpdateMRItemPayload | UpdateMRStatusPayload
) {
  const res = await api.put(`${BASE_URL}/${mrId}`, payload);
  return res.data;
}

export async function deleteMRDetail(detailId: string) {
  return api.delete(`${BASE_URL}/items/${detailId}`);
}


export async function submitSignature(kode: string, signatureBase64: string) {
  const res = await api.post("/mr/sign", {
    kode,
    signature: signatureBase64,
  });
  return res.data;
}

export async function clearSignature(kode: string) {
  const res = await api.delete(
    `${BASE_URL}/${encodeURIComponent(kode)}/signature`
  );
  return res.data;
}


export function downloadMrPdf(kode: string) {
  api
    .get(`/mr/${encodeURIComponent(kode)}/export/pdf`, {
      responseType: "blob",
    })
    .then((res) => {
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `MR_${kode.replace(/\//g, "_")}.pdf`;
      document.body.appendChild(a);
      a.click();

      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    });
}
