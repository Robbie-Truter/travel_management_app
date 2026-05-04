import { useState } from "react";
import { supabase } from "@/lib/supabase";
import type { SignInWithPasswordCredentials } from "@supabase/supabase-js";

export function useLogin() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const login = async (credentials: SignInWithPasswordCredentials) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const { error: loginError, data } = await supabase.auth.signInWithPassword(credentials);

      if (loginError) {
        setError(loginError.message);
        return { error: loginError, data: null };
      }

      setSuccess(true);
      return { error: null, data };
    } catch (err) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(message);
      return { error: err, data: null };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    login,
    isSubmitting,
    error,
    success,
    setError,
  };
}
