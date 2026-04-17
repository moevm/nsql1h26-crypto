import { FormEvent, useState } from "react";
import { useRouter } from "next/router";

import { useAuth } from "@/hooks/use-auth";
import { ApiError } from "@/services/http-client";
import { authService } from "@/services/auth";
import type { AuthFormErrors } from "@/services/auth/auth-validation";
import { validateLoginPayload } from "@/services/auth/auth-validation";

interface UseLoginFormResult {
  login: string;
  password: string;
  errors: AuthFormErrors;
  isSubmitting: boolean;
  setLogin: (value: string) => void;
  setPassword: (value: string) => void;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
}

export const useLoginForm = (): UseLoginFormResult => {
  const router = useRouter();
  const { setSession } = useAuth();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<AuthFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload = {
      login: login.trim(),
      password
    };
    const nextErrors = validateLoginPayload(payload);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const response = await authService.login(payload);

      setSession(response);
      await router.push("/app");
    } catch (error) {
      if (error instanceof ApiError) {
        setErrors({ form: error.message });
      } else {
        setErrors({ form: "Не удалось войти. Попробуйте еще раз." });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    login,
    password,
    errors,
    isSubmitting,
    setLogin,
    setPassword,
    handleSubmit
  };
};
