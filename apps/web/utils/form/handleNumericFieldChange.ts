/**
 * Handles numeric field changes for form inputs
 * Converts string input to number or undefined for optional fields
 */
export function handleNumericFieldChange(
  value: string,
  onChange: (value: number | undefined) => void
) {
  if (!value || value.trim() === "") {
    onChange(undefined);
  } else {
    const numValue = parseFloat(value);
    onChange(isNaN(numValue) ? undefined : numValue);
  }
}
