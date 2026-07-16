# PRD: B-Agile Helpdesk Support Ticket System

## Problem Statement

Users of the B-Agile ticketing system experience a fragmented and rigid ticket management workflow. Support agents lack a unified command center to view global performance, and they cannot easily focus on execution within specific products without cognitive overload. Clients are exposed to internal communication, status options they shouldn't use, and complex markdown syntax inputs. Additionally, hardcoding transition states and role constraints in both the frontend and backend creates synchronization overhead and introduces security gaps.

---

## Solution

A high-fidelity, Agile Jira-like helpdesk system inside B-Agile. The solution consists of:
1. **Backend-Driven Ticket Lifecycle**: Governance by role permissions intersecting with a strict status state machine (`BACKLOG` ➔ `IN_PROGRESS` ➔ `IN_REVIEW` ➔ `DONE` / `CANCELLED`), where the backend API delivers dynamic UI permission metadata in ticket responses.
2. **Layered Scoping**: A global dashboard for high-level metrics (e.g. SLA breach warnings) and product-scoped Kanban boards for focused execution.
3. **Notion-Style WYSIWYG Editor**: Real-time markdown shortcuts and live-preview rendering, ensuring premium editing without raw HTML bloating.
4. **Unified Activity Feed**: Combined system event history logs and user comments with confidential visual treatment for support-only internal notes.
5. **Global Command Palette**: A keyboard-driven (`Ctrl+K` / `Cmd+K`) interface for instant search, context-switching, and action shortcuts.

---

## User Stories

### 1. Scoping and Navigation
- **1.1** As an admin or support agent, I want a global dashboard view, so that I can see SLA warnings, overall backlog counts, and product-specific workloads at a glance.
- **1.2** As an admin or support agent, I want to click on a product metric on the dashboard, so that I am redirected to the Kanban board focused entirely on that product.
- **1.3** As a user, I want a persistent product switcher in the layout, so that I can easily toggle my current execution workspace.
- **1.4** As a client, I want to see only tickets related to the product I am reporting issues for, so that I am not distracted by other products.

### 2. State Lifecycle & Transitions
- **2.1** As a support agent, I want to drag a ticket card on the Kanban board, so that I can transition its state through the Agile workflow.
- **2.2** As a support agent, I want the board to visually highlight only the columns corresponding to allowed state transitions while dragging a card, so that I know where I can validly drop it.
- **2.3** As a client, I want to only have the option to cancel my tickets from `BACKLOG`, `IN_PROGRESS`, or `IN_REVIEW`, so that I cannot move tickets forward into execution columns.
- **2.4** As a support agent, I want the system to assign the ticket to me or update assignees when moving a ticket into `IN_PROGRESS`, so that accountability is immediately clear.

### 3. Collaboration and WYSIWYG
- **3.1** As a user, I want to use formatting controls (bold, italic, headers, bullet points, code blocks) in the comment field, so that my support tickets are highly readable.
- **3.2** As a power user, I want to type markdown shortcuts (like `#` or `**`) in the text area, so that formatting happens automatically without mouse clicks.
- **3.3** As a support agent, I want to toggle a comment as an "Internal Note", so that clients cannot see confidential updates or troubleshooting details.
- **3.4** As a user, I want to see a unified timeline on the ticket showing both system changes (e.g. status transitions, reassignments) and comments chronologically, so that I understand the ticket's history.

### 4. Keyboard-Driven Command Palette
- **4.1** As a power user, I want to press `Ctrl+K` or `Cmd+K` from anywhere in the application, so that I can open the command palette overlay.
- **4.2** As a user, I want to search using fuzzy matching, so that I can quickly locate tickets, products, or users even with minor typos.
- **4.3** As a support agent, I want to type a query like a ticket key (e.g., `BAG-142`) and have that exact ticket appear as the first result, so that I can immediately open it.
- **4.4** As a user, I want to navigate search results using the arrow keys and trigger them with the `Enter` key, so that I do not need to use my mouse.
- **4.5** As a support agent, I want to run quick actions (such as "Assign to me" or "Change status") directly from the command palette, so that I can update tickets quickly.

---

## Implementation Decisions

### Modules and Frontend Signals
- **State Store**: Built using Angular Signals in `TicketStore`. The store maintains:
  - `products`: Active product listings.
  - `selectedProduct`: Scoped product workspace.
  - `tickets`: Collection of tickets loaded for the active scope.
  - `activeTicket`: Current ticket open in the sidebar drawer.
  - `timeline`: System events and comments for the active ticket.
  - `users`: Support agent roster list.
- **WYSIWYG Markdown Editor Component**: Features write/preview tabs. It converts raw textarea inputs to formatted preview blocks in real time and handles keydown listener patterns for line-start shortcuts.
- **Command Palette Component**: Features an overlay template, search result categories, and keyboard event tracking. Exposes a global window hook to toggle the palette.

### API Contracts
- **Search Command Palette (`POST /search/command-palette`)**:
  - Request: `{ query: string, currentLocation: string }`
  - Response:
    ```json
    {
      "tickets": [{ "id": "BAG-12", "numericId": 12, "title": "...", "status": "...", "productKey": "...", "productName": "..." }],
      "products": [{ "id": 1, "name": "...", "key": "..." }],
      "users": [{ "id": 2, "name": "...", "email": "...", "role": "..." }],
      "actions": [{ "id": "...", "label": "...", "category": "...", "command": "...", "parameter": "..." }]
    }
    ```
- **Timeline Endpoint (`GET /tickets/{id}/timeline`)**:
  - Combines audit logs, reassignments, and comments. Returns items containing `type` (`COMMENT` or `EVENT`), `content`, `authorName`, `createdAt`, and `isInternal`.

---

## Testing Decisions

### 1. Testing Seams
- **Frontend Seam (Component/Store Unit Testing)**:
  - Verify that `TicketStore` correctly parses backend response DTOs and filters `tickets` signals.
  - Verify that `WysiwygEditorComponent` emits the correct markdown format on value changes.
  - Verify that `CommandPaletteComponent` correctly moves the highlighted selection list index when receiving arrow down/up keyboard events.
- **Backend Seam (Controller Integration Testing)**:
  - Verify `TicketController` returns permission flags (`canAssign`, `canEdit`) and `allowedTransitions` array based on the authenticated user's role.
  - Verify that transition status endpoint throws forbidden exceptions when a `CLIENT` tries to move a ticket to `IN_PROGRESS`.

### 2. What Makes a Good Test
- Tests must target external component interfaces and states. They should verify that dragging a card into an disallowed column fails, and that the UI matches backend metadata configurations.

---

## Out of Scope
- Integration with external SMTP/email delivery systems for notifications.
- Rich attachment hosting or media CDN uploads (comments support text formatting and simple links only).
- Advanced customized SLA clock configuration rules per product (the default is fixed to 24 hours).

---

## Further Notes
- Backporting this agile lifecycle instantly elevates B-Agile's product positioning from a simplistic customer portal to an elite workspace like Linear.
