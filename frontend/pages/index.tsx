import Head from "next/head";

export default function IndexPage() {
  return (
    <>
      <Head>
        <title>CryptoWatch UI Routes</title>
        <meta
          name="description"
          content="Техническая страница-заглушка"
        />
      </Head>

      <main className="min-h-screen bg-page px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-3xl rounded-[28px] border border-border bg-surface px-6 py-8 shadow-panel sm:px-8">
          <h1 className="cw-section-title">Маршруты</h1>
          <div className="mt-8 space-y-3">
            <div className="cw-section-label !mb-0 !mt-0 !pt-0 !border-t-0">
              Доступные пути
            </div>
            <ul className="space-y-3 text-sm text-text-main sm:text-base">
              <li>
                <code>/auth/login</code> -- логин
              </li>
              <li>
                <code>/app</code> -- главная
              </li>
              <li>
                <code>/app/favorites</code> -- избранное
              </li>
              <li>
                <code>/app/statistics</code> -- статистика
              </li>
              <li>
                <code>/app/admin/import-export</code> -- импорт / экспорт
              </li>
            </ul>
          </div>
        </div>
      </main>
    </>
  );
}
