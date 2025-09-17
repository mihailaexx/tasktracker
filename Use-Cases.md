# Use Cases - Task Tracker Application

## Overview

This document describes the use cases, user stories, and business flows supported by the Task Tracker application. The system is designed as a personal task management tool with user authentication, task organization, and tagging capabilities.

## Primary Actors

### 1. End User

- **Description:** Registered user who manages their personal tasks
- **Access Level:** Authenticated user with USER role
- **Scope:** Can only access and manage their own data

### 2. System Administrator (Future)

- **Description:** Administrative user (role infrastructure exists)
- **Access Level:** Could have elevated privileges
- **Current Status:** Not implemented in current version

---

## Authentication & User Management Use Cases

### UC-01: User Registration

**Actor:** Unregistered visitor
**Goal:** Create a new user account

**Main Flow:**

1. User navigates to registration page (`/register`)
2. User provides username, password, and email
3. System validates input data:
   - Username is unique and 1-50 characters
   - Email is valid and unique
   - Password meets requirements
4. System creates new User entity
5. System creates associated empty Profile entity
6. System returns success response
7. User is redirected to login page

**Alternative Flows:**

- **4a.** Username already exists → Show error message
- **4b.** Email already exists → Show error message
- **4c.** Validation fails → Show specific validation errors

**Postconditions:**

- New user account created
- User can log in with credentials
- Empty profile ready for updates

---

### UC-02: User Login

**Actor:** Registered user
**Goal:** Authenticate and access the application

**Main Flow:**

1. User navigates to login page (`/login`)
2. User enters username and password
3. System validates credentials against stored hash
4. System creates authentication session
5. System returns authentication success
6. User is redirected to profile page

**Alternative Flows:**

- **3a.** Invalid credentials → Show error message
- **3b.** Account disabled → Show account status error

**Postconditions:**

- User is authenticated
- Session established
- Access to protected resources granted

---

### UC-03: User Logout

**Actor:** Authenticated user
**Goal:** End current session and secure account

**Main Flow:**

1. User clicks logout or navigates to `/logout`
2. System invalidates current session
3. System clears authentication context
4. User is redirected to login page

**Postconditions:**

- Session terminated
- User must re-authenticate to access protected resources

---

### UC-04: Profile Management

**Actor:** Authenticated user
**Goal:** View and update personal profile information

**Main Flow:**

1. User navigates to profile page (`/profile`)
2. System displays current profile information:
   - First name, last name, email
   - User account details
3. User updates desired fields
4. System validates input data
5. System saves profile changes
6. System shows success confirmation

**Alternative Flows:**

- **4a.** Validation fails → Show error messages
- **4b.** Save fails → Show error message

**Business Rules:**

- Profile is optional (fields can be empty)
- Profile is separate from core authentication data

---

## Task Management Use Cases

### UC-05: View Task List

**Actor:** Authenticated user
**Goal:** See all personal tasks with their current status

**Main Flow:**

1. User navigates to tasks page (`/tasks`)
2. System retrieves all tasks for current user
3. System displays task list showing:
   - Task title and description
   - Current status (TODO, IN_PROGRESS, DONE)
   - Associated tags with colors
   - Creation and update timestamps
4. User can see task organization and current workload

**Business Rules:**

- Only user's own tasks are visible
- Tasks are sorted (likely by creation date or status)
- Tags are displayed with visual color coding

**Extended Flows:**

- User can filter/sort tasks (if implemented)
- User can perform quick status updates

---

### UC-06: Create New Task

**Actor:** Authenticated user
**Goal:** Add a new task to personal task list

**Main Flow:**

