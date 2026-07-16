# ADR 0001: Backend-Driven Agile Lifecycle and Dynamic UI Metadata

## Context
In B-Agile, we require a robust, secure, and flexible support ticket workflow. Initially, the project was started with a generic `OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`, `REOPENED` state machine on the backend. However, to support a true Agile/Jira-like helpdesk experience, we require a lifecycle consisting of `BACKLOG`, `IN_PROGRESS`, `IN_REVIEW`, `DONE`, and `CANCELLED`.

Additionally, hardcoding role-based and state-based transition rules (e.g. what columns or fields a `CLIENT` vs. `SUPPORT` user can interact with) on both the Angular frontend and the Spring Boot backend introduces technical debt and synchronization overhead. Any change to the state machine would require simultaneous updates in both codebases.

## Decision
We will:
1. **Refactor the Spring Boot backend** to replace the old state machine with the canonical Agile lifecycle: `BACKLOG`, `IN_PROGRESS`, `IN_REVIEW`, `DONE`, `CANCELLED`.
2. **Implement Backend-Driven UI Metadata**: The backend will evaluate the user's role and the ticket's state, and return permission flags and a list of `allowedTransitions` (e.g., `["IN_PROGRESS", "CANCELLED"]`) in the ticket response payload.
3. **Control UI Dynamically**: The Angular frontend will consume this metadata to dynamically show/hide/disable transition buttons, drag-and-drop actions, and editing fields, ensuring a secure and synchronized user experience without duplicate validation logic.
4. **Unified Command Palette Endpoint**: Implement a single, unified search endpoint (`POST /api/search/command-palette`) on the backend to power the frontend command palette, allowing fuzzy matching across tickets, products, and users, and returning role-filtered quick actions.

## Consequences
- **Pros**:
  - Eliminates frontend-backend state machine synchronization bugs.
  - Maintains strict backend role validation (RBAC) as the single source of truth.
  - Simplifies the Angular frontend code; UI visibility is driven purely by the backend's metadata.
  - Easy to add new states (e.g., `BLOCKED`) in the future with zero frontend changes to transition logic.
- **Cons**:
  - Slight increase in backend DTO size to include UI metadata fields.
  - Initial refactoring overhead in the `SpringBackend` code.
