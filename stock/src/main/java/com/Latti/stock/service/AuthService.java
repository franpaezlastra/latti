package com.Latti.stock.service;

import com.Latti.stock.dtos.LoginDTO;
import com.Latti.stock.dtos.RegisterDTO;
import org.apache.coyote.Response;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;

public interface AuthService {
    void authenticate(String username, String password);

    UserDetails getUserDetails(String email);

    String getJWT(UserDetails userDetails);

    ResponseEntity <?> register(RegisterDTO registerDTO);

    ResponseEntity<?> login(LoginDTO loginDTO);
}
