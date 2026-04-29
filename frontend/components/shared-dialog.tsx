import { KeyboardEvent, PropsWithChildren, RefObject, useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";

interface SharedDialogProps extends PropsWithChildren {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  initialFocusRef?: RefObject<HTMLElement | null>;
  restoreFocusRef?: RefObject<HTMLElement | null>;
}

const getFocusableElements = (container: HTMLElement | null): HTMLElement[] => {
  if (!container) {
    return [];
  }

  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  ).filter((element) => !element.hasAttribute("hidden") && element.getAttribute("aria-hidden") !== "true");
};

export const SharedDialog = ({
  open,
  title,
  description,
  onClose,
  initialFocusRef,
  restoreFocusRef,
  children
}: SharedDialogProps) => {
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open || typeof document === "undefined") {
      return undefined;
    }

    previousActiveElementRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const restoreFocusTarget = restoreFocusRef?.current ?? null;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusFrame = window.requestAnimationFrame(() => {
      const focusTarget =
        initialFocusRef?.current ?? getFocusableElements(panelRef.current)[0] ?? panelRef.current;

      focusTarget?.focus();
    });

    const handleDocumentKeyDown = (event: KeyboardEvent | globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };

    document.addEventListener("keydown", handleDocumentKeyDown);

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleDocumentKeyDown);

      const focusTarget = restoreFocusTarget ?? previousActiveElementRef.current;
      focusTarget?.focus();
    };
  }, [initialFocusRef, onClose, open, restoreFocusRef]);

  const handlePanelKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab") {
      return;
    }

    const focusableElements = getFocusableElements(panelRef.current);

    if (focusableElements.length === 0) {
      event.preventDefault();
      panelRef.current?.focus();
      return;
    }

    const firstFocusableElement = focusableElements[0];
    const lastFocusableElement = focusableElements[focusableElements.length - 1];
    const activeElement =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    if (event.shiftKey && activeElement === firstFocusableElement) {
      event.preventDefault();
      lastFocusableElement.focus();
      return;
    }

    if (!event.shiftKey && activeElement === lastFocusableElement) {
      event.preventDefault();
      firstFocusableElement.focus();
    }
  };

  if (!open || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div className="cw-dialog-root" role="presentation">
      <button
        type="button"
        className="cw-dialog-overlay"
        aria-label="Закрыть окно"
        onClick={onClose}
      />

      <div className="cw-dialog-positioner">
        <div
          ref={panelRef}
          className="cw-dialog-panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={description ? descriptionId : undefined}
          tabIndex={-1}
          onKeyDown={handlePanelKeyDown}
        >
          <div className="cw-dialog-header">
            <div className="min-w-0">
              <h2 className="cw-dialog-title" id={titleId}>
                {title}
              </h2>
              {description ? (
                <p className="cw-dialog-description" id={descriptionId}>
                  {description}
                </p>
              ) : null}
            </div>

            <button
              type="button"
              className="cw-button-ghost cw-dialog-close"
              onClick={onClose}
            >
              Закрыть
            </button>
          </div>

          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};
