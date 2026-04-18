import { useState } from "react";

import type { AuthFormErrors } from "@/services/auth/auth-validation";
import { ApiError } from "@/services/http-client";

interface UseAuthSubmitStateResult {
  errors: AuthFormErrors;
  isSubmitting: boolean;
  setErrors: (errors: AuthFormErrors) => void;
  runSubmit: (action: () => Promise<void>, fallbackMessage: string) => Promise<boolean>;
}

const getSubmitErrorMessage = (error: unknown, fallbackMessage: string) => {
  if (error instanceof ApiError) {
    return error.message;
  }

  return fallbackMessage;
};

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
      setErrors({ form: getSubmitErrorMessage(error, fallbackMessage) });
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
