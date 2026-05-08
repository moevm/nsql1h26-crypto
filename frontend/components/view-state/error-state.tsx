interface ErrorStateProps {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const ErrorState = ({
  title,
  message,
  actionLabel = "Повторить",
  onAction
}: ErrorStateProps) => {
  return (
    <section className="cw-error-state" role="alert">
      <div className="cw-error-badge">Ошибка</div>
      <h2 className="cw-error-title">{title}</h2>
      <p className="cw-error-message">{message}</p>
      {onAction ? (
        <button className="cw-button-secondary mt-4" type="button" onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </section>
  );
};
