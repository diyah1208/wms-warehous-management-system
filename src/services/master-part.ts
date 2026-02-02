import api from "@/lib/axios";
import type { MasterPart, Part } from "@/types";
import { getCurrentUser } from "@/services/auth";


export async function createMasterPart(
  data: MasterPart
): Promise<boolean> {

   const user = await getCurrentUser();

  const payload = {
    part_number: data.part_number,
    part_name: data.part_name,
    part_satuan: data.part_satuan,
    part_description: data.part_description,
    lokasi: user?.lokasi,
  };

  const res = await api.post("/barang", payload);
  return res.data.status === true;
}


export async function getMasterParts(): Promise<MasterPart[]> {
  const res = await api.get("/barang");

  return res.data.data.map((item: any) => ({
    part_id: item.part_id,
    part_number: item.part_number,
    part_name: item.part_name,
    part_satuan: item.part_satuan,
    part_description: item.part_description,
    created_at: item.created_at,
    updated_at: item.updated_at,
  }));
}

export async function getParts(): Promise<Part[]> {
  const res = await api.get("/barang");

  return res.data.data.map((item: any) => ({
    part_id: item.part_id,
    part_number: item.part_number,
    part_name: item.part_name,
    part_satuan: item.part_satuan,
    part_description: item.part_description,
    created_at: item.created_at,
    updated_at: item.updated_at,
  }));
}

export async function updateMasterPart(
  part_id: number,
  payload: {
    part_number: string;
    part_name: string;
    part_satuan: string;
    part_description: string,
  }
) {
  const res = await api.put(`/barang/${part_id}`, payload);
  return res.data;
}

export async function downloadBarangExcel() {
  const res = await api.get("/barang/export-excel", {
    responseType: "blob",
  });

  const blob = new Blob([res.data], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "BARANG.xlsx";
  document.body.appendChild(a);
  a.click();

  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

export async function importMasterPartExcel(
  file: File
): Promise<boolean> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await api.post("/barang/import", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data.status === true;
}
