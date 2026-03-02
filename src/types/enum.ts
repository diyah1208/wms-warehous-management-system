export type UserRole =
  | "warehouse"
  | "purchasing"
  | "logistik"
  | "user"
  | "admin"
  | "unassigned";

export type AuthProvider = "credential" | "google";

export type Lokasi = {
  nama: string;
  kode: string;
};

export const LokasiList: Lokasi[] = [
  { nama: "JAKARTA", kode: "JKT" }, // jawa
  { nama: "TANJUNG ENIM", kode: "ENIM" }, // sumatera
  { nama: "BALIKPAPAN", kode: "BPN" }, // Kalimantan
  { nama: "SITE BA", kode: "BA" }, // Sumatera
  { nama: "SITE TAL", kode: "TAL" }, // Kalimantan
  { nama: "SITE MIP", kode: "MIP" }, // Sumatera
  { nama: "SITE MIFA", kode: "MIFA" }, // Sumatera
  { nama: "SITE BIB", kode: "BIB" }, // Kalimantan
  { nama: "SITE AMI", kode: "AMI" }, // Kalimantan
  { nama: "SITE TABANG", kode: "TAB" }, // Tabang
  { nama: "SITE BCP+PIK", kode: "BCP" }, // BCP+PIK
  // { nama: "unassigned", kode: "unassigned" },
];

export type LogCategory =
  | "User Activity"
  | "Material Request"
  | "Purchase Request"
  | "Purchase Order"
  | "Receive Item"
  | "Delivery";

export const DeliveryStatus = ["pending", "on delivery", "completed"];

export const DeliveryEkspedisi = [
  "JNE",
  "TIKI",
  "POS Indonesia",
  "J&T Express",
  "SiCepat",
  "Gojek",
  "Grab",
  "Hand Carry",
  "Lainnya",
  "Belum ditentukan",
];
export const PagingSize = 10;

