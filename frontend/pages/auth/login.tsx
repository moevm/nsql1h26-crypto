import { useEffect } from "react";

import { AuthForm } from "@/components/auth-form";
import { AuthLayout } from "@/components/auth-layout";
import { PageHead } from "@/components/page-head";
import { useAuth } from "@/hooks/use-auth";
import { useAuthRouting } from "@/hooks/use-auth-routing";
import { useLoginForm } from "@/hooks/use-login-form";

export default function LoginPage() {
  const { authFlowNotice, clearAuthFlowNotice } = useAuth();
  const isReady = useAuthRouting({ mode: "guest-only" });
  const { login, password, errors, isSubmitting, setLogin, setPassword, handleSubmit } =
    useLoginForm();

  useEffect(() => {
    if (!errors.form) {
      return;
    }

    clearAuthFlowNotice();
  }, [clearAuthFlowNotice, errors.form]);

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
        <div className="space-y-5">
          {authFlowNotice ? (
            <p
              className={`${
                authFlowNotice.tone === "error" ? "cw-form-error" : "cw-form-success"
              } text-sm`}
            >
              {authFlowNotice.message}
            </p>
          ) : null}

          <AuthForm
            title="Войти"
            submitLabel="Войти"
            alternateHref="/auth/register"
            alternateLabel="Регистрация"
            formError={errors.form}
            login={login}
            password={password}
            errors={errors}
            isSubmitting={isSubmitting}
            onLoginChange={setLogin}
            onPasswordChange={setPassword}
            onSubmit={handleSubmit}
          />
        </div>
      </AuthLayout>
    </>
  );
}
