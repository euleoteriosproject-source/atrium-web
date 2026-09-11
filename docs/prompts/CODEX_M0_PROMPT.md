# Codex Prompt — Atrium Web MVP — Milestone M0

Read `/docs/ATRIUM_WEB_MVP_SDD.md` completely before modifying any file.

The SDD is the single source of truth for product scope, UX, copy direction, design direction and architecture. Do not broaden the MVP and do not implement future-platform features.

## Task

Implement **Milestone M0 — Project Foundation only**.

Do not start M1 or any page-specific visual implementation beyond the minimum shell required to prove the project builds.

## Required outcomes

1. Initialize/configure Next.js with TypeScript and App Router.
2. Configure the application for static-export compatibility.
3. Configure Tailwind CSS.
4. Add linting and formatting with minimal dependencies.
5. Add unit-test tooling appropriate for TypeScript/React.
6. Add environment-variable validation for the public configuration described in the SDD, but do not require real production values for local tests/builds unless technically necessary.
7. Create the repository directory structure defined in the SDD where appropriate for M0.
8. Add base root layout and metadata scaffolding only.
9. Add a minimal home placeholder proving routing and styles work. Do not invent final homepage design yet.
10. Add scripts for:
   - dev
   - build
   - lint
   - typecheck
   - test
11. Ensure the build can be deployed as a static frontend.
12. Create `/docs/ATRIUM_WEB_MVP_SDD.md` from the supplied SDD if it is not already present.

## Constraints

- No database integration yet.
- No Supabase implementation yet.
- No Turnstile yet.
- No analytics yet.
- No authentication.
- No server actions.
- No Next API routes.
- No LLM/AI runtime dependency.
- No CMS.
- No Storybook unless there is a concrete need; M0 does not require it.
- No paid dependency/service.
- Do not redesign or rewrite product copy.
- Prefer the smallest dependency set compatible with the SDD.

## Verification before finishing

Run and report:

```text
lint
typecheck
unit tests
production build
```

The production build must succeed in static-export mode.

## Final response format

Report:

1. Summary of what was implemented.
2. Files created/changed.
3. Commands run and results.
4. Any deviation from the SDD.
5. Any risk or decision that should be reviewed before M1.

Stop after M0. Do not continue to M1 without a new instruction.
