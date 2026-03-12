import api from "@/lib/axios";
import { encodeSafe } from "@/lib/utils";
import type {
  MRReceive,
  UpdateMRItemPayload,
  UpdateMRStatusPayload,
} from "@/types";

/* ================= GENERATE KODE MR ================= */
export async function generateKodeMR(lokasi: string): Promise<string> {
  const res = await api.get("/mr/generate-kode", {
    params: { lokasi },
  });
  return res.data;
}

/* ================= GET OPEN MR ================= */
export async function getOpenMR() {
  const res = await api.get("/mr/open");
  return res.data;
}

/* ================= CREATE MR ================= */
export async function createMR(data: MRReceive) {
  const payload = {
    mr_tanggal: data.mr_tanggal,
    mr_due_date: data.mr_due_date,
    mr_lokasi: data.mr_lokasi,
    mr_pic: data.mr_pic,
    mr_status: data.mr_status,
    mr_last_edit_by: data.mr_last_edit_by,
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

  return api.post("/mr", payload);
}

/* ================= GET ALL MR ================= */
export async function getAllMr(): Promise<MRReceive[]> {
  const res = await api.get("/mr");
  return res.data;
}

/* ================= GET MR BY KODE ================= */
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

/* ================= UPDATE MR ================= */
export async function updateMR(
  mrId: string,
  payload: UpdateMRItemPayload | UpdateMRStatusPayload
) {
  const res = await api.put(`/mr/${mrId}`, payload);
  return res.data;
}

/* ================= DELETE DETAIL ================= */
export async function deleteMRDetail(detailId: string) {
  return api.delete(`/mr/items/${detailId}`);
}

/* ================= SIGNATURE ================= */
export async function submitSignature(
  kode: string,
  signature: string,
  name: string,
  role: string
) {
  const res = await api.post("/mr/sign", {
    kode,
    signature,
    name,
    role,
  });
  return res.data;
}


// export async function clearSignature(kode: string) {
//   const res = await api.delete(`/mr/${encodeURIComponent(kode)}/signature`);
//   return res.data;
// }

/* ================= DOWNLOAD PDF ================= */
export function downloadMrPdf(kode: string) {
  api
    .get(`/mr/${encodeSafe(kode)}/export/pdf`, {
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

/* ================= DOWNLOAD EXCEL ================= */
export async function downloadMrExcel() {
  const res = await api.get("/mr/export", {
    responseType: "blob",
  });

  const blob = new Blob([res.data], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "MATERIAL_REQUEST.xlsx";
  document.body.appendChild(a);
  a.click();

  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

export async function approveMrDetail(detailId: number) {
  return api.put(`/mr/detail/${detailId}/approve`);
}

export async function rejectMrDetail(detailId: number) {
  return api.put(`/mr/detail/${detailId}/reject`);
}