import type { ChangeEvent } from "react";

interface RangeFieldProps {
  label: string;
  id: string;
  inputType?: "text" | "number" | "date" | "datetime-local";
  disabled?: boolean;
  startName?: string;
  endName?: string;
  startPlaceholder?: string;
  endPlaceholder?: string;
  startValue?: string;
  endValue?: string;
  onStartChange?: (value: string) => void;
  onEndChange?: (value: string) => void;
}

export const RangeField = ({
  label,
  id,
  inputType = "text",
  disabled = false,
  startName = `${id}-from`,
  endName = `${id}-to`,
  startPlaceholder = "От...",
  endPlaceholder = "До...",
  startValue,
  endValue,
  onStartChange,
  onEndChange
}: RangeFieldProps) => {
  const startId = `${id}-from`;
  const endId = `${id}-to`;
  const inputMode = inputType === "number" ? "decimal" : undefined;
  const startControlProps = onStartChange
    ? {
        value: startValue ?? "",
        onChange: (event: ChangeEvent<HTMLInputElement>) => onStartChange(event.target.value)
      }
    : {};
  const endControlProps = onEndChange
    ? {
        value: endValue ?? "",
        onChange: (event: ChangeEvent<HTMLInputElement>) => onEndChange(event.target.value)
      }
    : {};

  return (
    <fieldset className="cw-fieldset">
      <legend className="cw-field-label">{label}</legend>
      <div className="cw-field-group">
        <label className="sr-only" htmlFor={startId}>
          {label}: от
        </label>
        <input
          autoComplete="off"
          className="cw-input"
          disabled={disabled}
          id={startId}
          inputMode={inputMode}
          name={startName}
          placeholder={startPlaceholder}
          type={inputType}
          {...startControlProps}
        />
        <label className="sr-only" htmlFor={endId}>
          {label}: до
        </label>
        <input
          autoComplete="off"
          className="cw-input"
          disabled={disabled}
          id={endId}
          inputMode={inputMode}
          name={endName}
          placeholder={endPlaceholder}
          type={inputType}
          {...endControlProps}
        />
      </div>
    </fieldset>
  );
};
