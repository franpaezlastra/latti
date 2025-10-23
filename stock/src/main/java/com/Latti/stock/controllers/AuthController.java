package com.Latti.stock.controllers;


import com.Latti.stock.dtos.LoginDTO;
import com.Latti.stock.dtos.RegisterDTO;
import com.Latti.stock.service.AuthService;
import com.Latti.stock.serviceSecurity.JwtUtilsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin // 🔓 Habilita CORS si lo necesitás desde frontend local
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private JwtUtilsService jwtUtilsService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterDTO registerDTO) {
        return authService.register(registerDTO);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginDTO loginDTO) {
        return authService.login(loginDTO);
    }

    @GetMapping("/validate")
    public ResponseEntity<?> validateToken() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.isAuthenticated()) {
                return ResponseEntity.ok().body(Map.of(
                    "valid", true,
                    "message", "Token válido"
                ));
            } else {
                return ResponseEntity.status(401).body(Map.of(
                    "valid", false,
                    "message", "Token inválido"
                ));
            }
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of(
                "valid", false,
                "message", "Error al validar token"
            ));
        }
    }
}
