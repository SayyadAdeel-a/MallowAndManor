import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchProductStats } from "../lib/api";
import AdminHeader from "../components/AdminHeader";

const TIME_RANGES = [
  { label: "7D", days: 7 },
  { label: "30D", days: 30 },
  { label: "90D", days: 90 },
  { label: "All", days: 0 },
];

function formatDate(dateStr) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function LineChart({ data, color, height = 160 }) {
  if (!data || data.length === 0) return <div className="text-gray-300 text-sm py-8 text-center">No data</div>;
  const max = Math.max(...data.map(d => d.count), 1);
  const width = Math.max(data.length * 50, 300);
  const points = data.map((d, i) => {
    const x = i * (width / (data.length - 1 || 1));
    const y = height - (d.count / max) * (height - 30) - 10;
    return `${x},${y}`;
  }).join(" ");
  const areaPoints = points + ` ${width},${height} 0,${height}`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id={`g-${color.slice(1)}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.15" />
          <stop offset="100%" stopColor={color} stopOpacity="0.01" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#g-${color.slice(1)})`} />
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      {data.filter((_, i) => data.length <= 14 || i % Math.ceil(data.length / 7) === 0).map((d, i) => {
        const idx = data.indexOf(d);
        const x = idx * (width / (data.length - 1 || 1));
        return <text key={i} x={x} y={height - 2} textAnchor="middle" className="text-[9px]" fill="#ccc">{formatDate(d.date)}</text>;
      })}
    </svg>
  );
}

function FunnelBar({ label, value, max, color }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="w-24 text-xs text-gray-500 text-right shrink-0">{label}</span>
      <div className="flex-1 bg-gray-100 h-6 overflow-hidden">
        <div className={`h-full ${color} transition-all duration-500 flex items-center justify-end pr-2`}
          style={{ width: `${Math.max(pct, value > 0 ? 4 : 0)}%` }}>
          <span className="text-[10px] text-brand-cream font-medium">{value}</span>
        </div>
      </div>
      <span className="w-10 text-xs text-gray-400 shrink-0">{pct.toFixed(1)}%</span>
    </div>
  );
}

