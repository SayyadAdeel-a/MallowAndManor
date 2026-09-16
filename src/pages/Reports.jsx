import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { fetchProductStats } from "../lib/api";
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
  const navigate = useNavigate();

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
    const days = Object.keys(currentData).sort();
    const rows = [
      ['Date', 'Page Views', 'Product Views', 'Add to Cart', 'Checkouts', 'Total'],
      ...days.map(d => {
        const day = currentData[d] || {};
        const total = (day.pageViews || 0) + (day.productViews || 0) + (day.addToCart || 0) + (day.checkouts || 0);
        return [d, day.pageViews || 0, day.productViews || 0, day.addToCart || 0, day.checkouts || 0, total];
      }),
    ];
    downloadCSV(`honeybee-daily-${days}d-${new Date().toISOString().split('T')[0]}.csv`, rows);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader userEmail="" />

      {/* Controls */}
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-3">
        <div className="flex bg-brand-cream border border-gray-200">
          {[7, 30, 90].map(d => (
            <button key={d} onClick={() => setDays(d)}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${days === d ? "bg-brand-black text-brand-cream" : "text-gray-400 hover:text-gray-600"}`}>
              {d}D
            </button>
          ))}
        </div>
        <button onClick={handleExport} disabled={loading}
          className="px-4 py-1.5 bg-brand-black text-brand-cream text-xs font-medium hover:bg-brand-gold transition-colors disabled:opacity-50">
          Export
        </button>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-brand-walnut rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Comparison Table */}
            <div className="bg-brand-cream border border-gray-100 overflow-hidden mb-8">
              <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-sm font-semibold">Performance Overview</h3>
                <span className="text-xs text-gray-400">Current vs Previous {days} days</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left p-4 text-xs font-medium text-gray-400">Metric</th>
                      <th className="text-right p-4 text-xs font-medium text-gray-400">Current</th>
                      <th className="text-right p-4 text-xs font-medium text-gray-400">Previous</th>
                      <th className="text-right p-4 text-xs font-medium text-gray-400">Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ROWS.map(r => {
                      const curr = totals.current[r.key];
                      const prev = totals.previous[r.key];
                      const change = pctChange(curr, prev);
                      return (
                        <tr key={r.key} className="border-b border-gray-50">
                          <td className="p-4 font-medium">{r.label}</td>
                          <td className="p-4 text-right">{formatNum(curr)}</td>
                          <td className="p-4 text-right text-gray-400">{formatNum(prev)}</td>
                          <td className="p-4 text-right">
                            <span className={`text-xs font-medium ${change > 0 ? 'text-green-600' : change < 0 ? 'text-red-500' : 'text-gray-400'}`}>
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
            <div className="bg-brand-cream border border-gray-100 overflow-hidden mb-8">
              <div className="p-5 border-b border-gray-100">
                <h3 className="text-sm font-semibold">Top Products</h3>
              </div>
              {topProducts.length === 0 ? (
                <div className="p-8 text-center text-gray-300 text-sm">No data</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left p-4 text-xs font-medium text-gray-400">#</th>
                        <th className="text-left p-4 text-xs font-medium text-gray-400">Product</th>
                        <th className="text-right p-4 text-xs font-medium text-gray-400">Views</th>
                        <th className="text-right p-4 text-xs font-medium text-gray-400">Cart</th>
                        <th className="text-right p-4 text-xs font-medium text-gray-400">Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topProducts.map((p, i) => (
                        <tr key={p.id} className="border-b border-gray-50">
                          <td className="p-4 text-gray-300">{i + 1}</td>
                          <td className="p-4 font-medium truncate max-w-[200px]">{p.productName || `Product ${p.id.slice(-6)}`}</td>
                          <td className="p-4 text-right">{formatNum(p.views)}</td>
                          <td className="p-4 text-right">{formatNum(p.cartAdds)}</td>
                          <td className="p-4 text-right text-gray-500">{p.views > 0 ? ((p.cartAdds / p.views) * 100).toFixed(1) : '0.0'}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Daily Breakdown */}
            <div className="bg-brand-cream border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-sm font-semibold">Daily Breakdown</h3>
                <button onClick={handleExportDaily} className="text-xs text-gray-400 hover:text-gray-600 transition-colors font-medium">Export CSV</button>
              </div>
              <div className="overflow-x-auto max-h-96 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-brand-cream">
                    <tr className="border-b border-gray-100">
                      <th className="text-left p-3 text-xs font-medium text-gray-400">Date</th>
                      <th className="text-right p-3 text-xs font-medium text-gray-400">Views</th>
                      <th className="text-right p-3 text-xs font-medium text-gray-400">Prod</th>
                      <th className="text-right p-3 text-xs font-medium text-gray-400">Cart</th>
                      <th className="text-right p-3 text-xs font-medium text-gray-400">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(currentData).sort(([a], [b]) => a.localeCompare(b)).map(([date, day]) => {
                      const total = (day.pageViews || 0) + (day.productViews || 0) + (day.addToCart || 0) + (day.checkouts || 0);
                      return (
                        <tr key={date} className="border-b border-gray-50">
                          <td className="p-3 text-gray-500">{new Date(date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                          <td className="p-3 text-right">{day.pageViews || 0}</td>
                          <td className="p-3 text-right">{day.productViews || 0}</td>
                          <td className="p-3 text-right">{day.addToCart || 0}</td>
                          <td className="p-3 text-right font-medium">{total}</td>
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
