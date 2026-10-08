import { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getCurrentUser } from "../lib/api";

/**
 * Gate for /admin/* routes.
 *
 * Previously these routes were completely unguarded: each admin page fetched the
 * current user itself and only checked `u._id`, never `u.role`. This wrapper
 * centralises the check, verifies the role, and renders a spinner while the
 * session is being resolved instead of flashing protected content.
 *
 * The API is the real security boundary (every mutation now calls requireAdmin),
 * but guarding the client avoids rendering the full admin UI to non-admins and
 * removes a class of client-side mistakes.
 */
export default function RequireAdmin({ children }) {
  const [state, setState] = useState({ status: "loading", user: null });
  const location = useLocation();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const user = await getCurrentUser();
        if (cancelled) return;
        if (user?.error || !user?._id) {
          setState({ status: "anon", user: null });
          return;
        }
        if (user.role !== "admin") {
          setState({ status: "forbidden", user });
          return;
        }
        setState({ status: "ok", user });
      } catch {
        if (!cancelled) setState({ status: "anon", user: null });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (state.status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-brand-border border-t-brand-burgundy rounded-full animate-spin" />
      </div>
    );
  }

  if (state.status === "anon") {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  if (state.status === "forbidden") {
    return (
      <div className="max-w-2xl mx-auto px-6 py-32 text-center">
        <h1 className="text-3xl font-display text-brand-burgundy mb-4">Access denied</h1>
        <p className="text-brand-wine-dark/70 mb-8">
          Your account doesn&apos;t have admin access. If you believe this is a mistake, contact the site owner.
        </p>
        <a
          href="/"
          className="inline-block px-8 py-3 bg-brand-burgundy text-brand-cream text-sm font-semibold tracking-wider uppercase hover:bg-brand-wine-dark transition-colors"
        >
          Back to Store
        </a>
      </div>
    );
  }

  return children;
}
