package com.cryptowatch.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank
    @Size(min = 3, max = 20, message = "Login must be between 3 and 20 characters")
    private String login;

    @NotBlank
    @Pattern(regexp = "^(?=.*[0-9])(?=.*[!@#$%^&*])(?=\\S+$).{8,}$",
             message = "Password must be at least 8 characters, contain a digit and a special character")
    private String password;

    @NotBlank
    private String passwordConfirm;
}