import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../lib/api";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await login(email, password);
      if (data.error) throw new Error(data.error);
      if (data.user) navigate("/admin/dashboard");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-cream px-6 py-12">
      <div className="w-full max-w-sm bg-white border border-brand-border p-8 rounded-sm shadow-sm">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="Honeybee Lane" className="h-14 w-auto mx-auto mb-4 object-contain" />
          <h1 className="text-xl font-bold tracking-wider uppercase mb-1 text-brand-burgundy">Admin Portal</h1>
          <p className="text-xs text-brand-black/60 uppercase tracking-widest">Honeybee Lane</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 border border-red-200 px-4 py-3 text-xs mb-6 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold tracking-wider uppercase text-brand-black/70 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-brand-border text-sm focus:outline-none focus:border-brand-gold bg-brand-cream/30 text-brand-black transition-colors"
              placeholder="admin@honeybeelane.com"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold tracking-wider uppercase text-brand-black/70 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-brand-border text-sm focus:outline-none focus:border-brand-gold bg-brand-cream/30 text-brand-black transition-colors"
              placeholder="Enter password"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-burgundy text-white py-3.5 text-xs font-bold tracking-wider uppercase hover:bg-brand-gold transition-colors disabled:opacity-50 shadow-sm"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <button
          onClick={() => navigate("/")}
          className="w-full mt-6 text-brand-black/60 text-xs hover:text-brand-burgundy transition-colors text-center font-medium"
        >
          ← Back to Store
        </button>
      </div>
    </div>
  );
}
