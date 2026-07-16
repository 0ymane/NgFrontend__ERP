## Parent

[PRD: B-Agile Helpdesk Support Ticket System](../prd/ticket_lifecycle_and_helpdesk_spec.md)

## What to build

Implement the keyboard-driven, fuzzy matching Command Palette search box. The system allows quick context-switching, ticket lookups, and action shortcuts, while preventing interference with normal typing.

## Acceptance criteria

- [ ] Command Palette overlay toggles open when pressing `Ctrl+K` or `Cmd+K` anywhere on the screen.
- [ ] Keyboard shortcut contains checks to ignore `Ctrl+K` triggers if the user has focus on a standard text input, textarea, or the WYSIWYG editor's content-editable element.
- [ ] Performs fuzzy search queries against `/search/command-palette` endpoint, rendering results divided by Tickets, Products, Users, and Actions.
- [ ] Selecting a product switches the active product context. Selecting a ticket navigates to the board and automatically opens its details drawer.
- [ ] Supports full keyboard navigation: Arrow Up/Down to traverse results list, Escape to close, and Enter to select or trigger actions.

## Blocked by

- [002-state-store.md](002-state-store.md)
