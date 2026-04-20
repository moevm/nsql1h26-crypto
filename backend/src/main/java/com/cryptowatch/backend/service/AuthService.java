package com.cryptowatch.backend.service;

import com.cryptowatch.backend.dto.*;
import com.cryptowatch.backend.model.User;
import com.cryptowatch.backend.repository.UserRepository;
import com.cryptowatch.backend.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.Date;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {
        if (!request.getPassword().equals(request.getPasswordConfirm())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Пароли не совпадают");
        }

        if (userRepository.findByLogin(request.getLogin()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Логин занят");
        }

        User user = User.builder()
                .login(request.getLogin())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role("ROLE_USER")
                .watchlist(new ArrayList<>())
                .favorites(new ArrayList<>())
                .createdAt(new Date())
                .build();

        User savedUser = userRepository.save(user);

        return AuthResponse.builder()
                .success(true)
                .message("Пользователь успешно зарегестрирован")
                .userId(savedUser.getId())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getLogin(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        User user = userRepository.findByLogin(userDetails.getUsername())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Пользователеь не найден"));

        String jwt = jwtTokenProvider.generateToken(userDetails, user.getId());

        return AuthResponse.builder()
                .success(true)
                .token(jwt)
                .userId(user.getId())
                .login(user.getLogin())
                .role(user.getRole())
                .watchlist(user.getWatchlist())
                .favorites(user.getFavorites())
                .build();

    }

    public AuthResponse logout(String authHeader) {
        return AuthResponse.builder()
                .success(true)
                .message("Успешный выход") //не уверен на счет формулировки
                .build();
    }

    public VerifyResponse verify(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Неверный токен");
        }

        String token = authHeader.substring(7);
        String userId = jwtTokenProvider.extractUserId(token);
        String login = jwtTokenProvider.extractLogin(token);
        String role = jwtTokenProvider.extractRole(token);

        userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Пользователь не найден"));

        return VerifyResponse.builder()
                .success(true)
                .userId(userId)
                .login(login)
                .role(role)
                .build();
    }
}