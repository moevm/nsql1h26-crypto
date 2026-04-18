import { AuthForm } from "@/components/auth-form";
import { AuthPageShell } from "@/components/auth-page-shell";
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

  return (
    <AuthPageShell
      isReady={isReady}
      headTitle="Регистрация | CryptoWatch"
      headDescription="Страница регистрации CryptoWatch"
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
    </AuthPageShell>
  );
}
