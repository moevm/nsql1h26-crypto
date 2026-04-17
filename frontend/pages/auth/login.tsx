import { useEffect, useState } from "react";

import { AuthForm } from "@/components/auth-form";
import { AuthLayout } from "@/components/auth-layout";
import { PageHead } from "@/components/page-head";
import { useAuth } from "@/hooks/use-auth";
import { useAuthRouting } from "@/hooks/use-auth-routing";
import { useLoginForm } from "@/hooks/use-login-form";

export default function LoginPage() {
  const { authFlowMessage, clearAuthFlowMessage } = useAuth();
  const isReady = useAuthRouting({ mode: "guest-only" });
  const { login, password, errors, isSubmitting, setLogin, setPassword, handleSubmit } =
    useLoginForm();
  const [successMessage, setSuccessMessage] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!authFlowMessage) {
      return;
    }

    setSuccessMessage(authFlowMessage);
    clearAuthFlowMessage();
  }, [authFlowMessage, clearAuthFlowMessage]);

  useEffect(() => {
    if (!errors.form) {
      return;
    }

    setSuccessMessage(undefined);
  }, [errors.form]);

  if (!isReady) {
    return null;
  }

  return (
    <>
      <PageHead title="Вход | CryptoWatch" description="Страница входа CryptoWatch" />

      <AuthLayout
        eyebrow="Вход"
        title="Вход в CryptoWatch"
        description="Введите логин и пароль"
      >
        <AuthForm
          title="Войти"
          submitLabel="Войти"
          alternateHref="/auth/register"
          alternateLabel="Регистрация"
          formError={errors.form}
          successMessage={successMessage}
          login={login}
          password={password}
          errors={errors}
          isSubmitting={isSubmitting}
          onLoginChange={setLogin}
          onPasswordChange={setPassword}
          onSubmit={handleSubmit}
        />
      </AuthLayout>
    </>
  );
}
