import { useState } from "react";

import type { AuthFormErrors } from "@/services/auth/auth-validation";
import { ApiError } from "@/services/http-client";

interface UseAuthSubmitStateResult {
  errors: AuthFormErrors;
  isSubmitting: boolean;
  setErrors: (errors: AuthFormErrors) => void;
  runSubmit: (action: () => Promise<void>, fallbackMessage: string) => Promise<boolean>;
}

export const useAuthSubmitState = (): UseAuthSubmitStateResult => {
  const [errors, setErrors] = useState<AuthFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const runSubmit = async (action: () => Promise<void>, fallbackMessage: string) => {
    setErrors({});
    setIsSubmitting(true);

    try {
      await action();
      return true;
    } catch (error) {
      setErrors({
        form: error instanceof ApiError ? error.message : fallbackMessage
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    errors,
    isSubmitting,
    setErrors,
    runSubmit
  };
};
