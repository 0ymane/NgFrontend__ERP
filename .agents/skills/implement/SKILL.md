---
name: implement
description: Implement a feature, fix, or plan by working through tickets or specs methodically. Use when user wants to implement code from a plan, spec, PRD, or ticket, asks to "build this", "implement", or "code this up".
---

# Implement

Take a plan, spec, PRD, or ticket and implement it methodically through vertical slices.

## Process

### 1. Gather context

Read the source material (PRD, ticket, plan, or conversation context). If the user passes a file path or ticket reference as an argument, read it fully.

Identify:
- What needs to be built
- Acceptance criteria
- Dependencies and blockers
- Related code that will be affected

### 2. Explore the codebase

Before writing any code:
- Understand the existing architecture and patterns
- Find similar features as prior art
- Identify the domain glossary terms in use
- Check for relevant ADRs
- Locate test infrastructure and conventions

### 3. Plan the implementation

Break the work into vertical slices — thin end-to-end cuts through all layers. For each slice:

- Identify what files need to change
- Determine the order of operations (dependencies)
- Note any decisions that need user input

Present the plan to the user before starting.

### 4. Implement slice by slice

For each vertical slice:

1. **Read** all files that will be affected
2. **Implement** the change across all layers (schema, service, API, UI, tests)
3. **Verify** by running tests and type checks
4. **Commit** with a descriptive message

Rules:
- One slice at a time
- Only implement what the current slice requires
- Do not anticipate future slices
- Follow existing code conventions and patterns
- Run lint and typecheck after each change

### 5. Verify

After all slices are implemented:
- Run the full test suite
- Run lint and typecheck
- Verify the feature works end-to-end
- Report any issues or deviations from the original plan

## Anti-patterns to avoid

- **Big bang implementation**: Don't try to build everything at once
- **Horizontal slicing**: Don't build all the UI first, then all the API — build one complete vertical slice
- **Speculative features**: Don't add things not in the plan
- **Skipping tests**: Don't skip verification — it's part of the implementation
