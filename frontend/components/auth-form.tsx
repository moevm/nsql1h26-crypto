import Link from "next/link";
import { FormEvent } from "react";

import type { AuthFormErrors } from "@/services/auth/auth-validation";

interface AuthFormProps {
  title: string;
  submitLabel: string;
  alternateHref: string;
  alternateLabel: string;
  formError?: string;
  login: string;
  password: string;
  passwordConfirm?: string;
  errors: AuthFormErrors;
  isSubmitting: boolean;
  onLoginChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onPasswordConfirmChange?: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

interface AuthFieldProps {
  id: string;
  label: string;
  type: "text" | "password";
  autoComplete: string;
  placeholder: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
}

const AuthField = ({
  id,
  label,
  type,
  autoComplete,
  placeholder,
  value,
  error,
  onChange
}: AuthFieldProps) => {
  const errorId = `${id}-error`;

  return (
    <div>
      <label className="cw-field-label" htmlFor={id}>
        {label}
      </label>
      <input
        className={`cw-input ${error ? "cw-input-error" : ""}`}
        id={id}
        name={id}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? errorId : undefined}
        onChange={(event) => onChange(event.target.value)}
      />
      {error ? (
        <p className="cw-form-error mt-2 text-sm" id={errorId}>
          {error}
        </p>
      ) : null}
    </div>
  );
};

export const AuthForm = ({
  title,
  submitLabel,
  alternateHref,
  alternateLabel,
  formError,
  login,
  password,
  passwordConfirm,
  errors,
  isSubmitting,
  onLoginChange,
  onPasswordChange,
  onPasswordConfirmChange,
  onSubmit
}: AuthFormProps) => {
  return (
    <div>
      <div className="mb-8">
        <h2 className="cw-auth-title text-2xl font-semibold">{title}</h2>
      </div>

      <form className="space-y-5" onSubmit={onSubmit} noValidate>
        {formError ? <p className="cw-form-error text-sm">{formError}</p> : null}

        <AuthField
          id="login"
          label="Логин"
          type="text"
          autoComplete="username"
          placeholder="Введите логин..."
          value={login}
          error={errors.login}
          onChange={onLoginChange}
        />

        <AuthField
          id="password"
          label="Пароль"
          type="password"
          autoComplete="current-password"
          placeholder="Введите пароль..."
          value={password}
          error={errors.password}
          onChange={onPasswordChange}
        />

        {typeof passwordConfirm === "string" ? (
          <AuthField
            id="passwordConfirm"
            label="Подтверждение пароля"
            type="password"
            autoComplete="new-password"
            placeholder="Повторите пароль..."
            value={passwordConfirm}
            error={errors.passwordConfirm}
            onChange={(value) => onPasswordConfirmChange?.(value)}
          />
        ) : null}

        <div className="space-y-3">
          <button className="cw-button-primary w-full" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Подождите..." : submitLabel}
          </button>

          <p className="text-sm text-text-main">
            Нужно другое действие?{" "}
          <Link className="cw-link" href={alternateHref}>
            {alternateLabel}
          </Link>
          </p>
        </div>
      </form>
    </div>
  );
};
