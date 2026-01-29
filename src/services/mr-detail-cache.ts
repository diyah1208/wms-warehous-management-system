import type { MRReceive } from "@/types";

export const mrDetailCache: {
  [kode: string]: MRReceive;
} = {};