package com.Latti.stock.serviceSecurity;

import com.Latti.stock.modules.Client;
import com.Latti.stock.repositories.ClientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;


import org.springframework.stereotype.Service;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    @Autowired
    private ClientRepository clientRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Client client = clientRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + username));


        if (client == null) {
            throw new UsernameNotFoundException("Usuario no encontrado: " + username);
        }

        return User
                .withUsername(client.getUserName())
                .password(client.getPassword())
                .roles("ADMIN") // Cambia el rol si es necesario
                .build();
    }
}