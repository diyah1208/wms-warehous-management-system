import type { UserDb } from "@/types";

export const userCache: {
  data: UserDb[] | null;
} = {
  data: null,
};