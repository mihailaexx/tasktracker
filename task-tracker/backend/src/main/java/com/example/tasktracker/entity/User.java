package com.example.tasktracker.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "users") // "user" может быть зарезервированным словом в некоторых БД
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    @Column(unique = true, nullable = false, length = 50)
    private String username;

    @NotBlank(message = "Password is required")
    @Size(min = 4, max = 50, message = "Password must be between 2 and 50 characters")
    @Column(nullable = false)
    private String password;

    @NotBlank(message = "Email is required")
    @Size(max = 100, message = "Email must not exceed 100 characters")
    @Column(unique = true, nullable = false)
    private String email;

    @Column(name = "enabled", nullable = false)
    private boolean enabled = true;

    @Column(name = "account_non_expired", nullable = false)
    private boolean accountNonExpired = true;

    @Column(name = "account_non_locked", nullable = false)
    private boolean accountNonLocked = true;

    @Column(name = "credentials_non_expired", nullable = false)
    private boolean credentialsNonExpired = true;

    @Column(name = "role", nullable = false, length = 20)
    private String role = "USER";

}
