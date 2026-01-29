import type { POReceive } from "@/types";

export const poDetailCache: {
  [kode: string]: POReceive;
} = {};