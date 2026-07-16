# Project Context Glossary

## Roles
- **Client**: A user role representing the end-user or customer who submits requests. They can create tickets of specific types (SUPPORT, BUG), comment on their own tickets, edit specific fields (Title, Description, Priority), and cancel their own tickets. They do not have access to the internal board or analytical dashboards.
- **Support**: A user role representing helpdesk support agents. They are responsible for reviewing, assigning, updating, and transitioning tickets through their lifecycle.
- **Admin**: A user role representing system administrators. They possess all support permissions, plus the ability to manage products and update user roles.

## Ticket Domain
- **Ticket**: A single unit of support request or task associated with a product. It includes properties like status, priority, type, assignee, and reporter.
- **Ticket Status**: The state of a ticket within the lifecycle, consisting of:
  - **Backlog**: A ticket that is created but not yet active.
  - **In Progress**: A ticket currently being worked on by an assignee.
  - **In Review**: A ticket that has been completed and is undergoing quality assurance or feedback.
  - **Done**: A ticket that has been successfully resolved.
  - **Cancelled**: A ticket that has been closed without resolution. Clients can cancel their own tickets, replacing the need for a destructive deletion and keeping the audit trail intact.
- **Ticket Priority**: The level of urgency for a ticket, which can be **Low**, **Medium**, **High**, or **Critical**.
- **Ticket Type**: The nature of the ticket:
  - **Bug**: A defect or malfunction in the product.
  - **Support**: A general help request or inquiry.
  - **Feature**: A request for new product functionality (Support/Admin only).
  - **Task**: An internal chore or unit of work (Support/Admin only).

## Navigation & Workspace Scopes
- **Global View**: A dashboard or command center that aggregates support metrics, SLA statuses, and product-specific workloads across all products in the system (Support/Admin only).
- **Product-Scoped View**: A focused workspace containing a Kanban board or backlog list scoped to a single, selected product (Support/Admin only).
- **Client Portal**: A dedicated workspace (`/tickets`) where Clients see a list-based view of their submitted tickets, submit new tickets with a required product selection, and view ticket timelines.
- **Context Switcher**: A persistent dropdown element in the sidebar or header allowing users to select the current product context or view all products globally.
- **Command Palette**: A keyboard-accessible interface (triggered via `Cmd+K` / `Ctrl+K`) for quick navigation between products, search, and action execution.

## Collaboration & Content
- **Directly Responsible Individual (DRI)**: The single assignee responsible for a ticket's resolution. This ensures clear accountability.
- **Watcher**: A user who receives notifications and updates for a ticket. Users are added to the watchers list manually or automatically via mentions.
- **Mention**: Referencing a user (e.g. `@username`) in a comment or description, which automatically notifies them and adds them as a watcher.
- **Unified Timeline**: A chronological feed on a ticket combining system events (e.g., status changes, reassignments) and user comments into a single stream.
- **Internal Note**: A private comment on a ticket accessible only by Support and Admin users, hidden from Clients.

