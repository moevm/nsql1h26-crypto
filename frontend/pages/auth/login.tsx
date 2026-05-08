import { AuthForm } from "@/components/auth-form";
import { AuthPageShell } from "@/components/auth-page-shell";
import { useAuthRouting } from "@/hooks/use-auth-routing";
import { useLoginForm } from "@/hooks/use-login-form";

export default function LoginPage() {
  const isReady = useAuthRouting({ mode: "guest-only" });
  const { login, password, errors, isSubmitting, setLogin, setPassword, handleSubmit } =
    useLoginForm();

  return (
    <AuthPageShell
      isReady={isReady}
      headTitle="Вход | CryptoWatch"
      headDescription="Страница входа CryptoWatch"
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
    </AuthPageShell>
  );
}
