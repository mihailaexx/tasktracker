package com.example.tasktracker.service;

import com.example.tasktracker.entity.User;
import com.example.tasktracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.core.userdetails.User.UserBuilder;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    /**
     * Load user by username for authentication
     */
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        UserBuilder builder = org.springframework.security.core.userdetails.User.withUsername(username);
        builder.password(user.getPassword());
        builder.roles(user.getRole()); // Используем роль из базы данных

        // Устанавливаем флаги безопасности
        builder.accountExpired(!user.isAccountNonExpired());
        builder.accountLocked(!user.isAccountNonLocked());
        builder.credentialsExpired(!user.isCredentialsNonExpired());
        builder.disabled(!user.isEnabled());

        return builder.build();
    }
}