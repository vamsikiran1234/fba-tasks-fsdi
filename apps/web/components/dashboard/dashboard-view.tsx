"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceArea,
  ComposedChart,
} from "recharts";
import { TrendingUp, TrendingDown, DollarSign, FileText, Upload, Calculator } from "lucide-react";
import { ExportButton } from "@/components/export/export-button";

// Custom Bar Component for hover effect
const CustomBar = (props: any) => {
  const { fill, x, y, width, height, payload, activeBar, setActiveBar } = props;
  const isActive = activeBar === payload.vendorName;
  const barFill = isActive ? fill : `${fill}66`; // 66 is 40% opacity in hex

  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      fill={barFill}
      onMouseEnter={() => setActiveBar(payload.vendorName)}
      onMouseLeave={() => setActiveBar(null)}
      style={{ cursor: "pointer", transition: "fill 0.3s" }}
      rx={4}
    />
  );
};

// Types
interface Stats {
  totalSpend: { value: number; change: number; period: string };
  totalInvoicesProcessed: { value: number; change: number; period: string };
  documentsUploaded: { value: number; change: number; period: string };
  averageInvoiceValue: { value: number; change: number; period: string };
}

interface TrendData {
  month: string;
  year: number;
  invoiceCount: number;
  totalSpend: number;
}

interface VendorData {
  vendorName: string;
  totalSpend: number;
  invoiceCount: number;
}

interface CategoryData {
  category: string;
  totalSpend: number;
  invoiceCount: number;
}

interface ForecastData {
  period: string;
  totalAmount: number;
  invoiceCount: number;
}

interface Invoice {
  id: string;
  name: string;
  vendorName: string;
  invoiceNumber: string;
  invoiceDate: string;
  amount: number;
  currency: string;
  status: string;
  category: string;
}

const COLORS = ["#2B4DED", "#2563eb", "#f59e0b", "#8b5cf6", "#10b981", "#ef4444", "#6366f1"];

