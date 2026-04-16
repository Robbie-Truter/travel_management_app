import { useState } from "react";
import { supabase } from "@/lib/supabase";

export function useUpdatePassword() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const updatePassword = async (newPassword: string) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });

    setIsSubmitting(false);

    if (updateError) {
      setError(updateError.message);
      return false;
    } else {
      setSuccess(true);
      return true;
    }
  };

  return {
    updatePassword,
    isSubmitting,
    success,
    error,
    setError,
  };
}
