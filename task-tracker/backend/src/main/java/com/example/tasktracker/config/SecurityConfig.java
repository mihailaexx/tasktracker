package com.example.tasktracker.config;

import com.example.tasktracker.service.CustomUserDetailsService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true, securedEnabled = true)
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // Настройка авторизации
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/api/auth/login", "/api/auth/register", "/api/auth/logout").permitAll()
                .requestMatchers("/health", "/actuator/health").permitAll()
                .requestMatchers("/h2-console/**").permitAll() // Только для dev профиля
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/user/**").hasAnyRole("USER", "ADMIN")
                .requestMatchers("/api/auth/me", "/api/tasks/**", "/api/tags/**", "/api/profile/**").authenticated()  // Require authentication for protected endpoints
                .anyRequest().authenticated()
            )
            
            // Отключение формы логина по умолчанию
            .formLogin(AbstractHttpConfigurer::disable)
            
            // Настройка logout
            .logout(logout -> logout
                .logoutUrl("/api/auth/logout")
                .logoutSuccessHandler((request, response, authentication) -> {
                    response.setStatus(200);
                    response.setContentType("application/json");
                    response.getWriter().write("{\"success\":true,\"message\":\"Logout successful\",\"token\":null,\"username\":null}");
                })
                .invalidateHttpSession(true)
                .deleteCookies("JSESSIONID", "remember-me")
                .clearAuthentication(true)
                .permitAll()
            )
            
            // Настройка сессий
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                .maximumSessions(1)
                .maxSessionsPreventsLogin(false)
                .sessionRegistry(sessionRegistry())
            );

        http
            .sessionManagement(session -> session
                .sessionFixation().changeSessionId()
            );

        http
            // Remember Me - актуальная версия
            .rememberMe(rememberMe -> rememberMe
                .rememberMeServices(springSessionRememberMeServices())
                .key("uniqueAndSecret") // Уникальный ключ для подписи токенов
                .tokenValiditySeconds(86400) // 24 часа
                .userDetailsService(customUserDetailsService())
                .rememberMeParameter("remember-me")
                .rememberMeCookieName("remember-me")
                .alwaysRemember(false)
            );
        
        http.csrf(AbstractHttpConfigurer::disable);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12); // Увеличенная стойкость
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    // @Bean
    // public DaoAuthenticationProvider authenticationProvider(CustomUserDetailsService userDetailsService) {
    //     DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
    //     authProvider.setUserDetailsService(userDetailsService);
    //     authProvider.setPasswordEncoder(passwordEncoder());
    //     authProvider.setHideUserNotFoundExceptions(false);
    //     return authProvider;
    // }

    @Bean
    public org.springframework.session.security.web.authentication.SpringSessionRememberMeServices springSessionRememberMeServices() {
        org.springframework.session.security.web.authentication.SpringSessionRememberMeServices rememberMeServices =
            new org.springframework.session.security.web.authentication.SpringSessionRememberMeServices();
        rememberMeServices.setAlwaysRemember(false);
        rememberMeServices.setRememberMeParameterName("remember-me");
        rememberMeServices.setValiditySeconds(86400); // 24 часа
        return rememberMeServices;
    }

    @Bean
    public org.springframework.security.core.session.SessionRegistry sessionRegistry() {
        return new org.springframework.security.core.session.SessionRegistryImpl();
    }

    @Bean
    public CustomUserDetailsService customUserDetailsService() {
        return new CustomUserDetailsService();
    }
}