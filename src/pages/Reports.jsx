import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { fetchProductStats, getCurrentUser } from "../lib/api";
import AdminHeader from "../components/AdminHeader";

const ROWS = [
  { key: "pageViews", label: "Page Views" },
  { key: "productViews", label: "Product Views" },
  { key: "addToCart", label: "Add to Cart" },
  { key: "checkouts", label: "Checkouts" },
];

function formatNum(n) { return n.toLocaleString(); }

function csvEscape(val) {
  const s = String(val);
  return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
}

function downloadCSV(filename, rows) {
  const csv = rows.map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

export default function Reports() {
  const [currentData, setCurrentData] = useState({});
  const [prevData, setPrevData] = useState({});
  const [productStats, setProductStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  const [userEmail, setUserEmail] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    getCurrentUser()
      .then(user => { if (user?.email) setUserEmail(user.email); })
      .catch(() => navigate("/admin/login"));
  }, []);

  useEffect(() => { fetchAll(days); }, [days]);

  const fetchAll = async (d) => {
    setLoading(true);
    try {
      const [curr, prev] = await Promise.all([
        fetchProductStats(d),
        fetchProductStats(d * 2).then(r => {
          const currDays = Object.keys(r.daily || {}).sort();
          const cutoff = currDays.length > 0 ? new Date(Date.now() - d * 86400000).toISOString().split('T')[0] : '';
          const prevDaily = {};
          Object.entries(r.daily || {}).forEach(([date, vals]) => {
            if (cutoff && date < cutoff) prevDaily[date] = vals;
          });
          return { daily: prevDaily, productStats: {} };
        }),
      ]);
      setCurrentData(curr?.daily || {});
      setPrevData(prev?.daily || {});
      setProductStats(curr?.productStats || {});
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const totals = useMemo(() => {
    const sum = (data) => {
      const days = Object.values(data);
      return {
        pageViews: days.reduce((s, d) => s + (d.pageViews || 0), 0),
        productViews: days.reduce((s, d) => s + (d.productViews || 0), 0),
        addToCart: days.reduce((s, d) => s + (d.addToCart || 0), 0),
        checkouts: days.reduce((s, d) => s + (d.checkouts || 0), 0),
      };
    };
    return { current: sum(currentData), previous: sum(prevData) };
  }, [currentData, prevData]);

  const pctChange = (curr, prev) => {
    if (prev === 0) return curr > 0 ? 100 : 0;
    return ((curr - prev) / prev * 100);
  };

  const topProducts = useMemo(() => {
    return Object.entries(productStats)
      .map(([id, s]) => ({ id, ...s }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 20);
  }, [productStats]);

  const handleExport = () => {
    const rows = [
      ['Metric', 'Current Period', 'Previous Period', 'Change %'],
      ...ROWS.map(r => [r.label, totals.current[r.key], totals.previous[r.key], pctChange(totals.current[r.key], totals.previous[r.key]).toFixed(1) + '%']),
      [],
      ['Top Products'],
      ['Product', 'Views', 'Cart Adds', 'Rate %'],
      ...topProducts.map(p => [p.productName || p.id.slice(-6), p.views, p.cartAdds, p.views > 0 ? ((p.cartAdds / p.views) * 100).toFixed(1) : '0.0']),
    ];
    downloadCSV(`honeybee-report-${days}d-${new Date().toISOString().split('T')[0]}.csv`, rows);
  };

  const handleExportDaily = () => {
    const sortedDays = Object.keys(currentData).sort();
    const rows = [
      ['Date', 'Page Views', 'Product Views', 'Add to Cart', 'Checkouts', 'Total'],
      ...sortedDays.map(d => {
        const day = currentData[d] || {};
        const total = (day.pageViews || 0) + (day.productViews || 0) + (day.addToCart || 0) + (day.checkouts || 0);
        return [d, day.pageViews || 0, day.productViews || 0, day.addToCart || 0, day.checkouts || 0, total];
      }),
    ];
    downloadCSV(`honeybee-daily-${days}d-${new Date().toISOString().split('T')[0]}.csv`, rows);
  };

  return (
    <div className="min-h-screen bg-brand-cream">
      <AdminHeader userEmail={userEmail} />

      {/* Controls */}
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-3">
        <div className="flex bg-white border border-brand-border rounded-sm overflow-hidden">
          {[7, 30, 90].map(d => (
            <button key={d} onClick={() => setDays(d)}
              className={`px-3 py-1.5 text-xs font-semibold tracking-wider transition-colors ${days === d ? "bg-brand-burgundy text-brand-cream" : "text-brand-wine-dark/60 hover:text-brand-burgundy"}`}>
              {d}D
            </button>
          ))}
        </div>
        <button onClick={handleExport} disabled={loading}
          className="px-4 py-1.5 bg-brand-burgundy text-brand-cream text-xs font-semibold tracking-wider uppercase hover:bg-brand-wine-dark transition-colors disabled:opacity-50 shadow-sm rounded-sm">
          Export
        </button>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-6 h-6 border-2 border-brand-border border-t-brand-burgundy rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Comparison Table */}
            <div className="bg-white/80 border border-brand-border rounded-lg shadow-sm overflow-hidden mb-8">
              <div className="p-5 border-b border-brand-border bg-brand-blush/20 flex justify-between items-center">
                <h3 className="text-sm font-bold text-brand-burgundy uppercase tracking-wider">Performance Overview</h3>
                <span className="text-xs text-brand-wine-dark/60 font-medium">Current vs Previous {days} days</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-brand-border bg-brand-blush/10">
                      <th className="text-left p-4 text-xs font-bold tracking-wider uppercase text-brand-wine-dark/70">Metric</th>
                      <th className="text-right p-4 text-xs font-bold tracking-wider uppercase text-brand-wine-dark/70">Current</th>
                      <th className="text-right p-4 text-xs font-bold tracking-wider uppercase text-brand-wine-dark/70">Previous</th>
                      <th className="text-right p-4 text-xs font-bold tracking-wider uppercase text-brand-wine-dark/70">Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ROWS.map(r => {
                      const curr = totals.current[r.key];
                      const prev = totals.previous[r.key];
                      const change = pctChange(curr, prev);
                      return (
                        <tr key={r.key} className="border-b border-brand-border/40 hover:bg-brand-blush/20 transition-colors">
                          <td className="p-4 font-semibold text-brand-wine-dark">{r.label}</td>
                          <td className="p-4 text-right font-medium text-brand-burgundy">{formatNum(curr)}</td>
                          <td className="p-4 text-right text-brand-wine-dark/50">{formatNum(prev)}</td>
                          <td className="p-4 text-right">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${change > 0 ? 'bg-green-100 text-green-700' : change < 0 ? 'bg-red-100 text-red-700' : 'bg-brand-blush text-brand-wine-dark/60'}`}>
                              {change > 0 ? '+' : ''}{change.toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top Products */}
            <div className="bg-white/80 border border-brand-border rounded-lg shadow-sm overflow-hidden mb-8">
              <div className="p-5 border-b border-brand-border bg-brand-blush/20">
                <h3 className="text-sm font-bold text-brand-burgundy uppercase tracking-wider">Top Products</h3>
              </div>
              {topProducts.length === 0 ? (
                <div className="p-8 text-center text-brand-wine-dark/40 text-sm">No data</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-brand-border bg-brand-blush/10">
                        <th className="text-left p-4 text-xs font-bold tracking-wider uppercase text-brand-wine-dark/70">#</th>
                        <th className="text-left p-4 text-xs font-bold tracking-wider uppercase text-brand-wine-dark/70">Product</th>
                        <th className="text-right p-4 text-xs font-bold tracking-wider uppercase text-brand-wine-dark/70">Views</th>
                        <th className="text-right p-4 text-xs font-bold tracking-wider uppercase text-brand-wine-dark/70">Cart</th>
                        <th className="text-right p-4 text-xs font-bold tracking-wider uppercase text-brand-wine-dark/70">Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topProducts.map((p, i) => (
                        <tr key={p.id} className="border-b border-brand-border/40 hover:bg-brand-blush/20 transition-colors">
                          <td className="p-4 text-brand-gold font-bold">{i + 1}</td>
                          <td className="p-4 font-semibold truncate max-w-[200px] text-brand-wine-dark">{p.productName || `Product ${p.id.slice(-6)}`}</td>
                          <td className="p-4 text-right font-medium text-brand-burgundy">{formatNum(p.views)}</td>
                          <td className="p-4 text-right font-medium text-brand-wine-dark">{formatNum(p.cartAdds)}</td>
                          <td className="p-4 text-right font-semibold text-brand-gold">{p.views > 0 ? ((p.cartAdds / p.views) * 100).toFixed(1) : '0.0'}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Daily Breakdown */}
            <div className="bg-white/80 border border-brand-border rounded-lg shadow-sm overflow-hidden">
              <div className="p-5 border-b border-brand-border bg-brand-blush/20 flex justify-between items-center">
                <h3 className="text-sm font-bold text-brand-burgundy uppercase tracking-wider">Daily Breakdown</h3>
                <button onClick={handleExportDaily} className="text-xs text-brand-gold hover:text-brand-burgundy transition-colors font-semibold">Export CSV</button>
              </div>
              <div className="overflow-x-auto max-h-96 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-brand-cream border-b border-brand-border">
                    <tr className="border-b border-brand-border">
                      <th className="text-left p-3 text-xs font-bold tracking-wider uppercase text-brand-wine-dark/70">Date</th>
                      <th className="text-right p-3 text-xs font-bold tracking-wider uppercase text-brand-wine-dark/70">Views</th>
                      <th className="text-right p-3 text-xs font-bold tracking-wider uppercase text-brand-wine-dark/70">Prod</th>
                      <th className="text-right p-3 text-xs font-bold tracking-wider uppercase text-brand-wine-dark/70">Cart</th>
                      <th className="text-right p-3 text-xs font-bold tracking-wider uppercase text-brand-wine-dark/70">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(currentData).sort(([a], [b]) => a.localeCompare(b)).map(([date, day]) => {
                      const total = (day.pageViews || 0) + (day.productViews || 0) + (day.addToCart || 0) + (day.checkouts || 0);
                      return (
                        <tr key={date} className="border-b border-brand-border/40 hover:bg-brand-blush/20 transition-colors">
                          <td className="p-3 text-brand-wine-dark/70 font-medium">{new Date(date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                          <td className="p-3 text-right text-brand-wine-dark">{day.pageViews || 0}</td>
                          <td className="p-3 text-right text-brand-wine-dark">{day.productViews || 0}</td>
                          <td className="p-3 text-right text-brand-wine-dark">{day.addToCart || 0}</td>
                          <td className="p-3 text-right font-bold text-brand-burgundy">{total}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
