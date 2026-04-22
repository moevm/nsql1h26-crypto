export const readSingleQueryValue = (
  value: string | string[] | undefined
): string | undefined => {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
};

export const parsePositiveIntegerQueryValue = (
  value: string | string[] | undefined,
  fallbackValue: number
): number => {
  const normalizedValue = readSingleQueryValue(value);

  if (!normalizedValue) {
    return fallbackValue;
  }

  const parsedValue = Number(normalizedValue);

  return Number.isInteger(parsedValue) && parsedValue > 0 ? parsedValue : fallbackValue;
};
