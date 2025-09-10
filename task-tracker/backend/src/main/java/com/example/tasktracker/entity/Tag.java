package com.example.tasktracker.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "tags", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"name", "user_id"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Tag {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Tag name is required")
    @Size(min = 1, max = 50, message = "Tag name must be between 1 and 50 characters")
    @Column(nullable = false, length = 50)
    private String name;

    @Size(max = 7, message = "Color must be a valid hex color code")
    @Column(length = 7)
    private String color = "#3B82F6"; // Default blue color

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    // Foreign key to User entity - tags are user-specific
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Constructor for convenience
    public Tag(String name, String color, User user) {
        this.name = name;
        this.color = color;
        this.user = user;
    }

    public Tag(String name, User user) {
        this.name = name;
        this.user = user;
        this.color = "#3B82F6"; // Default color
    }
}
