package com.Latti.stock.serviceSecurity;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;


import javax.crypto.SecretKey;
import javax.lang.model.element.NestingKind;
import javax.xml.crypto.Data;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtUtilsService {
    private static final SecretKey SECRET_KEY = Jwts.SIG.HS256.key().build();
    public static final long JWT_TOKEN_VALIDITY = 1000 * 60 * 60;

    public Claims extractAllClaims(String token){
        return Jwts.parser().verifyWith(SECRET_KEY).build().parseSignedClaims(token).getPayload();
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver){
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    public String extractUserName(String token){
        return extractClaim(token, Claims::getSubject);
    }

    public Date extractExpiration(String token){
        return extractClaim(token, Claims::getExpiration);
    }

    public boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private String createToken(Map<String, Object> claims, String username) {
        return Jwts
                .builder()
                .claims(claims)
                .subject(username)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + JWT_TOKEN_VALIDITY))
                .signWith(SECRET_KEY)
                .compact();
    }

    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        String rol = userDetails.getAuthorities().iterator().next().getAuthority();
        claims.put("rol", rol);
        return createToken(claims, userDetails.getUsername());
    }

}
