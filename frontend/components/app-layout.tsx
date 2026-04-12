import { PropsWithChildren } from "react";

interface AppLayoutProps extends PropsWithChildren {
  title: string;
}

export const AppLayout = ({ children, title }: AppLayoutProps) => {
  return (
    <div className="min-h-screen bg-page px-4 py-8 sm:px-6">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <header className="rounded-2xl border border-border bg-surface px-6 py-5 shadow-panel">
          <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
        </header>
        <main className="rounded-2xl border border-border bg-surface px-6 py-6 shadow-panel">
          {children}
        </main>
      </div>
    </div>
  );
};
