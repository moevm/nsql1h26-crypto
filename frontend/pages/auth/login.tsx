import { AuthForm } from "@/components/auth-form";
import { AuthLayout } from "@/components/auth-layout";
import { LoadingState } from "@/components/loading-state";
import { PageHead } from "@/components/page-head";
import { useAuthRouting } from "@/hooks/use-auth-routing";
import { useLoginForm } from "@/hooks/use-login-form";

export default function LoginPage() {
  const isReady = useAuthRouting({ mode: "guest-only" });
  const { login, password, errors, isSubmitting, setLogin, setPassword, handleSubmit } =
    useLoginForm();

  if (!isReady) {
    return (
      <LoadingState
        title="Проверяем доступ"
        message="Открываем приложение"
      />
    );
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
