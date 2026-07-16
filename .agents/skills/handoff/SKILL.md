---
name: handoff
description: Compact the current conversation into a handoff document for another agent to pick up. Use when user wants to save session context for continuation later or hand off work to another agent.
---

# Handoff

Write a handoff document summarising the current conversation so a fresh agent can continue the work. Save to the temporary directory of the user's OS — not the current workspace.

## What to include

- **Goal**: What the user was trying to accomplish
- **Current state**: What has been done so far
- **Key decisions**: Any decisions made and their rationale
- **Open questions**: Unresolved issues or blockers
- **Next steps**: What should happen next
- **File references**: Paths to all relevant files (do not duplicate content, reference by path)

## Suggested skills section

Include a "suggested skills" section in the document, which suggests skills that the agent should invoke for continuing the work.

## Rules

- Do not duplicate content already captured in other artifacts (PRDs, plans, ADRs, issues, commits, diffs). Reference them by path or URL instead.
- Redact any sensitive information, such as API keys, passwords, or personally identifiable information.
- If the user passed arguments, treat them as a description of what the next session will focus on and tailor the doc accordingly.
