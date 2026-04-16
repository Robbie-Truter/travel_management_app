import { useState } from "react";
import { Link } from "react-router-dom";
import { Plane, Mail, ArrowLeft, Loader2 } from "lucide-react";
import { useResetPassword } from "@/hooks/useResetPassword";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");

  const { resetPassword, isSubmitting, success, error } = useResetPassword();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await resetPassword(email);
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link
            to="/auth"
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4 hover:bg-primary/20 transition-colors"
          >
            <Plane className="text-primary" size={32} />
          </Link>
          <h1 className="text-3xl font-bold text-text-primary">Reset Password</h1>
          <p className="text-text-secondary mt-1">
            We'll send you a link to get back into your account
          </p>
        </div>

        {/* Card */}
        <div className="bg-surface-2 rounded-2xl border border-border p-8 shadow-sm">
          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                  />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
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
                    <Loader2 size={16} className="animate-spin" /> Sending Link...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </button>
            </form>
          ) : (
            <div className="text-center py-4">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail size={24} />
              </div>
              <h3 className="text-lg font-bold text-text-primary mb-2">Check your email</h3>
              <p className="text-sm text-text-secondary mb-6">
                We've sent a password reset link to{" "}
                <span className="font-semibold text-text-primary">{email}</span>.
              </p>
              <Link
                to="/auth"
                className="inline-flex items-center gap-2 text-primary font-semibold text-sm hover:underline"
              >
                <ArrowLeft size={14} />
                Back to Login
              </Link>
            </div>
          )}
        </div>

        {!success && (
          <div className="text-center mt-6">
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors text-sm font-medium"
            >
              <ArrowLeft size={14} />
              Back to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
