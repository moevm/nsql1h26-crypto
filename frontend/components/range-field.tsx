interface RangeFieldProps {
  label: string;
  id: string;
  startPlaceholder?: string;
  endPlaceholder?: string;
}

export const RangeField = ({
  label,
  id,
  startPlaceholder = "От",
  endPlaceholder = "До"
}: RangeFieldProps) => {
  return (
    <div>
      <label className="cw-field-label" htmlFor={id}>
        {label}
      </label>
      <div className="cw-field-group">
        <input className="cw-input" id={id} placeholder={startPlaceholder} type="text" />
        <input className="cw-input" placeholder={endPlaceholder} type="text" />
      </div>
    </div>
  );
};
