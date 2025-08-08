package com.Latti.stock.service.impl;

import com.Latti.stock.dtos.LoginDTO;
import com.Latti.stock.dtos.RegisterDTO;
import com.Latti.stock.modules.Client;
import com.Latti.stock.repositories.ClientRepository;
import com.Latti.stock.service.AuthService;
import com.Latti.stock.serviceSecurity.JwtUtilsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class AuthServiceImplements implements AuthService {


    @Autowired
    private ClientRepository clientRepository;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private JwtUtilsService jwtUtilsService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void authenticate(String username, String password) {
        UserDetails userDetails = userDetailsService.loadUserByUsername(username);

        if (!passwordEncoder.matches(password, userDetails.getPassword())) {
            throw new IllegalArgumentException("Usuario o contraseña incorrecto");
        }
    }

    @Override
    public UserDetails getUserDetails(String username) {
        return userDetailsService.loadUserByUsername(username);
    }

    @Override
    public String getJWT(UserDetails userDetails) {
        return jwtUtilsService.generateToken(userDetails);
    }

    @Override
    public ResponseEntity<?> register(RegisterDTO registerDTO) {
        try {
            String username = registerDTO.username();
            String password = registerDTO.password();

            if (username == null || username.isEmpty()) {
                throw new IllegalArgumentException("Ingrese el usuario");
            }
            if (password == null || password.isEmpty()) {
                throw new IllegalArgumentException("Ingrese la contraseña");
            }

            if (clientRepository.existsByUsername(username)) {
                throw new IllegalArgumentException("El usuario ya existe");
            }

            Client nuevoCliente = new Client();
            nuevoCliente.setUserName(username);
            nuevoCliente.setPassword(passwordEncoder.encode(password));

            clientRepository.save(nuevoCliente);

            return ResponseEntity.ok(Map.of("message", "Usuario registrado correctamente"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Error al registrar usuario"));
        }
    }

    @Override
    public ResponseEntity<?> login(LoginDTO loginDTO) {
        try {
            String username = loginDTO.username();
            String password = loginDTO.password();

            if (username == null || username.isEmpty()) {
                throw new IllegalArgumentException("Ingrese el Usuario");
            }
            if (password == null || password.isEmpty()) {
                throw new IllegalArgumentException("Ingrese la contraseña");
            }

            authenticate(username, password);
            UserDetails userDetails = getUserDetails(username);
            String jwt = getJWT(userDetails);

            return ResponseEntity.ok(Map.of("token", jwt));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Usuario o contraseña incorrecto"));
        }
    }
}
