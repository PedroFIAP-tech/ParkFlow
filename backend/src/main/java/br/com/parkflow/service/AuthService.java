package br.com.parkflow.service;

import br.com.parkflow.dto.auth.AuthResponse;
import br.com.parkflow.dto.auth.LoginRequest;
import br.com.parkflow.mapper.ParkFlowMapper;
import br.com.parkflow.repository.UserRepository;
import br.com.parkflow.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final ParkFlowMapper mapper;

    public AuthService(
        AuthenticationManager authenticationManager,
        UserRepository userRepository,
        JwtService jwtService,
        ParkFlowMapper mapper
    ) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.mapper = mapper;
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );
        var user = userRepository.findByEmailIgnoreCase(request.email()).orElseThrow();
        return new AuthResponse(jwtService.generateToken(user), "Bearer", mapper.toUserResponse(user));
    }
}

