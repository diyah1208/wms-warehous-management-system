import api from "@/lib/axios";
import type { DeliveryReceive } from "@/types"; 

const BASE_URL = "http://localhost:8000/api/deliveries"; 


interface DeliveryParams {
  page?: number;
  kodeIt?: string;
  kodeMr?: string;
  status?: string;
}

// export function getAllDelivery(params: DeliveryParams = {}) {
//   return api.get("/deliveries", {
//     params: {
//       page: params.page ?? 1,
//       kodeIt: params.kodeIt,
//       kodeMr: params.kodeMr,
//       status: params.status,
//     },
//   });
// }
export async function getAllDelivery(): Promise<DeliveryReceive[]> {
  const res = await api.get("/deliveries");
  return res.data;
}

export async function getDeliveryByKode(dlv_kode: string): Promise<DeliveryReceive | null> {
  try {
    const res = await api.get(
      `${BASE_URL}/kode/${encodeURIComponent(dlv_kode)}`
    );

    return res.data ?? null;

  } catch (error: any) {

    if (error.response?.status === 404) return null;

    console.error("Error fetching delivery by kode:", error);
    throw new Error("Failed to fetch delivery by kode");
  }
}

export async function createDelivery(data: DeliveryReceive) {

  const payload = {
    dlv_kode: data.dlv_kode,
    dlv_ekspedisi: data.dlv_ekspedisi,
    dlv_dari_gudang: data.dlv_dari_gudang,
    dlv_ke_gudang: data.dlv_ke_gudang,
    dlv_status: data.dlv_status,
    dlv_pic: data.dlv_pic,
    dlv_no_resi: data.dlv_no_resi,
    dlv_tanggal: data.dlv_tanggal,
    dlv_jumlah_koli: data.dlv_jumlah_koli,
    mr_id: data.mr_id,
    created_at: data.created_at,
    updated_at: data.updated_at,

    details: data.details.map((d) => ({
      part_id: d.part_id,
      dtl_dlv_part_number: d.dtl_dlv_part_number,
      dtl_dlv_part_name: d.dtl_dlv_part_name,
      dtl_dlv_satuan: d.dtl_dlv_satuan,
      qty: d.qty,
      qty_pending: d.qty_pending,
      qty_on_delivery: d.qty_on_delivery,
      qty_delivered: d.qty_delivered,
      created_at: d.created_at,
      updated_at: d.updated_at,
    })),
  };

  return api.post("/deliveries", payload);
}

// export async function updateDelivery(kode_it: string, data: any): Promise<boolean> {
//   try {
//     await api.patch(`/deliveries/kode/${encodeURIComponent(kode_it)}/status`, data);
//     return true;
//   } catch (error: any) {
//     console.error("Error updating delivery:", error);
//     throw new Error(error.response?.data?.message ?? "Failed to update delivery");
//   }
// }

export async function updateDelivery(
  dlv_kode: string,
  payload: {
    status: "packing" | "ready to pickup" | "on delivery" | "delivered";
    pickup_plan_at?: string;
  }
): Promise<boolean> {
  try {
    await api.patch(
      `/deliveries/kode/${encodeURIComponent(dlv_kode)}/status`,
      payload
    );
    return true;
  } catch (error: any) {
    console.error("Error updating delivery status:", error);
    throw new Error(error.response?.data?.message ?? "Failed to update delivery status");
  }
}


export async function update(
  dlv_kode: string,
  payload: {
    dlv_ekspedisi: string;
    dlv_no_resi: string;
    dlv_jumlah_koli: number;
  }
) {
  const res = await api.put(
    `${BASE_URL}/kode/${encodeURIComponent(dlv_kode)}`
    , payload);
  return res.data;
}

export async function updatePickupPlan(
  dlv_kode: string,
  payload: {
    pickup_plan_at: string;
  }
): Promise<boolean> {
  try {
    await api.patch(
      `${BASE_URL}/kode/${encodeURIComponent(dlv_kode)}/pickup-plan`,
      payload
    );
    return true;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ?? "Gagal update pickup plan"
    );
  }
}


export interface ReceiveDeliveryPayload {
  items: {
    part_id?: string;
    qty_received: number;
    receive_note?: string;
  }[];
}

export async function deliveryReceive(
  dlv_kode: string,
  payload: ReceiveDeliveryPayload
): Promise<boolean> {
  try {
    await api.post(
      `${BASE_URL}/${encodeURIComponent(dlv_kode)}/receive`,
      payload
    );
    return true;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ??
        "Gagal konfirmasi penerimaan barang"
    );
  }
}

export async function downloadDeliveryPdf(kode: string) {
  const res = await api.get(
    `${BASE_URL}/${encodeURIComponent(kode)}/export/pdf`,
    { responseType: "blob" }
  );

  const url = URL.createObjectURL(res.data);
  window.open(url);

  setTimeout(() => URL.revokeObjectURL(url), 10000);
}


export async function downloadDeliveryExcel() {
  const res = await api.get(`${BASE_URL}/export-excel`, {
    responseType: "blob",
  });

  const blob = new Blob([res.data], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "DELIVERY.xlsx";
  document.body.appendChild(a);
  a.click();

  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

export async function submitDeliverySignature(
  kode: string,
  signatureBase64: string
) {
  const res = await api.post(
    `/deliveries/${kode}/sign-penerima`,
    {
      signature: signatureBase64,
    }
  );

  return res.data;
}





