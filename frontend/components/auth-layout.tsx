import { PropsWithChildren } from "react";

interface AuthLayoutProps extends PropsWithChildren {
  eyebrow: string;
  title: string;
  description?: string;
}

export const AuthLayout = ({
  children,
  eyebrow,
  title,
  description
}: AuthLayoutProps) => {
  return (
    <div className="cw-auth-page">
      <div className="cw-auth-frame">
        <div className="cw-auth-panel">
          <div className="cw-auth-grid">
            <section className="cw-auth-side">
              <div className="cw-auth-side-copy">
                <span className="cw-auth-badge">{eyebrow}</span>
                <h1 className="cw-auth-title mt-6 text-4xl font-semibold tracking-tight sm:text-5xl">
                  {title}
                </h1>
                {description ? (
                  <p className="cw-auth-copy mt-4 text-base leading-7">{description}</p>
                ) : null}
              </div>

              <div className="cw-auth-brand-panel">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-soft">
                  CryptoWatch
                </p>
                <div className="cw-auth-brand-grid">
                  <div className="cw-auth-brand-card">
                    <p className="text-xs uppercase tracking-[0.18em] text-indigo-100/80">
                      Режим
                    </p>
                    <p className="mt-2 text-sm font-medium text-white">Макет</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="cw-auth-content">
              <div className="cw-auth-content-inner">{children}</div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};
