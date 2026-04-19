interface EmptyStateProps {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState = ({
  title,
  message,
  actionLabel = "Обновить",
  onAction
}: EmptyStateProps) => {
  return (
    <section className="cw-empty-state" role="status" aria-live="polite">
      <div className="cw-empty-badge">Пусто</div>
      <h2 className="cw-empty-title">{title}</h2>
      <p className="cw-empty-message">{message}</p>
      {onAction ? (
        <button className="cw-button-secondary mt-4" type="button" onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </section>
  );
};
