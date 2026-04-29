export type ToastType = "success" | "error" | "info";

export interface ToastInput {
  type: ToastType;
  message: string;
  title?: string;
}

export interface ToastItem extends ToastInput {
  id: string;
}
