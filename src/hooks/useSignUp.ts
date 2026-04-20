import { useState } from "react";
import { supabase } from "@/lib/supabase";
import type { SignUpWithPasswordCredentials } from "@supabase/supabase-js";

export function useSignUp() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const signUp = async (credentials: SignUpWithPasswordCredentials) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const { error: signUpError, data } = await supabase.auth.signUp(credentials);

      if (signUpError) {
        setError(signUpError.message);
        return { error: signUpError, data: null };
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
    signUp,
    isSubmitting,
    error,
    success,
    setError,
  };
}
