import api from "@/lib/axios";
import type { PurchaseRequest } from "@/types";
//const BASE_URL = "http://localhost:8000/api/pr";

/**
 * ROLE
 * - Create PR : Purchase, Warehouse
 * - Update PR : Purchase, Warehouse
 * - Get All PR : All
 * - Get PR By Kode : All
 */

export async function getAllPr(): Promise<PurchaseRequest[]> {
  const res = await api.get("/pr");
  return res.data.data as PurchaseRequest[];
}

export async function getOpenPr() {
  const res = await api.get( `/pr/open`);
  return res.data.data;
}

export async function getPr(): Promise<PurchaseRequest[]> {
  const res = await api.get("/pr");

  if (Array.isArray(res.data)) {
    return res.data;
  }

  if (Array.isArray(res.data?.data)) {
    return res.data.data;
  }
  console.error("Unexpected PR response shape:", res.data);
  return [];
}

export async function getPrById(
  pr_id: number | string
): Promise<PurchaseRequest | null> {
  try {
    const res = await api.get(`/pr/${pr_id}`);
    return res.data as PurchaseRequest;
  } catch (error: any) {
    if (error.response?.status === 404) return null;
    console.error("Error fetching PR by id:", error);
    throw new Error("Failed to fetch PR by id");
  }
}

export async function getPrByKode(
  pr_kode: string
): Promise<PurchaseRequest | null> {
  try {
    const res = await api.get(
      `/pr/kode/${encodeURIComponent(pr_kode)}`
    );

    return res.data ?? null;
  } catch (error: any) {
    if (error.response?.status === 404) return null;
    console.error("Error fetching PR by kode:", error);
    throw new Error("Failed to fetch PR by kode");
  }
}

export async function createPR(data: PurchaseRequest) {
  const payload = {
    pr_kode: data.pr_kode,
    pr_lokasi: data.pr_lokasi,
    pr_tanggal: data.pr_tanggal,
    pr_pic: data.pr_pic,

    details: data.details.map((d) => ({
      part_id: d.part_id,
      mr_id: d.mr_id,
      dtl_pr_part_number: d.dtl_pr_part_number,
      dtl_pr_part_name: d.dtl_pr_part_name,
      dtl_pr_satuan: d.dtl_pr_satuan,
      dtl_pr_qty: d.dtl_pr_qty,
    })),
  };

  return api.post("/pr", payload);
}




export async function submitSignature(
  kode: string,
  signatureBase64: string
) {
  const res = await api.post("/pr/sign", {
    kode, // 🔥 HARUS "kode", BUKAN pr_kode
    signature: signatureBase64,
  });

  return res.data;
}


// services/purchase-request.ts
export async function clearSignature(kode: string) {
  return api.delete(`/pr/${encodeURIComponent(kode)}/signature`);
}


export function downloadPrPdf(kode: string) {
  api
    .get(`/pr/${encodeURIComponent(kode)}/export/pdf`, {
      responseType: "blob",
    })
    .then((res) => {
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `PR_${kode.replace(/\//g, "_")}.pdf`;
      document.body.appendChild(a);
      a.click();

      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    });
}
