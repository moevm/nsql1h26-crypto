import { useRouter } from "next/router";

import { AuthForm } from "@/components/auth-form";
import { AuthLayout } from "@/components/auth-layout";
import { PageHead } from "@/components/page-head";
import { useAuthPageGuard } from "@/hooks/use-auth-page-guard";
import { useLoginForm } from "@/hooks/use-login-form";

const getInitialSuccessMessage = (queryValue: string | string[] | undefined): string | undefined => {
  if (queryValue === "1") {
    return "Регистрация прошла успешно";
  }

  return undefined;
};

export default function LoginPage() {
  const router = useRouter();
  const isReady = useAuthPageGuard();
  const { login, password, errors, isSubmitting, setLogin, setPassword, handleSubmit } =
    useLoginForm();
  const successMessage = getInitialSuccessMessage(router.query.registered);

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
