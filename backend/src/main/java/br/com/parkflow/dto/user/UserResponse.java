package br.com.parkflow.dto.user;

import java.util.Set;
import java.util.UUID;

public record UserResponse(
    UUID id,
    String fullName,
    String email,
    Set<String> roles
) {
}

