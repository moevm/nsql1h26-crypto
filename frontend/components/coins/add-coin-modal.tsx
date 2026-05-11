import { FormEvent, RefObject, useEffect, useId, useRef, useState } from "react";

import { SharedDialog } from "@/components/shared-dialog";

interface AddCoinModalProps {
  open: boolean;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (symbol: string) => Promise<void> | void;
  restoreFocusRef?: RefObject<HTMLButtonElement | null>;
}

const TICKER_PATTERN = /^[A-Z0-9]+(?:-[A-Z0-9]+)*$/;
const MAX_TICKER_LENGTH = 20;

const normalizeTicker = (value: string): string => value.trim().toUpperCase();

const getTickerError = (value: string): string | null => {
  const normalizedValue = normalizeTicker(value);

  if (!normalizedValue) {
    return "Введите тикер";
  }

  if (normalizedValue.length > MAX_TICKER_LENGTH) {
    return `Тикер не должен превышать ${MAX_TICKER_LENGTH} символов`;
  }

  if (!TICKER_PATTERN.test(normalizedValue)) {
    return "Используйте только латинские буквы, цифры и дефис";
  }

  return null;
};

const getSubmitErrorMessage = (error: unknown): string => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Не удалось отправить форму";
};

export const AddCoinModal = ({
  open,
  isSubmitting = false,
  onClose,
  onSubmit,
  restoreFocusRef
}: AddCoinModalProps) => {
  const inputId = useId();
  const symbolErrorId = `${inputId}-error`;
  const helperTextId = `${inputId}-hint`;
  const inputRef = useRef<HTMLInputElement>(null);
  const [symbol, setSymbol] = useState("");
  const [symbolError, setSymbolError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      return;
    }

    setSymbol("");
    setSymbolError(null);
    setFormError(null);
  }, [open]);

  const handleClose = () => {
    if (isSubmitting) {
      return;
    }

    onClose();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const nextSymbolError = getTickerError(symbol);

    setFormError(null);

    if (nextSymbolError) {
      setSymbolError(nextSymbolError);
      inputRef.current?.focus();
      return;
    }

    setSymbolError(null);

    try {
      await onSubmit(normalizeTicker(symbol));
      setSymbol("");
      setFormError(null);
      inputRef.current?.focus();
    } catch (error) {
      setFormError(getSubmitErrorMessage(error));
      inputRef.current?.focus();
    }
  };

  return (
    <SharedDialog
      open={open}
      title="Добавить монету"
      description="Введите тикер"
      onClose={handleClose}
      initialFocusRef={inputRef}
      restoreFocusRef={restoreFocusRef}
    >
      <form className="mt-6 space-y-5" onSubmit={handleSubmit} noValidate>
        {formError ? <p className="cw-form-error text-sm">{formError}</p> : null}

        <div>
          <label className="cw-field-label" htmlFor={inputId}>
            Тикер
          </label>
          <input
            ref={inputRef}
            className={`cw-input ${symbolError ? "cw-input-error" : ""}`}
            id={inputId}
            name="symbol"
            type="text"
            inputMode="text"
            autoCapitalize="characters"
            autoCorrect="off"
            autoComplete="off"
            spellCheck={false}
            placeholder="Например, BTC"
            maxLength={MAX_TICKER_LENGTH}
            value={symbol}
            aria-invalid={symbolError ? "true" : "false"}
            aria-describedby={symbolError ? symbolErrorId : helperTextId}
            onChange={(event) => {
              setSymbol(event.target.value.toUpperCase());
              setSymbolError(null);
              setFormError(null);
            }}
          />

          {symbolError ? (
            <p className="cw-form-error mt-2 text-sm" id={symbolErrorId}>
              {symbolError}
            </p>
          ) : (
            <p className="cw-form-hint mt-2 text-sm" id={helperTextId}>
              Пробелы по краям уберем автоматически, тикер приведем к UPPERCASE
            </p>
          )}
        </div>

        <div className="cw-dialog-actions">
          <button
            className="cw-button-secondary"
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Отмена
          </button>
          <button className="cw-button-primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Подождите..." : "Добавить"}
          </button>
        </div>
      </form>
    </SharedDialog>
  );
};
