// src/services/app-cache.ts
import type {
  MRReceive,
  PurchaseRequest,
  POHeader,
  POReceive,
  MasterVendor,
  Stock,
  DashboardResponse,

} from "@/types";

export const appCache = {
  // USER
  user: null as any | null,

  // LIST DATA
  mrList: null as MRReceive[] | null,
  prList: null as PurchaseRequest[] | null,
  poList: null as POHeader[] | null, // ⬅️ FIX DI SINI

  // DETAIL CACHE (per kode)
  poDetail: {} as Record<string, POReceive>,
  prDetail: {} as Record<string, PurchaseRequest>,

  // MASTER DATA
  vendorList: null as MasterVendor[] | null,
  stockList: null as Stock[] | null,

    // DASHBOARD
  dashboard: null as DashboardResponse | null,

  // TIME (opsional)
  lastFetch: {
    dashboard: 0,
  },
};