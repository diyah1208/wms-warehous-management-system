import api from "@/lib/axios";
import type { POReceive, RI } from "@/types";

export async function getAllRi(): Promise<RI[]> {
  const res = await api.get("/receive");
  return res.data;
}

export async function getPurchasedPO(): Promise<POReceive[]> {
  const res = await api.get("/receive/purchase-orders");
  return res.data.data;
}

export async function getRIByKode(ri_kode: string): Promise<RI> {
  const res = await api.get(`/receive/kode/${encodeURIComponent(ri_kode)}`);
  return res.data;
}

export async function createRI(data: any): Promise<boolean> {
  try{
  const payload = {
    ri_kode: data.ri_kode,
    po_id: data.po_id,
    ri_lokasi: data.ri_lokasi,
    ri_tanggal: data.ri_tanggal,
    ri_keterangan: data.ri_keterangan,
    ri_pic: data.ri_pic,

    details: data.details.map((d: any) => ({
      part_id: d.part_id,
      mr_id: d.mr_id,
      dtl_ri_part_number: d.dtl_ri_part_number,
      dtl_ri_part_name: d.dtl_ri_part_name,
      dtl_ri_satuan: d.dtl_ri_satuan,
      dtl_ri_qty: d.dtl_ri_qty,
    })),
  };

  const res = await api.post("/receive", payload);
  return res.data.status === true;
} catch (err: any) {
    throw err; // lempar ke component
}
}


export async function confirmReceiveItem(payload: {
  ri_id: string;
  mr_id: string;
  part_id: string;
  qty: string;
}): Promise<boolean> {
  const res = await api.post("/receive/confirm-item", payload);
  return res.data.status === true;
}

export async function downloadReceiveExcel() {
  const res = await api.get("/receive/export-excel", {
    responseType: "blob",
  });

  const blob = new Blob([res.data], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "RECEIVE.xlsx";
  document.body.appendChild(a);
  a.click();

  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

export async function submitReceiveSignature(
  kode: string,
  signatureBase64: string
) {
  const res = await api.post(
    `/receive/${kode}/sign-penerima`,
    {
      signature: signatureBase64,
    }
  );

  return res.data;
}

export async function downloadReceivePdf(kode: string) {
  const res = await api.get(
    `receive/${encodeURIComponent(kode)}/export/pdf`,
    { responseType: "blob" }
  );

  const blob = new Blob([res.data], { type: "application/pdf" });
  const url = window.URL.createObjectURL(blob);

  window.open(url);
}