import { FormEvent, useState } from "react";
import { useRouter } from "next/router";

import { useAuth } from "@/hooks/use-auth";
import type { AuthFormErrors } from "@/services/auth/auth-validation";
import { validateRegisterPayload } from "@/services/auth/auth-validation";
import { ApiError } from "@/services/http-client";
import { authService } from "@/services/auth";

interface UseRegisterFormResult {
  login: string;
  password: string;
  passwordConfirm: string;
  errors: AuthFormErrors;
  isSubmitting: boolean;
  setLogin: (value: string) => void;
  setPassword: (value: string) => void;
  setPasswordConfirm: (value: string) => void;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
}

export const useRegisterForm = (): UseRegisterFormResult => {
  const router = useRouter();
  const { setAuthFlowNotice } = useAuth();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [errors, setErrors] = useState<AuthFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload = {
      login: login.trim(),
      password,
      passwordConfirm
    };
    const nextErrors = validateRegisterPayload(payload);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      await authService.register(payload);
      setAuthFlowNotice({
        tone: "success",
        message: "Регистрация прошла успешно"
      });
      await router.push("/auth/login");
    } catch (error) {
      if (error instanceof ApiError) {
        setErrors({ form: error.message });
      } else {
        setErrors({ form: "Не удалось завершить регистрацию. Попробуйте еще раз." });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    login,
    password,
    passwordConfirm,
    errors,
    isSubmitting,
    setLogin,
    setPassword,
    setPasswordConfirm,
    handleSubmit
  };
};
