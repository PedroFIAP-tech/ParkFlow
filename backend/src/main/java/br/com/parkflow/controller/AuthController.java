package br.com.parkflow.controller;

import br.com.parkflow.dto.auth.AuthResponse;
import br.com.parkflow.dto.auth.LoginRequest;
import br.com.parkflow.dto.user.UserResponse;
import br.com.parkflow.mapper.ParkFlowMapper;
import br.com.parkflow.service.AuthService;
import br.com.parkflow.service.UserContextService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final UserContextService userContextService;
    private final ParkFlowMapper mapper;

    public AuthController(AuthService authService, UserContextService userContextService, ParkFlowMapper mapper) {
        this.authService = authService;
        this.userContextService = userContextService;
        this.mapper = mapper;
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @GetMapping("/me")
    public UserResponse me() {
        return mapper.toUserResponse(userContextService.currentUser());
    }
}
