import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

type WithSidebarProps = { children?: React.ReactNode };

export default function WithSidebar({ children }: WithSidebarProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // if (loading) {
  //   return <SkeletonContent />;
  // }

  return (
    <SidebarProvider>
      <AppSidebar
        user={{
          nama: user?.nama ?? "",
          avatar: user?.image_url ?? "",
          email: user?.email ?? "",
          role: user?.role ?? "",
        }}
        className="shadow-lg"
      />

      <SidebarInset>
        <header className="flex h-16 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1 print:hidden" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">
                    Warehouse Management System
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                {urlToBreadcrumb(location.pathname)}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col p-4">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}

function urlToBreadcrumb(path: string) {
  const parts = path.split("/").filter(Boolean);

  return parts.map((part, i) => {
    const isLast = i === parts.length - 1;
    const label = decodeURIComponent(
      part.replace(/-/g, " ").replace(/\b\w/g, (s) => s.toUpperCase())
    );

    return (
      <BreadcrumbItem key={i}>
        {isLast ? (
          <BreadcrumbPage>{label}</BreadcrumbPage>
        ) : (
          <BreadcrumbLink href={`/${parts.slice(0, i + 1).join("/")}`}>
            {label}
          </BreadcrumbLink>
        )}
      </BreadcrumbItem>
    );
  });
}

function SkeletonContent() {
  return (
    <SidebarProvider>
      <AppSidebar
        user={{ nama: "Loading...", email: "", avatar: "" }}
        className="shadow-lg"
      />
      <SidebarInset>
        <div className="p-4 space-y-4">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}