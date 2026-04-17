interface LoadingStateProps {
  title?: string;
  message?: string;
}

export const LoadingState = ({
  title = "Подождите",
  message = "Проверяем данные и готовим экран"
}: LoadingStateProps) => {
  return (
    <section className="cw-loading-state" role="status" aria-live="polite">
      <div className="cw-loading-indicator" aria-hidden="true">
        <span className="cw-loading-dot" />
        <span className="cw-loading-dot" />
        <span className="cw-loading-dot" />
      </div>
      <h2 className="cw-loading-title">{title}</h2>
      <p className="cw-loading-message">{message}</p>
    </section>
  );
};
