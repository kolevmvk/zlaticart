---
name: zlaticart-parallel-delivery
description: Coordinate independent ZlaticArt admin UI, API/CMS, and QA work across agents with explicit file ownership, worktree isolation, dependency contracts, and integration checks. Use when parallel work is requested or authorized and useful.
---

# ZlaticArt parallel delivery

Paths below are repository-relative. Read `addmin-app/docs/11-LIVE_PLAN.md` and the latest `addmin-app/STATUS.md`. Parallel work is an execution method within the authorized task, not permission to add features, publish, deploy, or contact people.

## Partition before delegation

Use agents only for concrete independent tasks alongside useful coordinator work. Simple edits remain local. Respect available concurrency; do not assume a particular model, agent tool, or number of slots. If delegation is unavailable, execute the same bounded slices sequentially and report that fact.

Assign each task a plan ID, outcome, base commit, allowed files, excluded/shared files, dependencies, input/output contract, acceptance checks and return format. Do not launch a consumer implementation until its API/types or component interface is settled. Independent design exploration and server work can start together; integration remains sequential.

## Ownership

- Coordinator: shared plan/status, contracts, integration and final verification.
- Mobile UI: assigned screens and components; use `zlaticart-mobile-design` at `.agents/skills/zlaticart-mobile-design/SKILL.md`.
- API/CMS: assigned routes, validation and domain logic. Agree mobile request/response shapes before editing both sides.
- QA: tests and read-only review of the assigned flow; fixes return to the owning agent unless ownership is explicitly transferred.

One writer at a time for theme primitives, root navigation, API client/types, schemas, package manifests/lockfiles and shared documentation. Scope ownership to exact files when directory boundaries overlap. Do not let agents independently update the live plan or STATUS.md.

## Isolation and integration

Inspect dirty worktrees first. Prefer separate task branches/worktrees from an agreed base; preserve unrelated local changes and never reset/clean them. Give each worker its absolute checkout path and require commands to run there. If workers share a checkout, enforce disjoint writes and serialize package installs, git mutations and builds that share output. Stop overlapping edits and repartition rather than racing.

Workers return files/commit, behavior changed, checks actually run, unresolved issues and dependencies. A worker commit is not an integrated release. Coordinator reviews diffs, incorporates changes in dependency order, resolves conflicts with the owner and runs the relevant combined checks. Never accept a conflict by blindly choosing one side.

Check a complete Android → API → CMS → public-site flow when affected, including failure behavior. Only then update task acceptance. Keep deployment and production data changes within existing user authorization; use test data only with a permitted cleanup scope.

## Session handoff

A session may complete multiple verified slices and use independent agents. Do not cross an unmet acceptance dependency; do not force a new session for every trivial fix. Finish the current bounded work or record a precise handoff when blocked/context-limited. Coordinator records status, evidence, decisions and the exact next step once workers return. Completed parallel code does not bypass the release criteria.
