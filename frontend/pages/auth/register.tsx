import { AuthForm } from "@/components/auth-form";
import { AuthLayout } from "@/components/auth-layout";
import { PageHead } from "@/components/page-head";
import { useAuthPageGuard } from "@/hooks/use-auth-page-guard";
import { useRegisterForm } from "@/hooks/use-register-form";

export default function RegisterPage() {
  const isReady = useAuthPageGuard();
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
    return null;
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
