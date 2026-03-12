import api from "@/lib/axios";
import { encodeSafe } from "@/lib/utils";
import type { ReturnSpb } from "@/types";

// export async function getAllReturnSpb(): Promise<ReturnSpb[]> {
//   const res = await api.get("/return-spb");
//   return res.data.data;
// }

export async function getAllReturnSpb(): Promise<ReturnSpb[]> {
  const res = await api.get("/return-spb");
  return res.data.data ?? res.data;
}

export async function getReturnSpbByKode(
  kode: string
): Promise<ReturnSpb | null> {
  const safe = encodeSafe(kode);

  try {
    const res = await api.get(`/return-spb/kode/${safe}`);
    return res.data ?? null;
  } catch (err: any) {
    if (err.response?.status === 404) return null;
    throw err;
  }
}

// export async function createReturnSpb(data: any): Promise<boolean> {
//   try {
//     const payload = {
//       rtn_kode: data.rtn_kode,
//       spb_id: data.spb_id,
//       rtn_tanggal: data.rtn_tanggal,
//       rtn_note: data.rtn_note,
//       details: data.details.map((d: any) => ({
//         spb_detail_id: d.spb_detail_id,
//         qty_return: d.qty_return,
//       })),
//     };

//     const res = await api.post("/return-spb", payload);
//     return res.data.status === true;
//   } catch (err: any) {
//     throw err;
//   }
// }

export async function createReturnSpb(data: any): Promise<boolean> {
  const payload = {
    rtn_kode: data.rtn_kode,
    spb_id: data.spb_id,
    rtn_tanggal: data.rtn_tanggal,
    rtn_note: data.rtn_note,
    details: Array.isArray(data.details)
      ? data.details.map((d: any) => ({
          spb_dtl_id: d.spb_dtl_id,   // ⬅️ PERBAIKI INI
          qty_return: d.qty_return,
        }))
      : [],
  };

  const res = await api.post("/return-spb", payload);
  return res.data.status === true;
}

export async function generateRtn(): Promise<string> {
  const res = await api.get(`/return-spb/generate-kode`);
  return res.data;
}