import type { LoginRequestPayload, RegisterRequestPayload } from "@/types/auth";

export interface AuthFormErrors {
  login?: string;
  password?: string;
  passwordConfirm?: string;
  form?: string;
}

const passwordPattern = /^(?=.*[0-9])(?=.*[!@#$%^&*])(?=\S+$).{8,100}$/;

export const validateLoginPayload = (payload: LoginRequestPayload): AuthFormErrors => {
  const errors: AuthFormErrors = {};

  if (!payload.login.trim()) {
    errors.login = "Введите логин";
  }

  if (!payload.password.trim()) {
    errors.password = "Введите пароль";
  }

  return errors;
};

export const validateRegisterPayload = (
  payload: RegisterRequestPayload
): AuthFormErrors => {
  const errors: AuthFormErrors = validateLoginPayload(payload);

  if (payload.login && (payload.login.length < 3 || payload.login.length > 20)) {
    errors.login = "Логин должен быть от 3 до 20 символов";
  }

  if (payload.password && !passwordPattern.test(payload.password)) {
    errors.password = "Пароль: 8+ символов, цифра, спецсимвол, без пробелов";
  }

  if (!payload.passwordConfirm.trim()) {
    errors.passwordConfirm = "Подтвердите пароль";
  } else if (payload.password !== payload.passwordConfirm) {
    errors.passwordConfirm = "Пароли не совпадают!";
  }

  return errors;
};
