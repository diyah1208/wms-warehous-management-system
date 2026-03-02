import api from "@/lib/axios";
import type { PO, POHeader, POReceive, UpdatePOPayload } from "@/types";

/* ================= GET ALL PO ================= */
export async function getAllPo(): Promise<POReceive[]> {
  const res = await api.get("/po");
  return Array.isArray(res.data) ? res.data : res.data?.data ?? [];
}

/* ================= GET PO HEADER ================= */
export async function getPo(): Promise<POHeader[]> {
  const res = await api.get("/po");
  return Array.isArray(res.data) ? res.data : res.data?.data ?? [];
}

/* ================= GET PO BY KODE ================= */
export async function getPoByKode(kode: string): Promise<POReceive | null> {
  try {
    const res = await api.get(`/po/kode/${encodeURIComponent(kode)}`);
    return res.data ?? null;
  } catch (err: any) {
    if (err.response?.status === 404) return null;
    throw err;
  }
}

/* ================= GET PO BY ID ================= */
export async function getPoById(po_id: number): Promise<PO | null> {
  try {
    const res = await api.get(`/po/${po_id}`);
    return res.data ?? null;
  } catch (err: any) {
    if (err.response?.status === 404) return null;
    throw err;
  }
}

/* ================= CREATE PO ================= */
export async function createPO(data: PO) {
  return api.post("/po", data);
}

/* ================= UPDATE PO ================= */
export async function updatePO(po_id: string, payload: UpdatePOPayload) {
  const res = await api.put(`/po/${po_id}`, payload);
  return res.data;
}

/* ================= SIGNATURE ================= */
export async function submitSignature(
  kode: string,
  signature: string,
  name: string,
  role: string
) {
  const res = await api.post("/po/sign", {
    kode,
    signature,
    name,
    role,
  });

  return res.data;
}

/* ================= CLEAR SIGNATURE ================= */
// export async function clearSignature(kode: string) {
//   const res = await api.delete(`/po/${encodeURIComponent(kode)}/signature`);
//   return res.data;
// }

/* ================= DOWNLOAD PDF ================= */
export function downloadPoPdf(kode: string) {
  api
    .get(`/po/${encodeURIComponent(kode)}/export/pdf`, {
      responseType: "blob",
    })
    .then((res) => {
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `PO_${kode.replace(/\//g, "_")}.pdf`;
      document.body.appendChild(a);
      a.click();

      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    });
}

/* ================= DOWNLOAD EXCEL ================= */
export async function downloadPoExcel() {
  const res = await api.get("/po/export", { responseType: "blob" });

  const blob = new Blob([res.data], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "PURCHASE_ORDER.xlsx";
  document.body.appendChild(a);
  a.click();

  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}