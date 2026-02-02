import { useEffect, useMemo, useState } from "react";
import WithSidebar from "@/components/layout/WithSidebar";
import SectionContainer, {
  SectionHeader,
  SectionBody,
} from "@/components/content-container";

import { getDashboardData } from "@/services/dashboard";
import { LokasiList, PagingSize } from "@/types/enum";
import type { DashboardResponse } from "@/types";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Label } from "@/components/ui/label";


import { Input } from "@/components/ui/input";
import { MyPagination } from "@/components/my-pagination";
import { AlertCircle, Archive, CheckCircle, CircleDashed, Clock, Package, Truck } from "lucide-react";
import { DatePicker } from "@/components/date-picker";

const STATUS_COLOR: Record<string, string> = {
  mr: "#facc15",
  delivery: "#3b82f6",
  receive: "#22c55e",
};

function MrStatusBadge({ status }: { status?: string }) {
  if (!status) return <span>-</span>;

  const map: Record<
    string,
    { className: string; icon: React.ElementType }
  > = {
    open: {
      className: "bg-red-100 text-red-700",
      icon: Clock,
    },
    partial: {
      className: "bg-orange-100 text-orange-700",
      icon: CircleDashed,
    },
    close: {
      className: "bg-green-100 text-green-700",
      icon: CheckCircle,
    },
  };

  const data =
    map[status.toLowerCase()] ?? {
      className: "bg-gray-100 text-gray-700",
      icon: AlertCircle,
    };

  const Icon = data.icon;

  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${data.className}`}
    >
      <Icon className="h-4 w-4" />
      {status.toUpperCase()}
    </span>
  );
}

function DeliveryStatusBadge({ status }: { status?: string }) {
  if (!status) return <span>-</span>;

  const map: Record<
    string,
    { className: string; icon: React.ElementType }
  > = {
    pending: {
      className: "bg-gray-100 text-gray-700 border-gray-300",
      icon: Clock,
    },
    packing: {
      className: "bg-blue-100 text-blue-700 border-blue-300",
      icon: Package,
    },
    "ready to pickup": {
      className: "bg-purple-100 text-purple-700 border-purple-300",
      icon: Archive,
    },
    "on delivery": {
      className: "bg-orange-100 text-orange-700 border-orange-300",
      icon: Truck,
    },
    delivered: {
      className: "bg-green-100 text-green-700 border-green-300",
      icon: CheckCircle,
    },
  };

  const data =
    map[status.toLowerCase()] ?? {
      className: "bg-gray-100 text-gray-700 border-gray-300",
      icon: Clock,
    };

  const Icon = data.icon;

  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${data.className}`}
    >
      <Icon className="h-4 w-4" />
      {status.toUpperCase()}
    </span>
  );
}


function AlertCard({
  title,
  value,
  desc,
  color,
}: {
  title: string;
  value: number;
  desc: string;
  color: "yellow" | "blue" | "green";
}) {
  const map = {
    yellow: "bg-yellow-50 border-yellow-300",
    blue: "bg-blue-50 border-blue-300",
    green: "bg-green-50 border-green-300",
  };

  return (
    <div className={`border rounded-md p-4 ${map[color]}`}>
      <p className="text-sm font-medium">{title}</p>
      <p className="text-3xl font-bold my-1">{value}</p>
      <p className="text-xs text-muted-foreground">{desc}</p>
    </div>
  );
}

