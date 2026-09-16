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
    <div className="min-h-screen flex items-center justify-center bg-brand-cream px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <img src="/logo.png" alt="Honeybee Lane" className="h-12 w-auto mx-auto mb-4" />
          <h1 className="text-xl font-bold tracking-wider uppercase mb-2">Admin</h1>
          <p className="text-sm text-gray-400">Honeybee Lane</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 text-sm mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium tracking-wider uppercase text-gray-400 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-brand-gold transition-colors"
              placeholder="admin@honeybeelane.com"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium tracking-wider uppercase text-gray-400 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-brand-gold transition-colors"
              placeholder="Enter password"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-black text-brand-cream py-3 text-sm font-semibold tracking-wider uppercase hover:bg-brand-gold transition-colors disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <button
          onClick={() => navigate("/")}
          className="w-full mt-6 text-gray-400 text-xs hover:text-brand-dark transition-colors text-center"
        >
          Back to Store
        </button>
      </div>
    </div>
  );
}
