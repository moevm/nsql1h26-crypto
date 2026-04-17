import { AuthForm } from "@/components/auth-form";
import { AuthLayout } from "@/components/auth-layout";
import { LoadingState } from "@/components/loading-state";
import { PageHead } from "@/components/page-head";
import { useAuthRouting } from "@/hooks/use-auth-routing";
import { useRegisterForm } from "@/hooks/use-register-form";

export default function RegisterPage() {
  const isReady = useAuthRouting({ mode: "guest-only" });
  const {
    login,
    password,
    passwordConfirm,
    errors,
    isSubmitting,
    setLogin,
    setPassword,
    setPasswordConfirm,
    handleSubmit
  } = useRegisterForm();

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
      <PageHead title="Регистрация | CryptoWatch" description="Страница регистрации CryptoWatch" />

      <AuthLayout
        eyebrow="Регистрация"
        title="Регистрация в CryptoWatch"
        description="Создайте аккаунт"
      >
        <AuthForm
          title="Создать аккаунт"
          submitLabel="Зарегистрироваться"
          alternateHref="/auth/login"
          alternateLabel="Вход"
          formError={errors.form}
          login={login}
          password={password}
          passwordConfirm={passwordConfirm}
          errors={errors}
          isSubmitting={isSubmitting}
          onLoginChange={setLogin}
          onPasswordChange={setPassword}
          onPasswordConfirmChange={setPasswordConfirm}
          onSubmit={handleSubmit}
        />
      </AuthLayout>
    </>
  );
}
