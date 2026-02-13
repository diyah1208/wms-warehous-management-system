import api from "@/lib/axios";
import type { PO, POHeader, POReceive, UpdatePOPayload } from "@/types";

//const BASE_URL = "http://localhost:8000/api/po";

/**
 * ROLE
 * - Create PO : Purchasing, Warehouse
 * - Update PO : Purchasing, Warehouse
 * - Get All PO : All
 * - Get PO By ID : All
 */


export async function getAllPo(): Promise<POReceive[]> {
  const res = await api.get("/po");

  if (Array.isArray(res.data)) {
    return res.data;
  }

  if (Array.isArray(res.data?.data)) {
    return res.data.data;
  }

  console.error("Unexpected PO response shape:", res.data);
  return [];
}

export async function getPo(): Promise<POHeader[]> {
  const res = await api.get("/po");

  if (Array.isArray(res.data)) {
    return res.data;
  }

  if (Array.isArray(res.data?.data)) {
    return res.data.data;
  }

  console.error("Unexpected PO response shape:", res.data);
  return [];
}

export async function getPoByKode(
  po_kode: string
): Promise<POReceive | null> {
  try {
    const res = await api.get(`/po/kode/${po_kode}`);
    return res.data ?? null;
  } catch (error: any) {
    if (error.response?.status === 404) return null;
    throw error;
  }
}

export async function getPoById(po_id: number): Promise<PO | null> {
  try {
    const res = await api.get(`/po/${po_id}`);
    return res.data ?? null;
  } catch (error: any) {
    if (error.response?.status === 404) return null;
    console.error("Error fetching PO by id:", error);
    throw new Error("Failed to fetch PO by id");
  }
}

// export async function createPO(data: PO) {
//   const payload = {
//     po_kode: data.po_kode,
//     pr_id: data.pr_id,
//     po_tanggal: data.po_tanggal,
//     po_estimasi: data.po_estimasi,
//     po_keterangan: data.po_keterangan,
//     po_detail_status: data.po_detail_status,
//     po_status: data.po_status,
//     po_pic: data.po_pic,

//     details: data.details.map((d) => ({
//       part_id: d.part_id,
//       dtl_po_part_number: d.dtl_po_part_number,
//       dtl_po_part_name: d.dtl_po_part_name,
//       dtl_po_satuan: d.dtl_po_satuan,
//       dtl_po_qty: d.dtl_po_qty,
//     })),
//   };

//   return api.post("/po", payload);
// }
export async function createPO(data: PO) {
  return api.post("/po", data);
}

export async function updatePO(
  po_id?: string,
  payload?: UpdatePOPayload
) {
  const res = await api.put(`/po/${po_id}`, payload);
  return res.data?.status === true;
}

export async function submitSignature(
  kode: string,
  signatureBase64: string
) {
  return api.post("/po/sign", {
    kode: decodeURIComponent(kode), // 🔥 WAJIB
    signature: signatureBase64,
  });
}


// services/purchase-request.ts
export async function clearSignature(kode: string) {
  return api.delete(`/po/${kode}/signature`);
}


export async function downloadPoPdf(kode: string) {
  const res = await api.get(
    `/po/${encodeURIComponent(kode)}/export/pdf`,
    { responseType: "blob" }
  );

  const blob = new Blob([res.data], { type: "application/pdf" });
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `PO_${kode.replace(/\//g, "_")}.pdf`;
  document.body.appendChild(a);
  a.click();

  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

export async function downloadPoExcel() {
  const res = await api.get("/po/export", {
    responseType: "blob",
  });

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
