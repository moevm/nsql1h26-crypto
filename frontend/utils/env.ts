import { parseApiMode } from "@/utils/api-mode";

export const env = {
  apiMode: parseApiMode(process.env.NEXT_PUBLIC_API_MODE)
};
