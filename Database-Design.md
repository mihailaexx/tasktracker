# Database Design Document - Task Tracker Application

## Overview

This document provides a comprehensive analysis of the Task Tracker database design from a formal database design perspective, including entity types, relationships, attributes, constraints, and normalization analysis.

---

## 1. Database Schema Overview

### Technology Stack

- **Database Engine**: H2 (Development), PostgreSQL/MySQL (Production ready)
- **ORM Framework**: JPA/Hibernate
- **Schema Generation**: Hibernate DDL Auto-generation

---

## 2. Entity Classification

### 2.1 Strong Entities (Independent Entities)

* **User Entity**
* **Profile Entity**

### 2.2 Weak Entities

* **Tag Entity**
* **Task Entity**

### 2.3 Associative Entities

* **Task_Tags Entity (Junction Table)**

### 2.4 Enumeration Types

* TaskStatus

---

## 3. Detailed Entity Analysis

### 3.1 User Entity

**Attributes:**

- **id** (BIGINT, PK, Auto-increment): Surrogate primary key
- **username** (VARCHAR(50), UNIQUE, NOT NULL): Natural key candidate, business identifier
- **password** (VARCHAR(255), NOT NULL): Encrypted password hash
- **email** (VARCHAR(255), UNIQUE, NOT NULL): Natural key candidate, contact information
- **enabled** (BOOLEAN, NOT NULL, DEFAULT TRUE): Account status flag
- **account_non_expired** (BOOLEAN, NOT NULL, DEFAULT TRUE): Security flag
- **account_non_locked** (BOOLEAN, NOT NULL, DEFAULT TRUE): Security flag
- **credentials_non_expired** (BOOLEAN, NOT NULL, DEFAULT TRUE): Security flag
- **role** (VARCHAR(20), NOT NULL, DEFAULT 'USER'): Authorization level

**Constraints:**

- Primary Key: `id`
- Unique Constraints: `username`, `email`
- Check Constraint (implicit): `role` should be valid role value

### 3.2 Profile Entity

**Attributes:**

- **id** (BIGINT, PK, Auto-increment): Surrogate primary key
- **first_name** (VARCHAR(255), NULL): Optional personal information
- **last_name** (VARCHAR(255), NULL): Optional personal information
- **email** (VARCHAR(255), NULL): Optional, may duplicate users.email
- **user_id** (BIGINT, FK, UNIQUE, NOT NULL): Foreign key to users table

**Relationships:**

- One-to-One with User (Profile is the dependent side)
- Referential Integrity: CASCADE DELETE recommended

**Design Notes:**

- Could be merged with User table (denormalization)
- Separate table allows for profile extensions without affecting authentication
- UNIQUE constraint on user_id ensures one profile per user

### 3.3 Task Entity

**Attributes:**

- **id** (BIGINT, PK, Auto-increment): Surrogate primary key
- **title** (VARCHAR(255), NOT NULL): Task title, required business data
- **description** (TEXT, NULL): Optional detailed task description
- **status** (VARCHAR(50), NOT NULL, DEFAULT 'TODO'): Current task state
- **created_at** (TIMESTAMP, NOT NULL): Audit trail, auto-generated
- **updated_at** (TIMESTAMP, NOT NULL): Audit trail, auto-updated
- **user_id** (BIGINT, FK, NOT NULL): Foreign key to users table

**Relationships:**

- Many-to-One with User (Task belongs to one user)
- Many-to-Many with Tag (through task_tags junction table)

**Constraints:**

- Primary Key: `id`
- Foreign Key: `user_id` → `users.id`
- Check Constraint: `status` must be valid enum value
- NOT NULL: `title`, `user_id`, timestamp fields

### 3.4 Tag Entity

**Attributes:**

- **id** (BIGINT, PK, Auto-increment): Surrogate primary key
- **name** (VARCHAR(50), NOT NULL): Tag name, business identifier
- **color** (VARCHAR(7), NOT NULL, DEFAULT '#3B82F6'): Hex color code for UI
- **created_at** (TIMESTAMP, NOT NULL): Audit trail, auto-generated
- **updated_at** (TIMESTAMP, NOT NULL): Audit trail, auto-updated
- **user_id** (BIGINT, FK, NOT NULL): Foreign key to users table

**Relationships:**

- Many-to-One with User (Tag belongs to one user)
- Many-to-Many with Task (through task_tags junction table)

**Constraints:**

- Primary Key: `id`
- Foreign Key: `user_id` → `users.id`
- Unique Constraint: (`name`, `user_id`) - tag names unique per user
- Check Constraint: `color` must be valid hex color format
- Size Constraint: `name` length 1-50 characters

**Business Rules:**

- Tag names must be unique within a user's scope (not globally)
- Color must be valid 6-digit hex color code
- Tags are user-scoped (multi-tenant design)

### 3.5 Task_Tags Junction Entity

**Attributes:**

- **task_id** (BIGINT, PK, FK, NOT NULL): Foreign key to tasks table
- **tag_id** (BIGINT, PK, FK, NOT NULL): Foreign key to tags table

**Relationships:**

- Many-to-One with Task
- Many-to-One with Tag
- Resolves Many-to-Many between Task and Tag

**Constraints:**

- Composite Primary Key: (`task_id`, `tag_id`)
- Foreign Keys with CASCADE DELETE for referential integrity
- Prevents duplicate associations

---

## 4. Normalization Analysis

### 4.1 First Normal Form (1NF)

✅ **Satisfied**: All attributes contain atomic values, no repeating groups

### 4.2 Second Normal Form (2NF)

✅ **Satisfied**: All non-key attributes are fully functionally dependent on primary keys

### 4.3 Third Normal Form (3NF)

✅ **Satisfied**: No transitive dependencies exist

### 4.4 Boyce-Codd Normal Form (BCNF)

✅ **Satisfied**: All determinants are candidate keys

### 4.5 Fourth Normal Form (4NF)

✅ **Satisfied**: No multi-valued dependencies exist

**Conclusion**: The database design is well-normalized and follows good normalization practices.
