import api from "@/lib/axios";
import type { Stock } from "@/types";

// export async function getAllStocks(): Promise<Stock[]> {
//   const res = await api.get("/stock");
//   return res.data.data;
// }

export async function getAllStocks(page = 1, limit = 15000) {
  const res = await api.get(`/stock?page=${page}&limit=${limit}`);
  return res.data.data;
}


export async function saveStock(data: {
  part_id: number;
  stk_location: string;
  stk_qty: number;
  stk_min: number;
  stk_max: number;
}) {
  const res = await api.post("/stock", data);
  return res.data;
}

export async function downloadStockExcel() {
  const res = await api.get("/stock/export-excel", {
    responseType: "blob",
  });

  const blob = new Blob([res.data], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const today = new Date().toISOString().split("T")[0];

  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `STOCK_${today}.xlsx`; 
  document.body.appendChild(a);
  a.click();

  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

export async function importStockExcel(file: File): Promise<boolean> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await api.post("/stock/import", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data.status === true;
}