function DashboardTable({
  title,
  data,
  columns,
}: {
  title: string;
  data: any[];
  columns: {
    key: string;
    label: string;
    render?: (row: any) => React.ReactNode;
  }[];
}) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (!search) return data;
    return data.filter((row) =>
      Object.values(row)
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [data, search]);

  const start = (page - 1) * PagingSize;
  const pageData = filtered.slice(start, start + PagingSize);

  return (
    <div className="rounded-md border bg-white p-4">
      <div className="flex justify-between items-center mb-3">
        <p className="font-semibold">{title}</p>
      </div>

      <Input
        placeholder="Cari data..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
        className="mb-3"
      />

      <div className="max-h-[320px] overflow-auto">
        <table className="w-full border text-sm">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              {columns.map((c) => (
                <th key={c.key} className="border px-3 py-2 text-left">
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageData.map((row, i) => (
              <tr key={i} className="border-b hover:bg-gray-50">
                {columns.map((c) => (
                  <td key={c.key} className="border px-3 py-2">
                    {c.render ? c.render(row) : row[c.key] ?? "-"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3">
        <MyPagination
          data={filtered}
          currentPage={page}
          triggerNext={() => setPage((p) => p + 1)}
          triggerPrevious={() => setPage((p) => Math.max(1, p - 1))}
          triggerPageChange={setPage}
        />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [lokasi, setLokasi] = useState("SEMUA");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    getDashboardData().then(setDashboard);
  }, []);

  if (!dashboard) {
    return (
      <WithSidebar>
        <div className="p-6">Loading dashboard...</div>
      </WithSidebar>
    );
  }

  const filterLokasi = (data: any[], key: string) =>
    lokasi === "SEMUA"
      ? data
      : data.filter(
          (d) => d[key]?.toLowerCase() === lokasi.toLowerCase()
   );

   const filterByDate = (data: any[], key: string) => {
    if (!startDate && !endDate) return data;

    return data.filter((d) => {
      if (!d[key]) return false;

      const itemDate = new Date(d[key]);

      if (startDate && endDate) {
        return itemDate >= startDate && itemDate <= endDate;
      }

      if (startDate) {
        return itemDate >= startDate;
      }

      if (endDate) {
        return itemDate <= endDate;
      }

      return true;
    });
  };

  const mrData = filterByDate(
    filterLokasi(dashboard.details.latest_mr, "mr_lokasi"),
    "tanggal"
  );

  const deliveryData = filterByDate(
    filterLokasi(dashboard.details.latest_delivery, "dlv_ke_gudang"),
    "tanggal"
  );

  const receiveData = filterByDate(
    filterLokasi(dashboard.details.latest_receive, "ri_lokasi"),
    "tanggal"
  );

  const chartData = [
    { name: "MR", value: mrData.length, type: "mr" },
    { name: "Delivery", value: deliveryData.length, type: "delivery" },
    { name: "Receive", value: receiveData.length, type: "receive" },
  ];

  return (
    <WithSidebar>
      {/* HEADER */}
      <SectionContainer span={12}>
        <SectionHeader>Dashboard Gudang — {lokasi}</SectionHeader>
        <SectionBody>
          <div className="flex flex-wrap items-end gap-4">
            {/* Lokasi */}
            <div className="flex flex-col gap-1">
              <Label>Lokasi</Label>
              <select
                className="border rounded-md px-3 py-2 w-48"
                value={lokasi}
                onChange={(e) => setLokasi(e.target.value)}
              >
                <option value="SEMUA">Semua Lokasi</option>
                {LokasiList.map((l) => (
                  <option key={l.kode} value={l.nama}>
                    {l.nama}
                  </option>
                ))}
              </select>
            </div>
            {/* Start Date */}
            <div className="flex flex-col gap-1">
              <Label>Start Date</Label>
              <DatePicker value={startDate} onChange={setStartDate} />
            </div>
            {/* End Date */}
            <div className="flex flex-col gap-1">
              <Label>End Date</Label>
              <DatePicker value={endDate} onChange={setEndDate} />
            </div>
          </div>
        </SectionBody>
      </SectionContainer>

      {/* ALERT */}
      <SectionContainer span={12}>
        <SectionHeader>Ringkasan</SectionHeader>
        <SectionBody className="grid md:grid-cols-3 gap-4">
          <AlertCard
            title="Material Request"
            value={mrData.length}
            desc="MR terbaru"
            color="yellow"
          />
          <AlertCard
            title="Delivery"
            value={deliveryData.length}
            desc="Delivery aktif"
            color="blue"
          />
          <AlertCard
            title="Receive"
            value={receiveData.length}
            desc="Barang diterima"
            color="green"
          />
        </SectionBody>
      </SectionContainer>

      {/* CHART */}
      <SectionContainer span={12}>
        <SectionHeader>Status Ringkas</SectionHeader>
        <SectionBody>
          <div className="w-full h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {chartData.map((d, i) => (
                    <Cell key={i} fill={STATUS_COLOR[d.type]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionBody>
      </SectionContainer>

      {/* TABLE MR */}
      <SectionContainer span={12}>
        <SectionHeader>Material Request</SectionHeader>
        <SectionBody>
          <DashboardTable
            title="Latest MR"
            data={mrData}
            columns={[
              { key: "mr_kode", label: "Kode MR" },
              { key: "mr_lokasi", label: "Lokasi" },
              {
                key: "mr_status",
                label: "Status",
                render: (row) => (
                  <MrStatusBadge status={row.mr_status} />
                ),
              },
              { key: "tanggal", label: "Tanggal" },
            ]}
          />
        </SectionBody>
      </SectionContainer>

      {/* TABLE DELIVERY & RECEIVE */}
      <SectionContainer span={12}>
        <SectionHeader>Delivery & Receive</SectionHeader>
        <SectionBody className="grid md:grid-cols-2 gap-6">
          <DashboardTable
            title="Latest Delivery"
            data={deliveryData}
            columns={[
              { key: "dlv_kode", label: "Kode" },
              { key: "dlv_ke_gudang", label: "Gudang" },
              {
                key: "dlv_status",
                label: "Status",
                render: (row) => (
                  <DeliveryStatusBadge status={row.dlv_status} />
                ),
              },
              { key: "tanggal", label: "Tanggal" },
            ]}
          />

          <DashboardTable
            title="Latest Receive"
            data={receiveData}
            columns={[
              { key: "ri_kode", label: "Kode" },
              { key: "ri_lokasi", label: "Lokasi" },
              { key: "tanggal", label: "Tanggal" },
            ]}
          />
        </SectionBody>
      </SectionContainer>
    </WithSidebar>
  );
}
