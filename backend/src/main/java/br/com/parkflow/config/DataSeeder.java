package br.com.parkflow.config;

import br.com.parkflow.entity.RoleEntity;
import br.com.parkflow.entity.UserEntity;
import br.com.parkflow.enums.RoleName;
import br.com.parkflow.repository.RoleRepository;
import br.com.parkflow.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.LinkedHashSet;

@Component
public class DataSeeder implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final String adminEmail;
    private final String adminPassword;

    public DataSeeder(
        RoleRepository roleRepository,
        UserRepository userRepository,
        PasswordEncoder passwordEncoder,
        @Value("${app.seed.admin-email}") String adminEmail,
        @Value("${app.seed.admin-password}") String adminPassword
    ) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.adminEmail = adminEmail;
        this.adminPassword = adminPassword;
    }

    @Override
    @Transactional
    public void run(String... args) {
        Arrays.stream(RoleName.values()).forEach(this::ensureRole);

        if (!userRepository.existsByEmailIgnoreCase(adminEmail)) {
            var admin = new UserEntity();
            admin.setFullName("Administrador ParkFlow");
            admin.setEmail(adminEmail);
            admin.setPasswordHash(passwordEncoder.encode(adminPassword));
            admin.setRoles(new LinkedHashSet<>(roleRepository.findAll()));
            userRepository.save(admin);
        }
    }

    private void ensureRole(RoleName roleName) {
        roleRepository.findByName(roleName).orElseGet(() -> {
            var role = new RoleEntity();
            role.setName(roleName);
            role.setDescription("Perfil " + roleName.name());
            return roleRepository.save(role);
        });
    }
}

