# Objects and Their Relationships - Task Tracker

## Overview

This document describes the domain objects, entities, DTOs (Data Transfer Objects), and their relationships within the Task Tracker application. The system follows a typical Spring Boot architecture with JPA entities, service layers, and RESTful APIs.

## Core Domain Entities

### 1. User Entity

**Location:** `com.example.tasktracker.entity.User`

**Purpose:** Represents authenticated users in the system.

**Attributes:**

- `id`: Long (Primary Key, Auto-generated)
- `username`: String (Unique, Required, Max 50 chars)
- `password`: String (Required, Encrypted)
- `email`: String (Unique, Required)
- `enabled`: Boolean (Default: true)
- `accountNonExpired`: Boolean (Default: true)
- `accountNonLocked`: Boolean (Default: true)
- `credentialsNonExpired`: Boolean (Default: true)
- `role`: String (Default: "USER", Max 20 chars)

**Relationships:**

- One-to-One with `Profile` (User has one profile)
- One-to-Many with `Task` (User owns multiple tasks)
- One-to-Many with `Tag` (User owns multiple tags)

**Security Features:**

- Implements Spring Security UserDetails interface requirements
- Supports role-based access control
- Account status tracking (enabled, locked, expired)

---

### 2. Task Entity

**Location:** `com.example.tasktracker.entity.Task`

**Purpose:** Represents individual tasks/todos in the system.

**Attributes:**

- `id`: Long (Primary Key, Auto-generated)
- `title`: String (Required, Non-blank)
- `description`: String (Optional)
- `status`: TaskStatus enum (Default: TODO)
- `createdAt`: LocalDateTime (Auto-generated)
- `updatedAt`: LocalDateTime (Auto-updated)

**Relationships:**

- Many-to-One with `User` (Task belongs to one user)
- Many-to-Many with `Tag` (Task can have multiple tags, tags can be on multiple tasks)

**Business Rules:**

- Tasks are user-specific (multi-tenant by user)
- Automatic timestamp management (creation/update)
- Tag association through join table `task_tags`

---

### 3. Tag Entity

**Location:** `com.example.tasktracker.entity.Tag`

**Purpose:** Represents categorization labels for tasks.

**Attributes:**

- `id`: Long (Primary Key, Auto-generated)
- `name`: String (Required, 1-50 chars)
- `color`: String (Hex color code, Default: "#3B82F6", Max 7 chars)
- `createdAt`: LocalDateTime (Auto-generated)
- `updatedAt`: LocalDateTime (Auto-updated)

**Relationships:**

- Many-to-One with `User` (Tag belongs to one user)
- Many-to-Many with `Task` (Tag can be applied to multiple tasks)

**Constraints:**

- Unique constraint on (name, user_id) - users cannot have duplicate tag names
- Color validation for hex color codes
- User-scoped tags (multi-tenant by user)

---

### 4. Profile Entity

**Location:** `com.example.tasktracker.entity.Profile`

**Purpose:** Extended user information and preferences.

**Attributes:**

- `id`: Long (Primary Key, Auto-generated)
- `firstName`: String (Optional)
- `lastName`: String (Optional)
- `email`: String (Optional, may duplicate User.email for display)

**Relationships:**

- One-to-One with `User` (Profile extends User information)

**Usage:**

- Stores additional user information beyond authentication data
- Allows for user profile management without affecting core auth data

---

### 5. TaskStatus Enum

**Location:** `com.example.tasktracker.entity.TaskStatus`

**Purpose:** Defines the possible states of a task.

**Values:**

- `TODO`: Initial state for new tasks
- `IN_PROGRESS`: Task is being worked on
- `DONE`: Task has been completed

**Usage:**

- Used in Task entity to track task progression
- Supports typical Kanban-style workflow

---

## Data Transfer Objects (DTOs)

### Request DTOs

#### 1. TaskRequest

