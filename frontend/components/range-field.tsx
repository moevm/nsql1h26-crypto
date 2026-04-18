interface RangeFieldProps {
  label: string;
  id: string;
  inputType?: "text" | "number" | "date";
  startName?: string;
  endName?: string;
  startPlaceholder?: string;
  endPlaceholder?: string;
}

export const RangeField = ({
  label,
  id,
  inputType = "text",
  startName = `${id}-from`,
  endName = `${id}-to`,
  startPlaceholder = "От…",
  endPlaceholder = "До…"
}: RangeFieldProps) => {
  const startId = `${id}-from`;
  const endId = `${id}-to`;
  const inputMode = inputType === "number" ? "decimal" : undefined;

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
          id={startId}
          inputMode={inputMode}
          name={startName}
          placeholder={startPlaceholder}
          type={inputType}
        />
        <label className="sr-only" htmlFor={endId}>
          {label}: до
        </label>
        <input
          autoComplete="off"
          className="cw-input"
          id={endId}
          inputMode={inputMode}
          name={endName}
          placeholder={endPlaceholder}
          type={inputType}
        />
      </div>
    </fieldset>
  );
};
