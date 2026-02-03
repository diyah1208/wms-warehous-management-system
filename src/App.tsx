import DeliverySign from "@/views/dlv-sign";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Login from "@/views/login";
import Register from "@/views/register";
import ForgotPassword from "@/views/forgot-password";
import Dashboard from "@/views/dashboard";
import BarangDanStok from "@/views/barang-dan-stok";
import MaterialRequest from "@/views/material-request";
import { MaterialRequestDetail } from "@/views/material-request/[kode]";
import ReceiveItem from "@/views/receive-item";
import { ReceiveDetail } from "@/views/receive-item/[kode]";
import DeliveryPage from "@/views/delivery";
import { DeliveryDetail } from "@/views/delivery/[kode]";
import PurchaseRequest from "@/views/purchase-request";
import PurchaseOrder from "@/views/purchase-order";
import PurchaseOrderDetail from "@/views/purchase-order/[kode]";
import UserManagement from "@/views/user-management";
import ReportSpb from "@/views/spb";
import SpbPage from "@/views/spb/pengeluaran/index.tsx";
import NotFound from "@/views/not-found";
import { PurchaseRequestDetail } from "./views/purchase-request/[kode]";
import Setting from "./views/setting/index.tsx";
//import MRSign from "@/views/mr-sign";
import SpbPoPage from "./views/spb/po/index.tsx";
import SpbDoPage from "./views/spb/do/index.tsx";
import SpbInvoicePage from "./views/spb/invoice/index.tsx";
import DeliverySign from "./views/dlv-sign/index.tsx";
import PrintPartQr from "@/views/barang-dan-stok/print-qr.tsx";
import ReceiveSign from "./views/ri-sign/index.tsx";
import { SpbDetail } from "./views/spb/pengeluaran/[kode]/index.tsx";
import MasterVendorPage from "@/views/vendor";
import MasterCustomerPage from "@/views/customer";
import MRSign from "@/views/mr-sign";
import PRSign from "@/views/pr-sign";
import POSign from "@/views/po-sign";
import InputLockedBanner from "./components/InputLockedBanner.tsx";
import { InputLockProvider } from "./context/InputLockContext.tsx";
import PeminjamanIndex from "./views/peminjaman/index.tsx";
import PeminjamanDetailPage from "./views/peminjaman/[kode]/index.tsx";


export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <InputLockProvider>
          {/* 🔴 Banner GLOBAL */}
          <InputLockedBanner />
        <Routes>
          {/* ================= PUBLIC ================= */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          {/* <Route path="/verify-email" element={<VerifyEmail />} /> */}
          <Route path="/forgot-password" element={<ForgotPassword />} />
         

          {/* ================= ROOT ================= */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Navigate to="/dashboard" replace />
              </ProtectedRoute>
            }
          />

          {/* ================= DASHBOARD ================= */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
               <Route
            path="/peminjaman"
            element={
              <ProtectedRoute>
                <PeminjamanIndex />
              </ProtectedRoute>
            }
          />
          <Route
            path="/peminjaman/kode/:kode"
            element={
              <ProtectedRoute>
                <PeminjamanDetailPage />
              </ProtectedRoute>
            }
          />

          {/* ================= BARANG & STOK ================= */}
          <Route
            path="/barang-dan-stok"
            element={
              <ProtectedRoute>
                <BarangDanStok />
              </ProtectedRoute>
            }
          />
          <Route
            path="/barang-dan-stok/part-qr/:partNumber/:partName"
            element={
              <ProtectedRoute>
                <PrintPartQr />
              </ProtectedRoute>
            }
          />
          {/* ================= MATERIAL REQUEST ================= */}
          <Route
            path="/material-request"
            element={
              <ProtectedRoute>
                <MaterialRequest />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mr/kode/:kode"
            element={
              <ProtectedRoute>
                <MaterialRequestDetail />
              </ProtectedRoute>
            }
          />
          
          {/* //<Route path="/mr-sign/:kode" element={<MRSign />} /> */}
          <Route path="/delivery/sign/:kode" element={<DeliverySign />} />
          <Route path="/receive/sign/:kode" element={<ReceiveSign />} />
          
          {/* ================= SPB ================= */}
          <Route
            path="/spb"
            element={
              <ProtectedRoute>
                <ReportSpb/>
              </ProtectedRoute>
            }
          />
          <Route
            path="/spb/pengeluaran"
            element={
              <ProtectedRoute>
                <SpbPage/>
              </ProtectedRoute>
            }
          />
          <Route
            path="/spb/kode/:kode"
            element={
              <ProtectedRoute>
                <SpbDetail />
              </ProtectedRoute>
            }
          />

          <Route
            path="/spb/po"
            element={
              <ProtectedRoute>
                <SpbPoPage/>
              </ProtectedRoute>
            }
          />
          <Route
            path="/spb/do"
            element={
              <ProtectedRoute>
                <SpbDoPage/>
              </ProtectedRoute>
            }
          />
          <Route
            path="/spb/invoice"
            element={
              <ProtectedRoute>
                <SpbInvoicePage/>
              </ProtectedRoute>
            }
          />


<Route path="/mr-sign/:kode" element={<MRSign />} />

          {/* ================= RECEIVE ================= */}
          <Route
            path="/receive-item"
            element={
              <ProtectedRoute>
                <ReceiveItem />
              </ProtectedRoute>
            }
          />
          <Route
            path="/receive/kode/:kode"
            element={
              <ProtectedRoute>
                <ReceiveDetail />
              </ProtectedRoute>
            }
          />

          {/* ================= DELIVERY ================= */}
          <Route
            path="/delivery"
            element={
              <ProtectedRoute>
                <DeliveryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/deliveries/kode/:kode"
            element={
              <ProtectedRoute>
                <DeliveryDetail />
              </ProtectedRoute>
            }
          />

          {/* ================= PURCHASE ================= */}
          <Route
            path="/purchase-request"
            element={
              <ProtectedRoute>
                <PurchaseRequest />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pr/kode/:kode"
            element={
              <ProtectedRoute>
                <PurchaseRequestDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/purchase-order"
            element={
              <ProtectedRoute>
                <PurchaseOrder />
              </ProtectedRoute>
            }
          />
          <Route
            path="/po/kode/:kode"
            element={
              <ProtectedRoute>
                <PurchaseOrderDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sign/delivery/:kode"
            element={<DeliverySignPage />}
          />

          <Route path="/po-sign/:kode" element={<POSign />} />
          <Route path="/pr-sign/:kode" element={<PRSign />} />
   {/* ================= Vendor ================= */}
          <Route
            path="/vendors"
            element={
              <ProtectedRoute>
                <MasterVendorPage />
              </ProtectedRoute>
            }
          />

            {/* ================= Customer ================= */}
          <Route
            path="/customers"
            element={
              <ProtectedRoute>
                <MasterCustomerPage/>
              </ProtectedRoute>
            }
          />
          {/* ================= USER MANAGEMENT ================= */}
          <Route
            path="/user-management"
            element={
              <ProtectedRoute>
                <UserManagement />
              </ProtectedRoute>
            }
          />
          <Route path="/setting" element={<Setting />} />

          {/* ================= FALLBACK ================= */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </InputLockProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