**Location:** `com.example.tasktracker.dto.TaskRequest`

**Purpose:** Handles task creation and update requests.

**Attributes:**

- `title`: String (Required, validated)
- `description`: String (Optional)
- `status`: TaskStatus (Default: TODO)
- `tagIds`: List `<Long>` (List of tag IDs to associate)

#### 2. TagRequest

**Location:** `com.example.tasktracker.dto.TagRequest`

**Purpose:** Handles tag creation and update requests.

#### 3. ProfileRequest

**Location:** `com.example.tasktracker.dto.ProfileRequest`

**Purpose:** Handles profile update requests.

#### 4. LoginRequest & RegisterRequest

**Location:** `com.example.tasktracker.dto.LoginRequest`, `RegisterRequest`

**Purpose:** Handle authentication requests.

### Response DTOs

#### 1. TaskResponse

**Location:** `com.example.tasktracker.dto.TaskResponse`

**Purpose:** Returns task data with associated tags.

**Attributes:**

- `id`: Long
- `title`: String
- `description`: String
- `status`: TaskStatus
- `createdAt`: LocalDateTime
- `updatedAt`: LocalDateTime
- `tags`: List `<TagResponse>` (Associated tags)

#### 2. TagResponse

**Location:** `com.example.tasktracker.dto.TagResponse`

**Purpose:** Returns tag data for client consumption.

#### 3. ProfileResponse

**Location:** `com.example.tasktracker.dto.ProfileResponse`

**Purpose:** Returns user profile information.

#### 4. AuthResponse

**Location:** `com.example.tasktracker.dto.AuthResponse`

**Purpose:** Returns authentication results and user session data.

---

## Database Schema Relationships

### Key Constraints

1. **Unique Constraints:**

   - `users.username` (globally unique)
   - `users.email` (globally unique)
   - `(tags.name, tags.user_id)` (unique per user)
2. **Foreign Key Constraints:**

   - `profiles.user_id` → `users.id`
   - `tasks.user_id` → `users.id`
   - `tags.user_id` → `users.id`
   - `task_tags.task_id` → `tasks.id`
   - `task_tags.tag_id` → `tags.id`
3. **Cascade Rules:**

   - Tag associations: PERSIST, MERGE (no automatic deletion)
   - User deletion would cascade to tasks, tags, and profile

---

## Object Lifecycle

### Task Lifecycle

1. **Creation:** User creates task → Status: TODO
2. **Progress:** User updates task → Status: IN_PROGRESS
3. **Completion:** User completes task → Status: DONE
4. **Tag Management:** Users can add/remove tags at any stage
5. **Deletion:** User can delete their own tasks

### Tag Lifecycle

1. **Creation:** User creates tag with name and color
2. **Association:** Tags can be associated with multiple tasks
3. **Modification:** User can update tag name and color
4. **Deletion:** User can delete tags (removes associations)

### User/Profile Lifecycle

1. **Registration:** Creates User + empty Profile
2. **Authentication:** Login/logout with session management
3. **Profile Updates:** Modify profile information independently
4. **Account Management:** Enable/disable, role changes

---

## API Layer Mapping

### Controllers → Services → Repositories

```
TaskController → TaskService → TaskRepository
TagController → TagService → TagRepository  
ProfileController → ProfileService → ProfileRepository
AuthController → AuthService → UserRepository
```

### DTO Conversion

- **Request DTOs** → Entities (in Service layer)
- **Entities** → Response DTOs (in Service layer)
- **Validation** applied at DTO level (Jakarta Validation)
- **Business Logic** applied at Service level

---

## Design Patterns Used

1. **Repository Pattern:** Data access abstraction
2. **Service Layer Pattern:** Business logic encapsulation
3. **DTO Pattern:** Data transfer and API contracts
4. **Entity Pattern:** Domain model representation
5. **MVC Pattern:** Web layer organization
6. **Dependency Injection:** Spring's IoC container
