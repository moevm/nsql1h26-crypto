import { AuthLayout } from "@/components/auth-layout";
import { PageHead } from "@/components/page-head";

export default function LoginPage() {
  return (
    <>
      <PageHead 
        title="Вход | CryptoWatch" 
        description="Визуальная страница входа CryptoWatch" 
      />

      <AuthLayout eyebrow="Вход" title="Вход в CryptoWatch">
        <div>
          <div className="mb-8">
            <h2 className="cw-auth-title text-2xl font-semibold">Войти</h2>
          </div>

          <form className="space-y-5" action="#" method="post">
            <div>
              <label className="cw-field-label" htmlFor="login">
                Логин
              </label>
              <input
                className="cw-input"
                id="login"
                name="login"
                type="text"
                autoComplete="username"
                placeholder="Введите логин"
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <label className="cw-field-label mb-0" htmlFor="password">
                  Пароль
                </label>
                <button className="cw-link text-sm" type="button">
                  Забыли пароль?
                </button>
              </div>
              <input
                className="cw-input"
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="Введите пароль"
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button className="cw-button-primary flex-1" type="submit">
                Войти
              </button>
              <button className="cw-button-secondary flex-1" type="button">
                Регистрация
              </button>
            </div>
          </form>
        </div>
      </AuthLayout>
    </>
  );
}
