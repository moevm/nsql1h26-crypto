package com.cryptowatch.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank
    @Size(min = 3, max = 20, message = "Логин должен содержать от 3 до 20 символов")
    private String login;

    @NotBlank
    @Pattern(regexp = "^(?=.*[0-9])(?=.*[!@#$%^&*])(?=\\S+$).{8,}$",
             message = "Пароль должен быть минимум 8 символов, содержать цифру и специальный символ")
    private String password;

    @NotBlank
    private String passwordConfirm;
}