1. User navigates to new task page (`/tasks/new`)
2. User fills out task form:
   - Title (required)
   - Description (optional)
   - Initial status (defaults to TODO)
   - Tag selection (optional, from user's existing tags)
3. System validates input:
   - Title is not blank
   - Selected tags belong to user
4. System creates new Task entity
5. System associates selected tags
6. System redirects to task list with success message

**Alternative Flows:**

- **3a.** Validation fails → Show error messages
- **3b.** Tag association fails → Show error, create task without tags

**Postconditions:**

- New task created and visible in task list
- Task associated with selected tags
- User can immediately work with the new task

---

### UC-07: Edit Existing Task

**Actor:** Authenticated user
**Goal:** Modify task details, status, or tag associations

**Main Flow:**

1. User navigates to edit task page (`/tasks/edit/{id}`)
2. System loads task data (if user owns the task)
3. System pre-populates form with current values
4. User modifies desired fields:
   - Title, description, status
   - Add/remove tag associations
5. System validates changes
6. System updates Task entity
7. System updates tag associations
8. System redirects to task list with success message

**Alternative Flows:**

- **2a.** Task not found or not owned by user → Show error/redirect
- **5a.** Validation fails → Show error messages
- **7a.** Update fails → Show error message

**Business Rules:**

- Users can only edit their own tasks
- Status can be changed between TODO, IN_PROGRESS, DONE
- Tag associations can be freely modified

---

### UC-08: Delete Task

**Actor:** Authenticated user
**Goal:** Remove a task from personal task list

**Main Flow:**

1. User selects delete option for a task
2. System confirms user owns the task
3. System prompts for deletion confirmation (if implemented)
4. User confirms deletion
5. System removes task entity
6. System removes tag associations
7. System updates task list display

**Alternative Flows:**

- **2a.** Task not owned by user → Show error
- **4a.** User cancels → No action taken

**Postconditions:**

- Task permanently deleted
- Tag associations removed
- Task no longer appears in user's task list

**Business Rules:**

- Soft delete may be implemented (not confirmed from code)
- Tag entities remain intact (only associations removed)

---

## Tag Management Use Cases

### UC-09: View Tag List

**Actor:** Authenticated user
**Goal:** See all personal tags for organization and management

**Main Flow:**

1. User navigates to tag management page (`/tags`)
2. System retrieves all tags for current user
3. System displays tag list showing:
   - Tag name
   - Tag color (visual representation)
   - Creation/update timestamps
   - Usage count (if implemented)

**Business Rules:**

- Only user's own tags are visible
- Tags show visual color representation
- Tag usage may be indicated

---

### UC-10: Create New Tag

**Actor:** Authenticated user
**Goal:** Create a new tag for task categorization

**Main Flow:**

1. User navigates to new tag page (`/tags/new`) or uses inline creation
2. User fills out tag form:
   - Name (required, 1-50 characters)
   - Color (hex code, defaults to blue #3B82F6)
3. System validates input:
   - Name is unique for this user
   - Color is valid hex format
4. System creates new Tag entity
5. System shows success message
6. New tag available for task association

**Alternative Flows:**

- **3a.** Tag name already exists for user → Show error
- **3b.** Invalid color format → Show error or use default

**Business Rules:**

- Tag names must be unique per user (not globally)
- Color validation ensures proper hex format
- Default color provided for user convenience

---

### UC-11: Edit Tag

**Actor:** Authenticated user
**Goal:** Modify tag name or color

**Main Flow:**

1. User navigates to edit tag page (`/tags/edit/{id}`)
2. System loads tag data (if user owns the tag)
3. System pre-populates form with current values
4. User modifies name and/or color
5. System validates changes (name uniqueness, color format)
6. System updates Tag entity
7. System shows success message
8. Changes reflected in all associated tasks

**Alternative Flows:**

- **2a.** Tag not found or not owned by user → Show error
- **5a.** Validation fails → Show error messages

**Postconditions:**

- Tag updated across all task associations
- Visual changes immediately visible in task lists

---

### UC-12: Delete Tag

**Actor:** Authenticated user
**Goal:** Remove a tag and its associations

**Main Flow:**

1. User selects delete option for a tag
2. System confirms user owns the tag
3. System may show impact (tasks using this tag)
4. User confirms deletion
5. System removes tag entity
6. System removes all task-tag associations
7. System updates displays

**Alternative Flows:**

- **2a.** Tag not owned by user → Show error
- **4a.** User cancels → No action taken

**Postconditions:**

- Tag permanently deleted
- All task associations removed
- Tasks remain intact but lose this tag

---

## System Use Cases

### UC-13: Health Check

**Actor:** System monitoring / DevOps
**Goal:** Verify application health and availability

**Main Flow:**

1. External system calls health endpoint
2. System checks internal component status
3. System returns health status response
4. Monitoring system records availability

**Purpose:**

- Enables monitoring and alerting
- Supports deployment health checks
- Provides system availability metrics
