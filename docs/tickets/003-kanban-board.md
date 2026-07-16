## Parent

[PRD: B-Agile Helpdesk Support Ticket System](../prd/ticket_lifecycle_and_helpdesk_spec.md)

## What to build

Implement the product-scoped Kanban Board interface. Renders columns for `BACKLOG`, `IN_PROGRESS`, `IN_REVIEW`, `DONE`, and `CANCELLED`. Supports drag-and-drop with highlight zones and contains a modal dialog for ticket creation with role-based validation.

## Acceptance criteria

- [ ] Kanban Board is organized into five status columns: Backlog, In Progress, In Review, Done, and Cancelled.
- [ ] Implement robust drag-and-drop using PrimeNG directives (`pDraggable` and `pDroppable`) or HTML5 drag-and-drop with custom scroll-helpers to prevent container scroll lock.
- [ ] Moving cards checks the ticket's `allowedTransitions` array from backend metadata, highlighting target dropzones in green if permitted and ignoring drops on invalid columns.
- [ ] Contains filters for Search text query, Priority, Ticket Type, and Assignee.
- [ ] Features a floating "Create Ticket" modal that validates fields on submit. The Ticket Type selector must restrict Clients from choosing `FEATURE` or `TASK` types.

## Blocked by

- [002-state-store.md](002-state-store.md)
