import { createContext, useContext, useEffect, useState } from "react";
import { getCurrentUser } from "@/services/auth";
import type { UserComplete } from "@/types";
import { appCache } from "@/services/app-cache";

import { getAllMr } from "@/services/material-request";
import { getPr } from "@/services/purchase-request";
import { getPo } from "@/services/purchase-order";
import { getMasterVendors } from "@/services/vendor";
import { getAllStocks } from "@/services/stock";

interface AuthContextType {
  user: UserComplete | null;
  loading: boolean;
  setUser: (u: UserComplete | null) => void;
}

const AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }: { children: React.ReactNode }) {
const [user, setUser] = useState<UserComplete | null>(
    appCache.user // ⬅️ PAKAI CACHE
  );
  const [loading, setLoading] = useState(false); // ⬅️ TIDAK BLOCK UI

  // ======================
  // INIT AUTH
  // ======================
 useEffect(() => {
    if (appCache.user) return;

    getCurrentUser()
      .then((u) => {
        appCache.user = u;
        setUser(u);
      })
      .catch(() => {
        appCache.user = null;
        setUser(null);
      });
  }, []);

  // ======================
  // 🔥 GLOBAL PRELOAD CACHE
  // ======================
  useEffect(() => {
    if (!user) return;

    // jangan blocking render
    requestIdleCallback(async () => {
      try {
        if (!appCache.mrList) {
          appCache.mrList = await getAllMr();
        }

        if (!appCache.prList) {
          appCache.prList = await getPr();
        }

        // AuthContext.tsx
if (!appCache.poList) {
  appCache.poList = await getPo(); // getPo() → POHeader[]
}


        if (!appCache.vendorList) {
          appCache.vendorList = await getMasterVendors();
        }

        if (!appCache.stockList) {
          appCache.stockList = await getAllStocks();
        }
      } catch (e) {
        console.warn("Global preload cache failed", e);
      }
    });
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, loading, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);