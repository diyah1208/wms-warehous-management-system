import type { PurchaseRequest } from "@/types";

export const prDetailCache: {
  [kode: string]: PurchaseRequest;
} = {};