package com.Latti.stock.configurations;

import com.Latti.stock.filters.JwtRequestFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
public class WebConfiguration {

    @Autowired
    private JwtRequestFilter jwtRequestFilter; // Inyecta el filtro personalizado para manejar la autenticación JWT.

    @Autowired
    private CorsConfigurationSource corsConfigurationSource; // Inyecta la configuración de CORS.

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity) throws Exception {

        httpSecurity
                .cors(cors -> cors.configurationSource(corsConfigurationSource)) // Configura CORS usando la fuente de configuración.
                .csrf(AbstractHttpConfigurer::disable) // Desactiva la protección CSRF.
                .httpBasic(AbstractHttpConfigurer::disable) // Desactiva la autenticación básica HTTP.
                .formLogin(AbstractHttpConfigurer::disable) // Desactiva el formulario de inicio de sesión.
                .headers(httpSecurityHeadersConfigurer -> httpSecurityHeadersConfigurer.frameOptions(
                        HeadersConfigurer.FrameOptionsConfig::disable)) // Desactiva la protección contra marcos.

                .authorizeHttpRequests(auth -> auth
                        .anyRequest().permitAll() // 🔓 Permitir todas las peticiones sin autenticación
                )

                .addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class) // Añade el filtro JWT antes del filtro de autenticación por nombre de usuario y contraseña.
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)); // Configura la sesión como sin estado.

        return httpSecurity.build();
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager(); // Configura el AuthenticationManager usando la configuración de autenticación.
    }
}