export function DashboardView() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [vendors, setVendors] = useState<VendorData[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [forecast, setForecast] = useState<ForecastData[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeBar, setActiveBar] = useState<string | null>(null);
  const [activePoint, setActivePoint] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all data in parallel
      const API_BASE = "http://localhost:3001";
      const [statsRes, trendsRes, vendorsRes, categoriesRes, forecastRes, invoicesRes] =
        await Promise.all([
          fetch(`${API_BASE}/api/stats`),
          fetch(`${API_BASE}/api/invoice-trends`),
          fetch(`${API_BASE}/api/vendors/top10`),
          fetch(`${API_BASE}/api/category-spend`),
          fetch(`${API_BASE}/api/cash-outflow`),
          fetch(`${API_BASE}/api/invoices?limit=10`),
        ]);

      // Check if responses are ok
      if (!statsRes.ok) {
        console.error("Stats API error:", statsRes.status, await statsRes.text());
      }
      if (!trendsRes.ok) {
        console.error("Trends API error:", trendsRes.status, await trendsRes.text());
      }
      if (!vendorsRes.ok) {
        console.error("Vendors API error:", vendorsRes.status, await vendorsRes.text());
      }
      if (!categoriesRes.ok) {
        console.error("Categories API error:", categoriesRes.status, await categoriesRes.text());
      }
      if (!forecastRes.ok) {
        console.error("Forecast API error:", forecastRes.status, await forecastRes.text());
      }
      if (!invoicesRes.ok) {
        console.error("Invoices API error:", invoicesRes.status, await invoicesRes.text());
      }

      const statsData = statsRes.ok ? await statsRes.json() : null;
      const trendsData = trendsRes.ok ? await trendsRes.json() : [];
      const vendorsData = vendorsRes.ok ? await vendorsRes.json() : [];
      const categoriesData = categoriesRes.ok ? await categoriesRes.json() : [];
      const forecastData = forecastRes.ok ? await forecastRes.json() : [];
      const invoicesData = invoicesRes.ok ? await invoicesRes.json() : { invoices: [] };

      setStats(statsData);
      setTrends(trendsData);
      setVendors(vendorsData);
      setCategories(categoriesData);
      setForecast(forecastData);
      setInvoices(invoicesData.invoices || []);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    if (term.length > 2) {
      try {
        const API_BASE = "http://localhost:3001";
        const res = await fetch(
          `${API_BASE}/api/invoices?search=${term}&page=${currentPage}&limit=10`
        );
        const data = await res.json();
        setInvoices(data.invoices || []);
      } catch (error) {
        console.error("Error searching invoices:", error);
      }
    } else if (term.length === 0) {
      loadDashboardData();
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("de-DE");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-5 space-y-4">
      {/* Overview Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Total Spend */}
          <Card className="border border-gray-200 shadow-sm bg-white rounded-lg relative overflow-hidden max-w-[280px]">
            <CardHeader className="pb-2 pt-4 px-5">
              <CardTitle className="text-xs font-medium text-gray-900 uppercase tracking-wide">
                Total Spend
              </CardTitle>
              <CardDescription className="text-[10px] text-gray-400 uppercase mt-0.5">
                (YTD)
              </CardDescription>
            </CardHeader>
            <CardContent className="px-5 pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {formatCurrency(stats.totalSpend.value)}
                  </div>
                  <div className="flex items-center text-xs">
                    <span
                      className={`font-medium ${
                        stats.totalSpend.change >= 0 ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {stats.totalSpend.change >= 0 ? "↗ +" : "↘ "}
                      {stats.totalSpend.change.toFixed(1)}%
                    </span>
                    <span className="text-gray-500 ml-1 text-[11px]">
                      {stats.totalSpend.period}
                    </span>
                  </div>
                </div>
                {/* Trend Graphic */}
                <div className="flex items-end" style={{ marginLeft: "-22px", height: "26px" }}>
                  <svg
                    width="47"
                    height="26"
                    viewBox="0 0 47 26"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ transform: stats.totalSpend.change < 0 ? "scaleY(-1)" : "none" }}
                  >
                    <path
                      d="M13.3821 10.2507L5.40001 16.9826L0.75 21.8348V25.9996H46.4414V18.8022V0L42.3979 3.03261L38.1522 9.03761L28.8727 2.41139L21.2234 12.2685L13.3821 10.2507Z"
                      fill={`url(#paint0_linear_totalSpend)`}
                    />
                    <path
                      d="M0.75 21.8348L10.595 11.8229C11.8791 10.5171 13.7742 10.0177 15.535 10.5213L19.1584 11.5576C20.3933 11.9108 21.7159 11.4387 22.4481 10.3835L26.7846 4.13361C27.8645 2.57715 30.099 2.39895 31.412 3.76456L36.7073 9.27207C37.3997 9.99218 38.5875 9.85534 39.098 8.99667L41.7401 4.55257C42.5427 3.20268 43.8945 2.27035 45.4414 1.99979"
                      stroke={stats.totalSpend.change >= 0 ? "#3AB37E" : "#ED1C24"}
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient
                        id="paint0_linear_totalSpend"
                        x1="26.6283"
                        y1="-0.747887"
                        x2="31.4805"
                        y2="20.6826"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop stopColor={stats.totalSpend.change >= 0 ? "#3AB37E" : "#ED1C24"} />
                        <stop offset="1" stopColor="#D9D9D9" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Invoices */}
          <Card className="border border-gray-200 shadow-sm bg-white rounded-lg relative overflow-hidden max-w-[280px]">
            <CardHeader className="pb-2 pt-4 px-5">
              <CardTitle className="text-xs font-medium text-gray-900 uppercase tracking-wide">
                Total Invoices Processed
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {stats.totalInvoicesProcessed.value}
                  </div>
                  <div className="flex items-center text-xs">
                    <span
                      className={`font-medium ${
                        stats.totalInvoicesProcessed.change >= 0 ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {stats.totalInvoicesProcessed.change >= 0 ? "↗ +" : "↘ "}
                      {stats.totalInvoicesProcessed.change.toFixed(1)}%
                    </span>
                    <span className="text-gray-500 ml-1 text-[11px]">
                      {stats.totalInvoicesProcessed.period}
                    </span>
                  </div>
                </div>
                {/* Trend Graphic */}
                <div className="flex items-end" style={{ marginLeft: "-22px", height: "26px" }}>
                  <svg
                    width="47"
                    height="26"
                    viewBox="0 0 47 26"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{
                      transform: stats.totalInvoicesProcessed.change < 0 ? "scaleY(-1)" : "none",
                    }}
                  >
                    <path
                      d="M13.3821 10.2507L5.40001 16.9826L0.75 21.8348V25.9996H46.4414V18.8022V0L42.3979 3.03261L38.1522 9.03761L28.8727 2.41139L21.2234 12.2685L13.3821 10.2507Z"
                      fill={`url(#paint0_linear_totalInvoices)`}
                    />
                    <path
                      d="M0.75 21.8348L10.595 11.8229C11.8791 10.5171 13.7742 10.0177 15.535 10.5213L19.1584 11.5576C20.3933 11.9108 21.7159 11.4387 22.4481 10.3835L26.7846 4.13361C27.8645 2.57715 30.099 2.39895 31.412 3.76456L36.7073 9.27207C37.3997 9.99218 38.5875 9.85534 39.098 8.99667L41.7401 4.55257C42.5427 3.20268 43.8945 2.27035 45.4414 1.99979"
                      stroke={stats.totalInvoicesProcessed.change >= 0 ? "#3AB37E" : "#ED1C24"}
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient
                        id="paint0_linear_totalInvoices"
                        x1="26.6283"
                        y1="-0.747887"
                        x2="31.4805"
                        y2="20.6826"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop
                          stopColor={
                            stats.totalInvoicesProcessed.change >= 0 ? "#3AB37E" : "#ED1C24"
                          }
                        />
                        <stop offset="1" stopColor="#D9D9D9" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documents Uploaded */}
          <Card className="border border-gray-200 shadow-sm bg-white rounded-lg relative overflow-hidden max-w-[280px]">
            <CardHeader className="pb-2 pt-4 px-5">
              <CardTitle className="text-xs font-medium text-gray-900 uppercase tracking-wide">
                Documents Uploaded
              </CardTitle>
              <CardDescription className="text-[10px] text-gray-400 uppercase mt-0.5">
                This Month
              </CardDescription>
            </CardHeader>
            <CardContent className="px-5 pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {stats.documentsUploaded.value}
                  </div>
                  <div className="flex items-center text-xs">
                    <span className="font-medium text-red-500">
                      <TrendingDown className="inline w-3 h-3 mr-0.5" />
                      {stats.documentsUploaded.change}%
                    </span>
                    <span className="text-gray-400 ml-1.5 text-[10px]">
                      {stats.documentsUploaded.period}
                    </span>
                  </div>
                </div>
                {/* Trend Graphic */}
                <div className="flex items-end" style={{ marginLeft: "-22px", height: "26px" }}>
                  <svg
                    width="47"
                    height="26"
                    viewBox="0 0 47 26"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ transform: "scaleY(-1)" }}
                  >
                    <path
                      d="M13.3821 10.2507L5.40001 16.9826L0.75 21.8348V25.9996H46.4414V18.8022V0L42.3979 3.03261L38.1522 9.03761L28.8727 2.41139L21.2234 12.2685L13.3821 10.2507Z"
                      fill={`url(#paint0_linear_documentsUploaded)`}
                    />
                    <path
                      d="M0.75 21.8348L10.595 11.8229C11.8791 10.5171 13.7742 10.0177 15.535 10.5213L19.1584 11.5576C20.3933 11.9108 21.7159 11.4387 22.4481 10.3835L26.7846 4.13361C27.8645 2.57715 30.099 2.39895 31.412 3.76456L36.7073 9.27207C37.3997 9.99218 38.5875 9.85534 39.098 8.99667L41.7401 4.55257C42.5427 3.20268 43.8945 2.27035 45.4414 1.99979"
                      stroke="#ED1C24"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient
                        id="paint0_linear_documentsUploaded"
                        x1="26.6283"
                        y1="-0.747887"
                        x2="31.4805"
                        y2="20.6826"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop stopColor="#ED1C24" />
                        <stop offset="1" stopColor="#D9D9D9" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Average Invoice Value */}
          <Card className="border border-gray-200 shadow-sm bg-white rounded-lg relative overflow-hidden max-w-[280px]">
            <CardHeader className="pb-2 pt-4 px-5">
              <CardTitle className="text-xs font-medium text-gray-900 uppercase tracking-wide">
                Average Invoice Value
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {formatCurrency(stats.averageInvoiceValue.value)}
                  </div>
                  <div className="flex items-center text-xs">
                    <span
                      className={`font-medium ${
                        stats.averageInvoiceValue.change >= 0 ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {stats.averageInvoiceValue.change >= 0 ? (
                        <TrendingUp className="inline w-3 h-3 mr-0.5" />
                      ) : (
                        <TrendingDown className="inline w-3 h-3 mr-0.5" />
                      )}
                      {stats.averageInvoiceValue.change >= 0 ? "+" : ""}
                      {stats.averageInvoiceValue.change}%
                    </span>
                    <span className="text-gray-400 ml-1.5 text-[10px]">
                      {stats.averageInvoiceValue.period}
                    </span>
                  </div>
                </div>
                {/* Trend Graphic */}
                <div className="flex items-end" style={{ marginLeft: "-22px", height: "26px" }}>
                  <svg
                    width="47"
                    height="26"
                    viewBox="0 0 47 26"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{
                      transform: stats.averageInvoiceValue.change < 0 ? "scaleY(-1)" : "none",
                    }}
                  >
                    <path
                      d="M13.3821 10.2507L5.40001 16.9826L0.75 21.8348V25.9996H46.4414V18.8022V0L42.3979 3.03261L38.1522 9.03761L28.8727 2.41139L21.2234 12.2685L13.3821 10.2507Z"
                      fill={`url(#paint0_linear_avgInvoiceValue)`}
                    />
                    <path
                      d="M0.75 21.8348L10.595 11.8229C11.8791 10.5171 13.7742 10.0177 15.535 10.5213L19.1584 11.5576C20.3933 11.9108 21.7159 11.4387 22.4481 10.3835L26.7846 4.13361C27.8645 2.57715 30.099 2.39895 31.412 3.76456L36.7073 9.27207C37.3997 9.99218 38.5875 9.85534 39.098 8.99667L41.7401 4.55257C42.5427 3.20268 43.8945 2.27035 45.4414 1.99979"
                      stroke={stats.averageInvoiceValue.change >= 0 ? "#3AB37E" : "#ED1C24"}
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient
                        id="paint0_linear_avgInvoiceValue"
                        x1="26.6283"
                        y1="-0.747887"
                        x2="31.4805"
                        y2="20.6826"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop
                          stopColor={stats.averageInvoiceValue.change >= 0 ? "#3AB37E" : "#ED1C24"}
                        />
                        <stop offset="1" stopColor="#D9D9D9" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts Row 1: Invoice Volume + Spend by Vendor side-by-side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Invoice Volume + Value Trend */}
        <Card className="border border-gray-200 shadow-sm rounded-lg bg-white">
          <CardHeader className="border-b border-gray-100 pb-3 pt-4 px-5">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold text-gray-900">
                  Invoice Volume + Value Trend
                </CardTitle>
                <CardDescription className="text-xs text-gray-500 mt-0.5">
                  Invoice count and total spend over 12 months.
                </CardDescription>
              </div>
              <ExportButton type="analytics" label="Export Analytics" />
            </div>
          </CardHeader>
          <CardContent className="px-5 py-4">
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart
                data={trends.map((trend) => ({
                  ...trend,
                  bgHeight: Math.max(trend.invoiceCount, trend.totalSpend) * 1.2,
                }))}
                margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                onMouseMove={(state) => {
                  if (state.isTooltipActive && state.activeLabel) {
                    setActivePoint(state.activeLabel);
                  }
                }}
                onMouseLeave={() => setActivePoint(null)}
              >
                <defs>
                  {/* No gradients needed - using solid colors */}
                </defs>
                
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6B7280", fontSize: 13, fontWeight: 400 }}
                  dy={10}
                />
                
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9CA3AF", fontSize: 12 }}
                  tickFormatter={(value) => value.toLocaleString()}
                  domain={[0, 'auto']}
                  dx={-10}
                />

                {/* Background bars - always visible as vertical rectangles */}
                <Bar
                  dataKey="bgHeight"
                  fill="#E9ECF1"
                  radius={[4, 4, 4, 4]}
                  barSize={45}
                  isAnimationActive={false}
                  legendType="none"
                >
                  {trends.map((trend, index) => {
                    const isActive = activePoint === trend.month;
                    return (
                      <Cell
                        key={`bg-cell-${index}`}
                        fill={isActive ? "#BDBCD6" : "#E9ECF1"}
                      />
                    );
                  })}
                </Bar>
                
                <Tooltip
                  cursor={false}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      // Find the actual data values (not bgHeight)
                      const invoiceData = payload.find(p => p.dataKey === 'invoiceCount');
                      const spendData = payload.find(p => p.dataKey === 'totalSpend');
                      
                      return (
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-5 min-w-[200px]">
                          <div className="text-gray-900 font-semibold text-base mb-3">
                            {label} 2025
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600 text-sm">Invoice count:</span>
                              <span className="text-[#314CFF] font-semibold text-base ml-4">
                                {invoiceData?.value || 0}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600 text-sm">Total Spend:</span>
                              <span className="text-[#314CFF] font-semibold text-base ml-4">
                                {formatCurrency(Number(spendData?.value || 0))}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                
                <Legend
                  verticalAlign="bottom"
                  height={50}
                  content={({ payload }) => (
                    <div className="flex items-center justify-center gap-6 mt-6">
                      {payload?.map((entry, index) => (
                        <div key={`legend-${index}`} className="flex items-center gap-2">
                          <div className="flex items-center">
                            <svg width="24" height="3" viewBox="0 0 24 3">
                              <line
                                x1="0"
                                y1="1.5"
                                x2="24"
                                y2="1.5"
                                stroke={entry.color}
                                strokeWidth="3"
                              />
                              <circle cx="12" cy="1.5" r="4" fill={entry.color} />
                            </svg>
                          </div>
                          <span className="text-sm text-gray-700" style={{ color: entry.color }}>
                            {entry.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                />

                <Line
                  type="monotone"
                  dataKey="invoiceCount"
                  stroke="#1B1464"
                  strokeWidth={3}
                  name="Invoice Count"
                  dot={(props: any) => {
                    const isActive = activePoint === props.payload.month;
                    return (
                      <circle
                        cx={props.cx}
                        cy={props.cy}
                        r={isActive ? 5 : 4}
                        fill="white"
                        stroke="#1B1464"
                        strokeWidth={isActive ? 3 : 2.5}
                      />
                    );
                  }}
                  activeDot={false}
                />
                
                <Line
                  type="monotone"
                  dataKey="totalSpend"
                  stroke="#9CA3AF"
                  strokeWidth={3}
                  name="Total Spend (€)"
                  dot={(props: any) => {
                    const isActive = activePoint === props.payload.month;
                    return (
                      <circle
                        cx={props.cx}
                        cy={props.cy}
                        r={isActive ? 5 : 4}
                        fill="white"
                        stroke="#9CA3AF"
                        strokeWidth={isActive ? 3 : 2.5}
                      />
                    );
                  }}
                  activeDot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Spend by Vendor */}
        <Card className="border border-gray-200 shadow-sm rounded-lg bg-white">
          <CardHeader className="border-b border-gray-100 pb-3 pt-4 px-5">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold text-gray-900">
                  Spend by Vendor (Top 10)
                </CardTitle>
                <CardDescription className="text-xs text-gray-500 mt-0.5">
                  Vendor spend with cumulative percentage distribution
                </CardDescription>
              </div>
              <ExportButton type="vendors" label="Export Vendors" />
            </div>
          </CardHeader>
          <CardContent className="px-5 py-4">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={vendors} layout="vertical" margin={{ left: 0, right: 10 }}>
                <CartesianGrid strokeDasharray="0" stroke="transparent" horizontal={false} />
                <XAxis
                  type="number"
                  stroke="#9CA3AF"
                  axisLine={false}
                  tickLine={false}
                  style={{ fontSize: "11px" }}
                />
                <YAxis
                  dataKey="vendorName"
                  type="category"
                  width={180}
                  stroke="#6b7280"
                  tick={{ fontSize: 11 }}
                  interval={0}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                  itemStyle={{
                    color: "#314CFF",
                  }}
                  labelStyle={{
                    color: "#000000",
                    fontWeight: "600",
                  }}
                  formatter={(value: number) => formatCurrency(value)}
                  cursor={false}
                />
                <Bar
                  dataKey="totalSpend"
                  radius={[8, 8, 8, 8]}
                  onMouseEnter={(data) => setActiveBar(data.vendorName)}
                  onMouseLeave={() => setActiveBar(null)}
                  background={{ fill: "#E9ECF1", radius: [8, 8, 8, 8] } as any}
                >
                  {vendors.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        activeBar === entry.vendorName || activeBar === null ? "#1B1464" : "#BDBCD6"
                      }
                      opacity={activeBar === entry.vendorName || activeBar === null ? 1 : 0.4}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2: Spend by Category, Cash Outflow, and Invoices side-by-side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:items-start">
        {/* Spend by Category */}
        <Card className="border border-gray-200 shadow-sm rounded-lg bg-white lg:sticky lg:top-4 self-start">
          <CardHeader className="border-b border-gray-100 pb-3 pt-4 px-5">
            <CardTitle className="text-base font-semibold text-gray-900">
              Spend by Category
            </CardTitle>
            <CardDescription className="text-xs text-gray-500 mt-0.5">
              Distribution of spending across different categories
            </CardDescription>
          </CardHeader>
          <CardContent className="px-5 py-4">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={categories}
                  dataKey="totalSpend"
                  nameKey="category"
                  cx="50%"
                  cy="45%"
                  outerRadius={85}
                  innerRadius={50}
                  label={false}
                  paddingAngle={2}
                >
                  {categories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                  itemStyle={{
                    color: "#314CFF",
                  }}
                  labelStyle={{
                    color: "#000000",
                    fontWeight: "600",
                  }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Legend
                  layout="horizontal"
                  align="center"
                  verticalAlign="bottom"
                  wrapperStyle={{ paddingTop: "20px", fontSize: "12px" }}
                  iconType="circle"
                  iconSize={8}
                  formatter={(value, entry: any) => {
                    const item = categories.find(c => c.category === value);
                    return `${value} : ${formatCurrency(item?.totalSpend || 0)}`;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Cash Outflow Forecast */}
        <Card className="border border-gray-200 shadow-sm rounded-lg bg-white lg:sticky lg:top-4 self-start">
          <CardHeader className="border-b border-gray-100 pb-3 pt-4 px-5">
            <CardTitle className="text-base font-semibold text-gray-900">
              Cash Outflow Forecast
            </CardTitle>
            <CardDescription className="text-xs text-gray-500 mt-0.5">
              Expected payment obligations grouped by due date
            </CardDescription>
          </CardHeader>
          <CardContent className="px-5 py-4">
            {forecast.length > 0 && forecast.some(f => f.totalAmount > 0) ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={forecast} margin={{ top: 10, right: 20, left: -10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="0" stroke="transparent" vertical={false} horizontal={false} />
                  <XAxis
                    dataKey="period"
                    stroke="#9CA3AF"
                    axisLine={false}
                    tickLine={false}
                    style={{ fontSize: "12px" }}
                    angle={0}
                    textAnchor="middle"
                    dy={10}
                  />
                  <YAxis 
                    stroke="#9CA3AF" 
                    axisLine={false}
                    tickLine={false}
                    style={{ fontSize: "12px" }}
                    tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                    itemStyle={{
                      color: "#314CFF",
                    }}
                    labelStyle={{
                      color: "#000000",
                      fontWeight: "600",
                    }}
                    formatter={(value: number) => formatCurrency(value)}
                    cursor={{ fill: 'transparent' }}
                  />
                  <Bar
                    dataKey="totalAmount"
                    fill="#1B1464"
                    radius={[8, 8, 8, 8]}
                    barSize={50}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-[280px] text-center px-4">
                <div className="text-gray-400 mb-2">
                  <svg className="w-16 h-16 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-600 mb-1">No Upcoming Payment Obligations</p>
                <p className="text-xs text-gray-500">All invoices in the dataset have past due dates</p>
                <div className="mt-6 flex items-center justify-around w-full max-w-md text-xs text-gray-400">
                  <span>0-7 days</span>
                  <span>8-30 days</span>
                  <span>31-60 days</span>
                  <span>60+ days</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Invoices Table */}
        <Card className="border border-gray-200 shadow-sm rounded-lg bg-white">
          <CardHeader className="border-b border-gray-100 pb-3 pt-4 px-5">
            <div className="flex items-center justify-between mb-2">
              <div>
                <CardTitle className="text-base font-semibold text-gray-900">
                  Invoices by Vendor
                </CardTitle>
                <CardDescription className="text-xs text-gray-500 mt-0.5">
                  Top vendors by invoice count and net value
                </CardDescription>
              </div>
              <ExportButton type="invoices" label="Export CSV" />
            </div>
            <div className="mt-3">
              <Input
                placeholder="Search by vendor name or invoice number..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="max-w-md text-sm h-9"
              />
            </div>
          </CardHeader>
          <CardContent className="px-5 py-4">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-2.5 px-3 font-medium text-gray-600 text-xs">
                      Vendor
                    </th>
                    <th className="text-left py-2.5 px-3 font-medium text-gray-600 text-xs">
                      Invoice Number
                    </th>
                    <th className="text-center py-2.5 px-3 font-medium text-gray-600 text-xs">
                      Date
                    </th>
                    <th className="text-center py-2.5 px-3 font-medium text-gray-600 text-xs">
                      Status
                    </th>
                    <th className="text-right py-2.5 px-3 font-medium text-gray-600 text-xs">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => (
                    <tr
                      key={invoice.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-2.5 px-3 text-sm text-gray-900 font-medium">
                        {invoice.vendorName}
                      </td>
                      <td className="py-2.5 px-3 text-sm text-gray-600">{invoice.invoiceNumber}</td>
                      <td className="py-2.5 px-3 text-sm text-gray-600 text-center">
                        {formatDate(invoice.invoiceDate)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            invoice.status === "COMPLETED"
                              ? "bg-green-100 text-green-800"
                              : invoice.status === "PENDING"
                                ? "bg-yellow-100 text-yellow-800"
                                : invoice.status === "PROCESSING"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {invoice.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-sm font-semibold text-gray-900 text-right">
                        <span className="inline-block bg-gray-100 px-3 py-1.5 rounded-lg text-gray-900 font-semibold">
                          {formatCurrency(invoice.amount)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
