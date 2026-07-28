import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

import { Button } from "../../components/ui/Button";
import { TextField } from "../../components/ui/Field";
import { supabase } from "../../lib/supabase";
import { useSellerSession } from "./useSellerSession";

export function SellerLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { session, isSeller, loading } = useSellerSession();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const from = (location.state as { from?: string } | null)?.from ?? "/seller";

  if (!loading && session && isSeller) {
    return <Navigate to={from} replace />;
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    setSubmitting(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    navigate(from, { replace: true });
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-forest px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-center gap-2 text-white">
          <svg viewBox="0 0 24 24" className="size-7" aria-hidden="true" fill="currentColor">
            <path d="M12 2.2c-2.1 3-4.4 4.6-6.5 6.6A8.6 8.6 0 0 0 12 22a8.6 8.6 0 0 0 6.5-13.2C16.4 6.8 14.1 5.2 12 2.2Zm0 4.4c1.2 1.6 2.5 2.7 3.7 3.9A5.6 5.6 0 0 1 12 19a5.6 5.6 0 0 1-3.7-8.5c1.2-1.2 2.5-2.3 3.7-3.9Z" />
          </svg>
          <span className="text-[19px] font-extrabold tracking-tight">DIY Shop</span>
        </div>

        <form onSubmit={submit} className="rounded-card bg-surface p-6 shadow-modal">
          <h1 className="text-[20px] font-bold text-text">Seller sign in</h1>
          <p className="mt-1 text-[14px] text-text-muted">Manage your products and orders.</p>

          <div className="mt-6 space-y-4">
            <TextField
              label="Email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <TextField
              label="Password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          {error && (
            <p role="alert" className="mt-4 rounded-lg bg-danger-soft px-3 py-2 text-[13px] text-danger">
              {error}
            </p>
          )}

          <Button type="submit" fullWidth size="lg" className="mt-6" disabled={submitting}>
            {submitting ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </div>
    </div>
  );
}
