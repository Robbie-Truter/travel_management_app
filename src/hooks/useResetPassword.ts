import { useState } from "react";
import { supabase } from "@/lib/supabase";

export function useResetPassword() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetPassword = async (email: string) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "http://localhost:5173/reset-password",
    });

    setIsSubmitting(false);

    if (resetError) {
      setError(resetError.message);
      return false;
    } else {
      setSuccess(true);
      return true;
    }
  };

  return {
    resetPassword,
    isSubmitting,
    success,
    error,
    setError,
  };
}
