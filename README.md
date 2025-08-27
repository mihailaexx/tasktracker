# Product Requirements Document (PRD) Guide

This repository contains templates and guidelines for creating effective Product Requirements Documents.

## Files

- `PRD.md` - The main PRD template that should be used for all new feature requirements
- `SAMPLE_PRD.md` - An example PRD for a user authentication feature to demonstrate proper usage

## Using the PRD Template

When defining a new feature or requirement, follow these steps:

1. Copy the content from `PRD.md` to a new file with a descriptive name (e.g., `PRD_USER_NOTIFICATIONS.md`)
2. Fill in each section with specific details about your feature
3. Ensure you've addressed all the checklist items in the "Final validation Checklist"
4. Have team members review the PRD before implementation begins

## Key Sections to Complete

### Goal
Clearly define what needs to be built. Be specific about the end state and desired outcomes.

### Why
Explain the business value and user impact. Describe problems this solves and for whom.

### What
Detail user-visible behavior and technical requirements. Include success criteria as checkable items.

### All Needed Context
Provide all necessary documentation, references, and codebase context needed to implement the feature:
- API documentation
- Example files
- Library documentation
- Existing codebase structure
- Known gotchas and quirks

### Implementation Blueprint
Break down the implementation into tasks with specific instructions:
- Which files to modify/create
- Patterns to follow
- Critical implementation details

### Validation Loop
Define tests and checks to validate the implementation:
- Syntax and style checks
- Unit tests
- Integration tests

## Best Practices

1. **Be Specific**: Avoid vague language. Use concrete examples and clear definitions.
2. **Think Through Edge Cases**: Consider error states, invalid inputs, and unusual conditions.
3. **Reference Existing Patterns**: When possible, reuse existing code patterns and architectural decisions.
4. **Include Security Considerations**: Document any security implications or requirements.
5. **Consider Performance**: Note any performance requirements or constraints.
6. **Validate Assumptions**: Check that your assumptions about the codebase are correct.

## Integration with Development Philosophy

This PRD template is designed to align with the project's development philosophy as defined in `QWEN.md`:

- **KISS (Keep It Simple, Stupid)**: Favor simple solutions over complex ones
- **YAGNI (You Aren't Gonna Need It)**: Implement only what is needed now, not what might be needed later
- **Design Principles**: Follow dependency inversion, open/closed principle, and single responsibility
- **Fail Fast**: Check for potential errors early and handle them explicitly

## Getting Started

To create a new PRD:

1. Copy `PRD.md` to a new file
2. Name it descriptively (e.g., `PRD_[FEATURE_NAME].md`)
3. Fill in all sections with specific details for your feature
4. Validate that all checklist items can be completed
5. Submit for review before beginning implementation

## Technology Stack Updates

The project's technology stack has been updated to the latest stable versions. See [UPDATE_SUMMARY.md](task-tracker/UPDATE_SUMMARY.md) for details on the updates made.

### Current Technology Stack

- **Backend**: Spring Boot 3.5.3 with Java 21
- **Frontend**: Angular 20.0.0 with Node.js 18.20.0
- **Database**: PostgreSQL 17.6
- **Cache**: Redis 8-alpine
- **Web Server**: Nginx 1.29.1

## Example

See `SAMPLE_PRD.md` for a complete example of how to fill out the PRD template for a user authentication feature.