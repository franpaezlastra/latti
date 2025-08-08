package com.Latti.stock.controllers;


import com.Latti.stock.dtos.LoginDTO;
import com.Latti.stock.dtos.RegisterDTO;
import com.Latti.stock.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin // 🔓 Habilita CORS si lo necesitás desde frontend local
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterDTO registerDTO) {
        return authService.register(registerDTO);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginDTO loginDTO) {
        return authService.login(loginDTO);
    }
}
