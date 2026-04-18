import { FormEvent, useState } from "react";
import { useRouter } from "next/router";

import { useAuthSubmitState } from "@/hooks/use-auth-submit-state";
import { useToast } from "@/hooks/use-toast";
import type { AuthFormErrors } from "@/services/auth/auth-validation";
import { validateRegisterPayload } from "@/services/auth/auth-validation";
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
  const { pushToast } = useToast();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const { errors, isSubmitting, setErrors, runSubmit } = useAuthSubmitState();

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

    await runSubmit(async () => {
      await authService.register(payload);
      pushToast({
        type: "success",
        message: "Регистрация прошла успешно"
      });
      await router.push("/auth/login");
    }, "Не удалось завершить регистрацию");
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
