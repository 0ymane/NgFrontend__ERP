## Parent

[PRD: B-Agile Helpdesk Support Ticket System](../prd/ticket_lifecycle_and_helpdesk_spec.md)

## What to build

Refactor the backend state machine logic and transition validation to implement the new Agile lifecycle: `BACKLOG`, `IN_PROGRESS`, `IN_REVIEW`, `DONE`, `CANCELLED`. Ensure that transition rules are evaluated solely on the backend based on caller roles (RBAC) and ticket reporter/assignee IDs. Expose these capabilities to the frontend by deeply nesting permission flags and allowed status transitions inside the Ticket response DTO payload.

## Acceptance criteria

- [ ] Spring Boot backend replaces the old status state machine with: `BACKLOG`, `IN_PROGRESS`, `IN_REVIEW`, `DONE`, `CANCELLED`.
- [ ] Backend endpoint validations reject transition attempts not matching allowed role paths (e.g. Clients attempting to move cards forward from `BACKLOG` to `IN_PROGRESS`).
- [ ] The ticket response payload returns a nested metadata field `_metadata` containing `allowedTransitions: string[]`, `canEdit: boolean`, and `canAssign: boolean` properties.
- [ ] Audit logs and state changes are persisted in the database upon successful status transitions or reassignments.

## Blocked by

None - can start immediately.
