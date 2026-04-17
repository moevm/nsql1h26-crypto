export type ApiMode = "mock" | "backend";

export const parseApiMode = (
  value: string | undefined,
  variableName = "NEXT_PUBLIC_API_MODE"
): ApiMode => {
  if (!value) {
    throw new Error(`Missing required environment variable: ${variableName}`);
  }

  if (value !== "mock" && value !== "backend") {
    throw new Error(`Invalid ${variableName} value. Expected 'mock' or 'backend'`);
  }

  return value;
};
