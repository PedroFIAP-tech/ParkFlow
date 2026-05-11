package br.com.parkflow.dto.auth;

import br.com.parkflow.dto.user.UserResponse;

public record AuthResponse(
    String token,
    String tokenType,
    UserResponse user
) {
}

