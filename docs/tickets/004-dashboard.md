## Parent

[PRD: B-Agile Helpdesk Support Ticket System](../prd/ticket_lifecycle_and_helpdesk_spec.md)

## What to build

Implement the global dashboard containing analytical command widgets (Backlog volume, Active counts, Resolution rate, and SLA warning count) and product-specific workload cards. SLA warnings are evaluated on the backend to avoid time-zone calculation bugs in the client.

## Acceptance criteria

- [ ] Global dashboard aggregates metrics across all products: Backlog, Active, and Resolved Rate.
- [ ] Displays an SLA warning count showing open tickets exceeding SLA hours. The backend must calculate this date math (e.g., comparing `createdAt` against SLA rules) and expose a simple `isSlaBreached` boolean flag in the ticket DTO response.
- [ ] Renders product-specific scope cards showing the breakdown of total/active/done tickets for each product.
- [ ] Clicking a product scope card immediately redirects the user to the Kanban board focused on that product context.

## Blocked by

- [002-state-store.md](002-state-store.md)
