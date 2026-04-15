import { AppLayout } from "@/components/app-layout";
import { useImportExportViewMock } from "@/hooks/use-import-export-view-mock";
import { PageHead } from "@/components/page-head";
import { ViewStateSection } from "@/components/view-state-section";
import { useToast } from "@/hooks/use-toast";
import { importExportToastMessages } from "@/utils/toast-mocks";

export default function ImportExportPage() {
  const { pushToast } = useToast();
  const viewState = useImportExportViewMock();

  return (
    <>
      <PageHead
        title="Импорт / Экспорт | CryptoWatch"
        description="Страница импорта и экспорта данных"
      />

      <AppLayout
        activeSection="importExport"
        title="Импорт и экспорт данных"
        description="Экспорт, загрузка файла и статус операции"
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
                    onClick={() => pushToast(importExportToastMessages.exportStarted)}
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
                onRetry={() => {
                  viewState.retry();
                  pushToast(importExportToastMessages.fileSelectPending);
                }}
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
                    <input className="sr-only" id="import-file" name="import-file" type="file" />
                    <button
                      className="cw-button-secondary mt-5"
                      type="button"
                      onClick={() => pushToast(importExportToastMessages.fileSelectPending)}
                    >
                      Выбрать файл
                    </button>
                  </div>

                  <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <button
                      className="cw-button-primary opacity-70 sm:flex-1"
                      type="button"
                      onClick={() => pushToast(importExportToastMessages.importStarted)}
                    >
                      Импортировать
                    </button>
                    <button
                      className="cw-button-secondary sm:flex-1"
                      type="button"
                      onClick={() => pushToast(importExportToastMessages.importReset)}
                    >
                      Сбросить
                    </button>
                  </div>
                </div>
              </ViewStateSection>
            </div>
          </div>
        </section>
      </AppLayout>
    </>
  );
}
