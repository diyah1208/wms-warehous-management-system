// import axios from "@/lib/axios";
// import type { JobCostingItem, JobCostingPayload, JobCostingRow, JobCostingDetail } from "@/types";

// /* =========================
//    GET ALL JOB COSTING
// ========================= */
// export async function getAllJobCosting(): Promise<JobCostingRow[]> {
//   const res = await axios.get("/job-costing");
//   return res.data;
// }
// export async function downloadJobCostingExcel() {
//   const res = await axios.get("/job-costing/export", {
//     responseType: "blob",
//   });

//   const blob = new Blob([res.data], {
//     type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//   });

//   const url = window.URL.createObjectURL(blob);

//   const link = document.createElement("a");
//   link.href = url;
//   link.download = "JOB_COSTING.xlsx";

//   document.body.appendChild(link);
//   link.click();
//   link.remove();

//   window.URL.revokeObjectURL(url);
// }
// /* =========================
//    CREATE JOB COSTING
// ========================= */
// export async function createJobCosting(
//   payload: JobCostingPayload
// ) {
//   const res = await axios.post("/job-costing", payload);
//   return res.data;
// }
// /* =========================
//    GET DETAIL BY KODE
// ========================= */
// export async function getJobCostingByKode(
//   kode: string
// ): Promise<JobCostingDetail> {
//   const res = await axios.get(`/job-costing/kode/${kode}`);
//   return res.data;
// }

// /* =========================
//    DOWNLOAD PDF
// ========================= */
// export async function downloadJobCostingPdf(batchNo: string) {
//   const res = await axios.get(
//     `/job-costing/${encodeURIComponent(batchNo)}/pdf`,
//     {
//       responseType: "blob",
//     }
//   );

//   const url = window.URL.createObjectURL(new Blob([res.data]));
//   const link = document.createElement("a");

//   link.href = url;
//   link.setAttribute("download", `JOB-COSTING-${batchNo}.pdf`);
//   document.body.appendChild(link);
//   link.click();
//   link.remove();
// }

import api from "@/lib/axios";
import type {
  JobCostingRow,
  JobCostingPayload,
  JobCostingDetail,
} from "@/types";
import { apiPublic } from "@/lib/apiPublic";

const BASE_URL = "/job-costing";

/* =========================
   GET ALL JOB COSTING
========================= */
export async function getAllJobCosting(): Promise<JobCostingRow[]> {
  const res = await api.get(BASE_URL);

  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.data?.data)) return res.data.data;

  console.error("Unexpected Job Costing response:", res.data);
  return [];
}

/* =========================
   GET DETAIL BY KODE
========================= */
export async function getJobCostingByKode(
  kode: string
): Promise<JobCostingDetail | null> {
  try {
    const res = await api.get(`${BASE_URL}/kode/${encodeURIComponent(kode)}`);
    return res.data ?? null;
  } catch (error: any) {
    if (error.response?.status === 404) return null;
    console.error("Error fetching JC by kode:", error);
    throw new Error("Failed to fetch Job Costing detail");
  }
}

/* =========================
   CREATE JOB COSTING
========================= */
export async function createJobCosting(payload: JobCostingPayload) {
  const res = await api.post(BASE_URL, payload);
  return res.data;
}

/* =========================
   SUBMIT SIGNATURE (BERJENJANG)
   role dikirim dari backend auth
========================= */
// export async function submitJobCostingSignature(
//   kode: string,
//   signatureBase64: string
// ) {
//   const res = await api.post(`${BASE_URL}/sign`, {
//     kode, // 🔥 harus "kode" biar konsisten PR
//     signature: signatureBase64,
//   });

//   return res.data;
// }

export async function submitJobCostingSignature(
  batch_no: string,
  signature: string,
  name: string,
  role: string
) {
  return apiPublic.post("/jb/sign", {
    batch_no,
    signature,
    name,
    role,
  });
}

/* =========================
   CLEAR SIGNATURE
   dipakai setelah print
========================= */
export async function clearSignatureJobCosting(kode: string) {
  return api.delete(`${BASE_URL}/${encodeURIComponent(kode)}/signature`);
}

/* =========================
   DOWNLOAD PDF
========================= */
export function downloadJobCostingPdf(kode: string) {
  api
    .get(`/job-costing/${encodeURIComponent(kode)}/export/pdf`, {
      responseType: "blob",
    })
    .then((res) => {
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `JC_${kode.replace(/\//g, "_")}.pdf`;
      document.body.appendChild(a);
      a.click();

      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    })
    .catch(() => {
      alert("Gagal download PDF Job Costing");
    });
}


/* =========================
   DOWNLOAD EXCEL
========================= */
export async function downloadJobCostingExcel() {
  const res = await api.get(`${BASE_URL}/export`, {
    responseType: "blob",
  });

  const blob = new Blob([res.data], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = "JOB_COSTING.xlsx";
  document.body.appendChild(a);
  a.click();

  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

export async function updateJobCostingToDone(
  id: number,
  lokasi: string
) {
  const res = await api.put(`/job-costing/${id}/done`, {
    lokasi,
  });

  return res.data;
}
