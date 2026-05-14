import { useRef } from "react";

import { AppPageShell } from "@/components/app-page-shell";
import { SharedDialog } from "@/components/shared-dialog";
import { useImportExportView } from "@/hooks/import-export-view/use-import-export-view";
import { AUTH_ROLES } from "@/services/auth/auth-roles";

const COLLECTION_LABELS: Record<string, string> = {
  coins_meta: "Монеты",
  coin_snapshots: "Снимки цен"
};

const ImportExportPageContent = () => {
  const view = useImportExportView();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isExportLoading = view.exportStatus === "loading";
  const isImportLoading = view.importStatus === "loading";

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
              <div className="cw-card-surface p-5">
                <p className="cw-card-title text-base">Файл</p>
                <p className="mt-3 text-sm leading-6 text-text-main">
                  JSON с данными монет
                </p>
              </div>
              <div className="cw-card-surface p-5">
                <p className="cw-card-title text-base">Действие</p>
                <button
                  className="cw-button-primary mt-4 w-full"
                  type="button"
                  disabled={isExportLoading}
                  onClick={view.handleExport}
                >
                  {isExportLoading ? "Подготовка..." : "Экспорт"}
                </button>
                {view.exportError ? (
                  <p className="mt-2 text-sm text-red-400">{view.exportError}</p>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="cw-panel-muted">
            <div className="mb-6">
              <h2 className="cw-card-title">Загрузка файла</h2>
            </div>

            <div>
              <label className="cw-field-label" htmlFor="import-file">
                Файл импорта
              </label>
              <div className="cw-dropzone-surface">
                <p className="cw-card-title text-base">Файл JSON</p>
                <p className="mt-3 text-sm leading-6 text-text-main">
                  {view.selectedFile ? view.selectedFile.name : "Один файл для импорта"}
                </p>
                <input
                  ref={fileInputRef}
                  className="sr-only"
                  id="import-file"
                  name="import-file"
                  type="file"
                  accept=".json,application/json"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) view.handleFileSelect(file);
                    e.target.value = "";
                  }}
                />
                <button
                  className="cw-button-secondary mt-5"
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Выбрать файл
                </button>
              </div>

              {view.fileError ? (
                <p className="mt-2 text-sm text-red-400">{view.fileError}</p>
              ) : null}

              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <button
                  className="cw-button-primary sm:flex-1"
                  type="button"
                  disabled={!view.selectedFile || isImportLoading}
                  onClick={view.handleImportRequest}
                >
                  {isImportLoading ? "Импорт..." : "Импортировать"}
                </button>
                <button
                  className="cw-button-secondary sm:flex-1"
                  type="button"
                  disabled={isImportLoading}
                  onClick={view.handleReset}
                >
                  Сбросить
                </button>
              </div>

              {view.importError ? (
                <p className="mt-3 text-sm text-red-400">{view.importError}</p>
              ) : null}

              {view.importResult ? (
                <div className="cw-card-surface p-5 mt-4">
                  <p className="cw-card-title text-base">Импорт выполнен успешно</p>
                  <ul className="mt-3 space-y-1 text-sm text-text-main">
                    {Object.entries(view.importResult.recordCount).map(([key, count]) => (
                      <li key={key}>
                        {COLLECTION_LABELS[key] ?? key}:{" "}
                        <span className="font-medium">{count}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-sm text-text-muted">
                    {new Intl.DateTimeFormat("ru-RU", { dateStyle: "medium", timeStyle: "short" }).format(new Date(view.importResult.importedAt))}
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <SharedDialog
        open={view.confirmPending}
        title="Подтверждение импорта"
        description="Импорт может заменить существующие данные в базе!"
        onClose={view.handleImportCancel}
      >
        <div className="mt-6 flex justify-end gap-3">
          <button
            className="cw-button-secondary"
            type="button"
            onClick={view.handleImportCancel}
          >
            Отмена
          </button>
          <button
            className="cw-button-primary"
            type="button"
            onClick={view.handleImportConfirm}
          >
            Подтвердить
          </button>
        </div>
      </SharedDialog>
    </AppPageShell>
  );
};

export default function ImportExportPage() {
  return <ImportExportPageContent />;
}
