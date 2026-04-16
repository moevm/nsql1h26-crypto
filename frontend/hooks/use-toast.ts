import { useToastContext } from "@/components/toast-provider";

export const useToast = () => {
  return useToastContext();
};
