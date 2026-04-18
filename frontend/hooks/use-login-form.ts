import { FormEvent, useState } from "react";
import { useRouter } from "next/router";

import { useAuth } from "@/hooks/use-auth";
import { useAuthSubmitState } from "@/hooks/use-auth-submit-state";
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
  const { errors, isSubmitting, setErrors, runSubmit } = useAuthSubmitState();

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

    await runSubmit(async () => {
      const response = await authService.login(payload);

      setSession(response);
      await router.push("/app");
    }, "Не удалось войти. Попробуйте еще раз.");
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