export default function AnalyticsDashboard() {
  const [productStats, setProductStats] = useState({});
  const [dailyData, setDailyData] = useState({});
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState(7);
  const [lastUpdated, setLastUpdated] = useState(null);
  const navigate = useNavigate();

  useEffect(() => { fetchData(timeRange); }, []);

  const fetchData = async (days) => {
    setLoading(true);
    try {
      const statsRes = await fetchProductStats(days);
      setProductStats(statsRes?.productStats || {});
      setDailyData(statsRes?.daily || {});
      setLastUpdated(new Date());
    } catch (err) { console.error("Error:", err); }
    finally { setLoading(false); }
  };

  const stats = useMemo(() => {
    const days = Object.values(dailyData);
    return {
      pageViews: days.reduce((s, d) => s + (d.pageViews || 0), 0),
      productViews: days.reduce((s, d) => s + (d.productViews || 0), 0),
      addToCart: days.reduce((s, d) => s + (d.addToCart || 0), 0),
      checkouts: days.reduce((s, d) => s + (d.checkouts || 0), 0),
    };
  }, [dailyData]);

  const conversionRate = stats.productViews > 0 ? ((stats.addToCart / stats.productViews) * 100).toFixed(1) : "0.0";

  const timeSeries = useMemo(() => {
    const days = Object.keys(dailyData).sort();
    if (days.length === 0) return { pageViews: [], productViews: [], addToCart: [] };
    const startDate = timeRange > 0 ? new Date(Date.now() - timeRange * 86400000).toISOString().split("T")[0] : days[0];
    const allDays = [];
    const current = new Date(startDate);
    while (current <= new Date()) { allDays.push(current.toISOString().split("T")[0]); current.setDate(current.getDate() + 1); }
    const fill = (key) => allDays.map(date => ({ date, count: dailyData[date]?.[key] || 0 }));
    return { pageViews: fill("pageViews"), productViews: fill("productViews"), addToCart: fill("addToCart") };
  }, [dailyData, timeRange]);

  const topProducts = useMemo(() => {
    return Object.entries(productStats).map(([id, s]) => ({ id, ...s })).sort((a, b) => b.views - a.views).slice(0, 10);
  }, [productStats]);

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader userEmail="" />

      {/* Time range selector */}
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex bg-brand-cream border border-gray-200 w-fit">
          {TIME_RANGES.map(r => (
            <button key={r.days} onClick={() => { setTimeRange(r.days); fetchData(r.days); }}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${timeRange === r.days ? "bg-brand-black text-brand-cream" : "text-gray-400 hover:text-gray-600"}`}>
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Page Views", value: stats.pageViews, color: "bg-blue-500" },
            { label: "Product Views", value: stats.productViews, color: "bg-purple-500" },
            { label: "Add to Cart", value: stats.addToCart, color: "bg-green-500" },
            { label: "Checkouts", value: stats.checkouts, color: "bg-amber-500" },
          ].map((s, i) => (
            <div key={i} className="bg-brand-cream border border-gray-100 p-5">
              <div className={`w-2 h-2 rounded-full ${s.color} mb-3`} />
              <p className="text-2xl font-bold">{s.value.toLocaleString()}</p>
              <p className="text-xs text-gray-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Conversion + Funnel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-brand-cream border border-gray-100 p-6">
            <p className="text-xs text-gray-400 tracking-wider uppercase mb-2">Conversion Rate</p>
            <p className="text-3xl font-bold">{conversionRate}%</p>
            <p className="text-xs text-gray-300 mt-2">Add to cart / Product views</p>
          </div>
          <div className="bg-brand-cream border border-gray-100 p-6 lg:col-span-2">
            <p className="text-xs text-gray-400 tracking-wider uppercase mb-4">Funnel</p>
            <div className="space-y-2">
              <FunnelBar label="Page Views" value={stats.pageViews} max={stats.pageViews} color="bg-blue-500" />
              <FunnelBar label="Product Views" value={stats.productViews} max={stats.pageViews} color="bg-purple-500" />
              <FunnelBar label="Add to Cart" value={stats.addToCart} max={stats.pageViews} color="bg-green-500" />
              <FunnelBar label="Checkouts" value={stats.checkouts} max={stats.pageViews} color="bg-amber-500" />
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-brand-cream border border-gray-100 p-6">
            <p className="text-xs text-gray-400 tracking-wider uppercase mb-4">Page Views</p>
            <LineChart data={timeSeries.pageViews} color="#C08AA5" />
          </div>
          <div className="bg-brand-cream border border-gray-100 p-6">
            <p className="text-xs text-gray-400 tracking-wider uppercase mb-4">Engagement</p>
            <LineChart data={timeSeries.productViews} color="#D9BEA6" />
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-brand-cream border border-gray-100 p-6">
          <p className="text-xs text-gray-400 tracking-wider uppercase mb-4">Top Products</p>
          {topProducts.length === 0 ? (
            <p className="text-gray-300 text-sm py-4 text-center">No data yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left p-3 text-xs font-medium text-gray-400">#</th>
                    <th className="text-left p-3 text-xs font-medium text-gray-400">Product</th>
                    <th className="text-right p-3 text-xs font-medium text-gray-400">Views</th>
                    <th className="text-right p-3 text-xs font-medium text-gray-400">Cart</th>
                    <th className="text-right p-3 text-xs font-medium text-gray-400">Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((p, i) => {
                    const rate = p.views > 0 ? ((p.cartAdds / p.views) * 100).toFixed(1) : "0.0";
                    return (
                      <tr key={p.id} className="border-b border-gray-50">
                        <td className="p-3 text-gray-300">{i + 1}</td>
                        <td className="p-3 font-medium truncate max-w-[200px]">{p.productName || `Product ${p.id.slice(-6)}`}</td>
                        <td className="p-3 text-right">{p.views}</td>
                        <td className="p-3 text-right">{p.cartAdds}</td>
                        <td className="p-3 text-right text-gray-500">{rate}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
