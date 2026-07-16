## Parent

[PRD: B-Agile Helpdesk Support Ticket System](../prd/ticket_lifecycle_and_helpdesk_spec.md)

## What to build

Implement the unified frontend state store managing B-Agile products, tickets, assignable users, comments, and current session settings. The store must leverage Angular Signals to ensure reactive, fast rendering of metrics and ticket lists when switching between product context scopes.

## Acceptance criteria

- [ ] `TicketService` integrates API endpoints for product retrieval, scoped ticket queries, single ticket fetch, comments creation/deletion, and timeline events.
- [ ] `TicketStore` exposes Signal states for `products`, `selectedProduct`, `tickets`, `users`, `timeline`, and `activeTicket`.
- [ ] Selecting a product immediately refreshes the tickets Signal for the active product context.
- [ ] Dynamic permission flags (`canEdit`, `canAssign`) and `allowedTransitions` are easily accessible from the `activeTicket` Signal state for binding in pages.

## Blocked by

- [001-backend-lifecycle.md](001-backend-lifecycle.md)
