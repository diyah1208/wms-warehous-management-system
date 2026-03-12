import * as React from "react"
import {
  BaggageClaim,
  BookOpen,
  Bot,
  FileBox,
  Info,
  LayoutDashboard,
  PackageOpen,
  Settings2,
  ShoppingCart,
  Truck,
  Warehouse,
  PackageMinus,
  FilePlus,
  FileBarChart,
  ShoppingBag,
  ReceiptText,
  PackageCheck,
  Building2,
  User,
  Repeat,
  Briefcase,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

import { useLocation } from "react-router-dom"


const data = {
  logo: "/Logo Garuda Mart Indonesia.png" ,

  

  navAdmin: [
    {
      title: "User Management",
      url: "/user-management",
      icon: Bot,
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Vendor",
      url: "/vendors",
      icon: Building2,
    },
    {
      title: "Customer",
      url: "/customers",
      icon: User,
    },
    {
      title: "Material Request",
      url: "/material-request",
      icon: FileBox,
    },
    {
      title: "Purchase Request",
      url: "/purchase-request",
      icon: ShoppingCart,
    },
    {
      title: "Purchase Order",
      url: "/purchase-order",
      icon: BaggageClaim,
    },
    {
      title: "Receive Item",
      url: "/receive-item",
      icon: PackageOpen,
    },
    {
      title: "Barang dan Stok",
      url: "/barang-dan-stok",
      icon: Warehouse,
    },
    {
      title: "Delivery",
      url: "/delivery",
      icon: Truck,
    },
    {
      title: "Job Costing",
      url: "/job-costing",
      icon: Briefcase,
    },
     {
      title: "Peminjaman",
      url: "/peminjaman",
      icon: Repeat ,
    },
    {
      title: "Stock Out",
      icon: PackageMinus,
      items: [
        {
          title: "Report SPB",
          url: "/spb",
          icon: FileBarChart,
        },
        {
          title: "SPB",
          url: "/spb/pengeluaran",
          icon: FilePlus,
        },
        {
          title: "Purchase Order",
          url: "/spb/po",
          icon: ShoppingBag,
        },
        {
          title: "Delivery Order",
          url: "/spb/do",
          icon: PackageCheck,
        },
        {
          title: "Invoice",
          url: "/spb/invoice",
          icon: ReceiptText,
        },
        {
          title: "Return SPB",
          url: "/return",
          icon: Repeat,
        },
      ],
    },
    {
      title: "Setting",
      url: "/setting",
      icon: Settings2,
    },
  ],
  navSecondary: [
    {
      title: "Dokumentasi",
      url: "/dokumentasi",
      icon: BookOpen,
    },
    {
      title: "Tentang App",
      url: "/tentang-app",
      icon: Info,
    },
  ],
}

export function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user: { avatar: string; email: string; nama: string; role?: string }
}) {
  const location = useLocation()
  const currentPath = location.pathname
  const role = user.role;

  const visibleNavMain =
  role === "marketing"
    ? data.navMain.filter(item =>
        ["Peminjaman", "Stock Out","Barang dan Stok"].includes(item.title)
      )
    : role === "finance"
    ? data.navMain.filter(item =>
        ["Stock Out", "Barang dan Stok"].includes(item.title)
      )
    : data.navMain.filter(item =>
        item.title !== "Peminjaman"
      );


  const markActive = (items: typeof data.navMain) =>
    items.map((item) => ({
      ...item,
      isActive: currentPath === item.url,
    }))

  return (
    <Sidebar collapsible="icon" {...props}>
      {/* HEADER LOGO ONLY */}
      <SidebarHeader className="flex items-center justify-center py-4">
        <img
          src={data.logo}
          alt="Garuda Mart Indonesia"
          className="h-10 w-auto object-contain dark:invert"
        />
      </SidebarHeader>

      <SidebarContent>
        {user.role === "superadmin" && (
          <NavMain label="Superadmin" items={markActive(data.navAdmin)} />
        )}
        <NavMain items={markActive(visibleNavMain)} />
        <NavMain label="About" items={markActive(data.navSecondary)} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser
          user={{
            avatar: user.avatar,
            email: user.email,
            name: user.nama,
          }}
        />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
