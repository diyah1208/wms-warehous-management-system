import type { Stock } from "@/types";

export const stockCache: {
  data: Stock[] | null;
} = {
  data: null,
};