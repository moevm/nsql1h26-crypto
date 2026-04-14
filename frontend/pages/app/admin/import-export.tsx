import { AppLayout } from "@/components/app-layout";
import { ErrorState } from "@/components/error-state";
import { useDemoErrorState } from "@/hooks/use-demo-error-state";
import { PageHead } from "@/components/page-head";
import { useToast } from "@/hooks/use-toast";
import { importExportToastMessages } from "@/utils/toast-mocks";

export default function ImportExportPage() {
  const { pushToast } = useToast();
  const showErrorState = useDemoErrorState();

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
                <div className="rounded-[24px] border border-border bg-white/70 p-5">
                  <p className="cw-card-title text-base">Файл</p>
                  <p className="mt-3 text-sm leading-6 text-text-main">JSON с данными приложения</p>
                </div>
                <div className="rounded-[24px] border border-border bg-white/70 p-5">
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

              {showErrorState ? (
                <ErrorState
                  title="Не удалось загрузить файл"
                  message="Попробуйте выбрать файл еще раз"
                  onAction={() => pushToast(importExportToastMessages.fileSelectPending)}
                />
              ) : (
                <div>
                  <label className="cw-field-label" htmlFor="import-file">
                    Файл импорта
                  </label>
                  <div className="rounded-[28px] border border-dashed border-border-strong bg-white/65 px-5 py-8 text-center">
                    <p className="cw-card-title text-base">Файл JSON</p>
                    <p className="mt-3 text-sm leading-6 text-text-main">Один файл для импорта</p>
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
              )}
            </div>
          </div>
        </section>
      </AppLayout>
    </>
  );
}
