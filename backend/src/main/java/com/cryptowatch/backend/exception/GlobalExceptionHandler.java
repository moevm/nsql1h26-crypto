package com.cryptowatch.backend.exception;

import com.cryptowatch.backend.dto.error.ApiError;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.ServletWebRequest;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ApiError> handleResponseStatusException(
            ResponseStatusException ex, WebRequest request) {

        HttpStatus status = HttpStatus.resolve(ex.getStatusCode().value());
        if (status == null) {
            status = HttpStatus.INTERNAL_SERVER_ERROR;
        }

        ApiError error = ApiError.builder()
                .success(false)
                .status(status.value())
                .error(status.getReasonPhrase())
                .message(ex.getReason())
                .path(getPath(request))
                .timestamp(LocalDateTime.now())
                .build();

        return ResponseEntity.status(status).body(error);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiError> handleIllegalArgument(
            IllegalArgumentException ex, WebRequest request) {

        ApiError error = ApiError.builder()
                .success(false)
                .status(HttpStatus.BAD_REQUEST.value())
                .error(HttpStatus.BAD_REQUEST.getReasonPhrase())
                .message(ex.getMessage())
                .path(getPath(request))
                .timestamp(LocalDateTime.now())
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidationExceptions(
            MethodArgumentNotValidException ex, WebRequest request) {

        List<String> details = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .collect(Collectors.toList());

        ApiError error = ApiError.builder()
                .success(false)
                .status(HttpStatus.BAD_REQUEST.value())
                .error(HttpStatus.BAD_REQUEST.getReasonPhrase())
                .message("Ошибка валидации")
                .path(getPath(request))
                .timestamp(LocalDateTime.now())
                .details(details)
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiError> handleAuthenticationException(
            AuthenticationException ex, WebRequest request) {

        ApiError error = ApiError.builder()
                .success(false)
                .status(HttpStatus.UNAUTHORIZED.value())
                .error(HttpStatus.UNAUTHORIZED.getReasonPhrase())
                .message("Неверный логин или пароль")
                .path(getPath(request))
                .timestamp(LocalDateTime.now())
                .build();

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }

    @ExceptionHandler(JsonMappingException.class)
    public ResponseEntity<ApiError> handleJsonMappingException(
            JsonMappingException ex, WebRequest request) {

        String fieldInfo = ex.getPath().stream()
                .map(ref -> ref.getFieldName() != null ? ref.getFieldName() : "unknown")
                .collect(Collectors.joining("."));

        String message = "Ошибка маппинга JSON" +
                (fieldInfo.isEmpty() ? "" : " в поле '" + fieldInfo + "'") +
                ": " + ex.getOriginalMessage();

        ApiError error = ApiError.builder()
                .success(false)
                .status(HttpStatus.BAD_REQUEST.value())
                .error(HttpStatus.BAD_REQUEST.getReasonPhrase())
                .message(message)
                .path(getPath(request))
                .timestamp(LocalDateTime.now())
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(JsonProcessingException.class)
    public ResponseEntity<ApiError> handleJsonProcessingException(
            JsonProcessingException ex, WebRequest request) {

        ApiError error = ApiError.builder()
                .success(false)
                .status(HttpStatus.BAD_REQUEST.value())
                .error(HttpStatus.BAD_REQUEST.getReasonPhrase())
                .message("Ошибка обработки JSON: " + ex.getOriginalMessage())
                .path(getPath(request))
                .timestamp(LocalDateTime.now())
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(IOException.class)
    public ResponseEntity<ApiError> handleIOException(
            IOException ex, WebRequest request) {

        ApiError error = ApiError.builder()
                .success(false)
                .status(HttpStatus.BAD_REQUEST.value())
                .error(HttpStatus.BAD_REQUEST.getReasonPhrase())
                .message("Ошибка ввода-вывода: " + ex.getMessage())
                .path(getPath(request))
                .timestamp(LocalDateTime.now())
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleGenericException(
            Exception ex, WebRequest request) {

        ApiError error = ApiError.builder()
                .success(false)
                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                .error(HttpStatus.INTERNAL_SERVER_ERROR.getReasonPhrase())
                .message("Произошла непредвиденная ошибка")
                .path(getPath(request))
                .timestamp(LocalDateTime.now())
                .build();

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }

    private String getPath(WebRequest request) {
        if (request instanceof ServletWebRequest) {
            return ((ServletWebRequest) request).getRequest().getRequestURI();
        }
        return "";
    }
}