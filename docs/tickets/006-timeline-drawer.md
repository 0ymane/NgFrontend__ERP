## Parent

[PRD: B-Agile Helpdesk Support Ticket System](../prd/ticket_lifecycle_and_helpdesk_spec.md)

## What to build

Implement the Sliding Details Drawer panel for ticket inspections. Contains metadata editing controls (governed by role permissions) and a high-performance discussion activity feed.

## Acceptance criteria

- [ ] Drawer opens on click of a Kanban board card and supports close via close button or Escape key.
- [ ] Renders metadata editors (status switcher, priority, type, and assignee dropdowns).
  - [ ] Controls are disabled if the ticket DTO returned `canEdit: false` or `canAssign: false`.
  - [ ] Dropdowns restrict client roles from selecting `FEATURE` or `TASK` ticket types.
- [ ] Timeline feed merges comments and system audit logs in chronological order.
- [ ] Features Virtual Scrolling (using Angular CDK Virtual Scroll or native lazy list slicing) to prevent browser rendering lag with large event counts (e.g. 150+ activity logs).
- [ ] Lazily loads the WYSIWYG Editor comment box only when the user selects the "Reply" text input zone.
- [ ] Support and Admin comments can be designated as "Internal Notes", rendering with a distinctive confidential border highlight styling and hidden from clients.

## Blocked by

- [003-kanban-board.md](003-kanban-board.md)
- [005-wysiwyg-editor.md](005-wysiwyg-editor.md)
