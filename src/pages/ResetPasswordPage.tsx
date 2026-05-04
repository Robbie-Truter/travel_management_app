import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plane, Lock, Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";
import { useUpdatePassword } from "@/hooks/useUpdatePassword";
import { useAuth } from "@/hooks/useAuth";

export function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { updatePassword, isSubmitting, success, error, setError } = useUpdatePassword();
  const navigate = useNavigate();
  const { isRecovery, loading } = useAuth();

  useEffect(() => {
    // Ensure users only access this page via the email recovery link
    // Supabase will set our isRecovery context if PASSWORD_RECOVERY event fires
    if (!loading && !isRecovery) {
      navigate("/auth", { replace: true });
    }
  }, [loading, isRecovery, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-surface">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    await updatePassword(password);
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <Plane className="text-primary" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-text-primary">Update Password</h1>
          <p className="text-text-secondary mt-1">Enter a new secure password for your account</p>
        </div>

        {/* Card */}
        <div className="bg-surface-2 rounded-2xl border border-border p-8 shadow-sm">
          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2.5 bg-surface border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-4 py-2.5 bg-surface border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                  />
                </div>
              </div>

              {error && (
                <div className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Updating...
                  </>
                ) : (
                  "Update Password"
                )}
              </button>
            </form>
          ) : (
            <div className="text-center py-4">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={24} />
              </div>
              <h3 className="text-lg font-bold text-text-primary mb-2">Password Updated</h3>
              <p className="text-sm text-text-secondary mb-6">
                Your password has been successfully changed. You can now use your new password to
                log in.
              </p>
              <button
                onClick={() => navigate("/auth")}
                className="w-full py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all"
              >
                Return to Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
