package com.example.tasktracker.config;

import com.example.tasktracker.service.CustomUserDetailsService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.session.security.web.authentication.SpringSessionRememberMeServices;
import org.springframework.security.core.session.SessionRegistry;
import org.springframework.security.core.session.SessionRegistryImpl;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true, securedEnabled = true)
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // Authentication configuration
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/api/auth/login", "/api/auth/register", "/api/auth/logout").permitAll()
                .requestMatchers("/health", "/actuator/health").permitAll()
                .requestMatchers("/h2-console/**").permitAll() // Только для dev профиля
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/user/**").hasAnyRole("USER", "ADMIN")
                .requestMatchers("/api/auth/me", "/api/tasks/**", "/api/tags/**", "/api/profile/**").authenticated()  // Require authentication for protected endpoints
                .anyRequest().authenticated()
            )
            
            // Disable default login form
            .formLogin(AbstractHttpConfigurer::disable)
            
            // Configure exception handling to return 401 instead of 403 for unauthenticated requests
            .exceptionHandling(exceptions -> exceptions
                .authenticationEntryPoint((request, response, authException) -> {
                    response.setStatus(401);
                    response.setContentType("application/json");
                    response.getWriter().write("{\"error\":\"Unauthorized\",\"message\":\"Authentication required\"}");
                })
            )

            // Logout configuration
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
            
            // Session configuration
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                .maximumSessions(1)
                .maxSessionsPreventsLogin(false)
                .sessionRegistry(sessionRegistry())
            );

        http
            // Session fixation protection
            .sessionManagement(session -> session
                .sessionFixation().changeSessionId()
            );

        http
            // Remember Me configuration
            .rememberMe(rememberMe -> rememberMe
                .rememberMeServices(springSessionRememberMeServices())
                .key("Mjh4nbdf3mbk2jnMWIJnm@f")
                .tokenValiditySeconds(86400)
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
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SpringSessionRememberMeServices springSessionRememberMeServices() {
        SpringSessionRememberMeServices rememberMeServices =
            new SpringSessionRememberMeServices();
        rememberMeServices.setAlwaysRemember(false);
        rememberMeServices.setRememberMeParameterName("remember-me");
        rememberMeServices.setValiditySeconds(86400);
        return rememberMeServices;
    }

    @Bean
    public SessionRegistry sessionRegistry() {
        return new SessionRegistryImpl();
    }

    @Bean
    public CustomUserDetailsService customUserDetailsService() {
        return new CustomUserDetailsService();
    }
}