export type ApiMode = "mock" | "backend";

const getApiMode = (): ApiMode => {
  const value = process.env.NEXT_PUBLIC_API_MODE;

  if (!value) {
    return "mock";
  }

  if (value !== "mock" && value !== "backend") {
    throw new Error(
      "Invalid NEXT_PUBLIC_API_MODE value. Expected 'mock' or 'backend'."
    );
  }

  return value;
};

const getApiBaseUrl = (apiMode: ApiMode): string => {
  if (apiMode === "mock") {
    return "";
  }

  const value = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!value) {
    throw new Error(
      "Missing required environment variable: NEXT_PUBLIC_API_BASE_URL"
    );
  }

  return value;
};

const apiMode = getApiMode();

export const env = {
  apiMode,
  apiBaseUrl: getApiBaseUrl(apiMode)
};
