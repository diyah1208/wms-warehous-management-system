import { useState } from "react";
import WithSidebar from "@/components/layout/WithSidebar";
import SectionContainer, {
  SectionHeader,
  SectionBody,
} from "@/components/content-container";
import { Card, CardContent } from "@/components/ui/card";
import {
  LayoutDashboard,
  Users,
  User,
  ClipboardList,
  FileText,
  BookOpen,
  PackageCheck,
  Boxes,
  Truck,
  LogOut,
  FileBarChart,
  Files,
  ClipboardCheck,
  Receipt,
} from "lucide-react";

// DETAIL COMPONENTS
import DashboardDoc from "./details/dashboard";
import VendorDoc from "./details/vendor";
import CustomerDoc from "./details/customer";
import MRDoc from "./details/mr";
import PRDoc from "./details/pr";
import PODoc from "./details/po";
import RIDoc from "./details/receive";
import BarangDoc from "./details/barang";
import DeliveryDoc from "./details/delivery";
import ReportSPBDoc from "./details/report-spb";
import SPBDoc from "./details/spb";
import DeliveryOrderDoc from "./details/delivery-order";
import InvoiceDoc from "./details/invoice";

const DOCS = [
  { title: "Dashboard", slug: "dashboard", icon: <LayoutDashboard />, description: "Ringkasan data & aktivitas" },
  { title: "Vendor", slug: "vendor", icon: <Users />, description: "Manajemen data vendor" },
  { title: "Customer", slug: "customer", icon: <User />, description: "Manajemen data customer" },

  { title: "Material Request (MR)", slug: "mr", icon: <ClipboardList />, description: "Permintaan barang dari gudang" },
  { title: "Purchase Request (PR)", slug: "pr", icon: <FileText />, description: "Permintaan pembelian dari MR" },
  { title: "Purchase Order (PO)", slug: "po", icon: <BookOpen />, description: "Order pembelian ke vendor" },

  { title: "Receive Item (RI)", slug: "receive", icon: <PackageCheck />, description: "Penerimaan barang dari PO" },
  { title: "Barang & Stok", slug: "barang", icon: <Boxes />, description: "Master barang & stok gudang" },
  { title: "Delivery", slug: "delivery", icon: <Truck />, description: "Pengiriman antar gudang" },

  { title: "Report SPB", slug: "report-spb", icon: <FileBarChart />, description: "Laporan SPB" },
  { title: "SPB", slug: "spb", icon: <Files />, description: "Surat Permintaan Barang" },
  { title: "Delivery Order", slug: "delivery-order", icon: <ClipboardCheck />, description: "Dokumen pengiriman" },
  { title: "Invoice", slug: "invoice", icon: <Receipt />, description: "Dokumen penagihan" },
];

export default function Dokumentasi() {
  const [active, setActive] = useState("dashboard");

  function renderDetail() {
    switch (active) {
      case "dashboard": return <DashboardDoc />;
      case "vendor": return <VendorDoc />;
      case "customer": return <CustomerDoc />;
      case "mr": return <MRDoc />;
      case "pr": return <PRDoc />;
      case "po": return <PODoc />;
      case "receive": return <RIDoc />;
      case "barang": return <BarangDoc />;
      case "delivery": return <DeliveryDoc />;
      case "report-spb": return <ReportSPBDoc />;
      case "spb": return <SPBDoc />;
      case "delivery-order": return <DeliveryOrderDoc />;
      case "invoice": return <InvoiceDoc />;
      default:
        return <div className="text-muted-foreground">Pilih dokumentasi</div>;
    }
  }

  return (
    <WithSidebar>
      <SectionContainer span={12}>
        <SectionHeader>Dokumentasi Aplikasi</SectionHeader>

        <SectionBody className="grid grid-cols-12 gap-4 min-h-[650px]">
          {/* LEFT */}
          <div className="col-span-12 md:col-span-4 space-y-2">
            {DOCS.map((doc) => {
              const isActive = active === doc.slug;
              return (
                <Card
                  key={doc.slug}
                  onClick={() => setActive(doc.slug)}
                  className={`cursor-pointer ${
                    isActive ? "border-primary bg-primary/5" : "hover:bg-muted"
                  }`}
                >
                  <CardContent className="flex gap-3 p-4">
                    {doc.icon}
                    <div>
                      <p className="font-semibold">{doc.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {doc.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* RIGHT */}
          <div className="col-span-12 md:col-span-8 border rounded-md p-6">
            {renderDetail()}
          </div>
        </SectionBody>
      </SectionContainer>
    </WithSidebar>
  );
}
