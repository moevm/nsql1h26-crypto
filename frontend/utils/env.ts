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

export const env = {
  apiMode: getApiMode()
};
