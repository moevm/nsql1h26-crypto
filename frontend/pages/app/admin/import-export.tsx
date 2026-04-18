import { AppPageShell } from "@/components/app-page-shell";
import { useImportExportViewMock } from "@/hooks/mock-views/use-import-export-view-mock";
import { AUTH_ROLES } from "@/services/auth/auth-roles";
import { ViewStateSection } from "@/components/view-state-section";

const ImportExportPageContent = () => {
  const viewState = useImportExportViewMock();

  return (
    <AppPageShell
      activeSection="importExport"
      headTitle="Импорт / Экспорт | CryptoWatch"
      headDescription="Страница импорта и экспорта данных"
      title="Импорт и экспорт данных"
      description="Экспорт, загрузка файла и статус операции"
      requiredRole={AUTH_ROLES.ADMIN}
    >
      <section className="mt-8 space-y-8">
        <div>
          <div className="cw-panel-muted">
            <div className="mb-6">
              <h2 className="cw-card-title">Выгрузка</h2>
            </div>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
              <div className="cw-card-surface-md">
                <p className="cw-card-title text-base">Файл</p>
                <p className="mt-3 text-sm leading-6 text-text-main">
                  {viewState.exportDescription}
                </p>
              </div>
              <div className="cw-card-surface-md">
                <p className="cw-card-title text-base">Действие</p>
                <button
                  className="cw-button-primary mt-4 w-full"
                  type="button"
                  disabled
                >
                  Экспорт
                </button>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="cw-panel-muted">
            <div className="mb-6">
              <h2 className="cw-card-title">Загрузка файла</h2>
            </div>

            <ViewStateSection
              status={viewState.status}
              errorTitle="Не удалось загрузить файл"
              errorMessage="Попробуйте выбрать файл еще раз"
              onRetry={viewState.retry}
            >
              <div>
                <label className="cw-field-label" htmlFor="import-file">
                  Файл импорта
                </label>
                <div className="cw-dropzone-surface">
                  <p className="cw-card-title text-base">Файл JSON</p>
                  <p className="mt-3 text-sm leading-6 text-text-main">
                    {viewState.importDescription}
                  </p>
                  <input
                    className="sr-only"
                    disabled
                    id="import-file"
                    name="import-file"
                    type="file"
                  />
                  <button
                    className="cw-button-secondary mt-5"
                    type="button"
                    disabled
                  >
                    Выбрать файл
                  </button>
                </div>

                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <button
                    className="cw-button-primary opacity-70 sm:flex-1"
                    type="button"
                    disabled
                  >
                    Импортировать
                  </button>
                  <button
                    className="cw-button-secondary sm:flex-1"
                    type="button"
                    disabled
                  >
                    Сбросить
                  </button>
                </div>
              </div>
            </ViewStateSection>
          </div>
        </div>
      </section>
    </AppPageShell>
  );
};

export default function ImportExportPage() {
  return <ImportExportPageContent />;
}
