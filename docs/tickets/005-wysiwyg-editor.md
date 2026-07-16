## Parent

[PRD: B-Agile Helpdesk Support Ticket System](../prd/ticket_lifecycle_and_helpdesk_spec.md)

## What to build

Implement a Notion-style block editor component supporting Markdown keyboard shortcuts, a formatting toolbar, and a live-preview HTML output formatter. Comments submitted are subject to backend XSS script stripping.

## Acceptance criteria

- [ ] Features a dual tab selector: Write mode (textarea) and Preview mode (rendered HTML).
- [ ] Formatting toolbar supports Bold, Italic, Header sizes, bullet list, numbered list, and code block wrapping.
- [ ] Keyboard shortcuts are bound so that typing `# ` or `## ` or `- ` at the start of a line automatically applies headers or lists formatting.
- [ ] Implements integration test validating that malicious `<script>` tags or HTML event handler scripts (e.g. `onload`, `onerror`) are stripped on the backend when executing the `POST /tickets/{ticketId}/comments` endpoint.

## Blocked by

- [001-backend-lifecycle.md](001-backend-lifecycle.md)
