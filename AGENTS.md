# AGENTS.md

This file is the repo-level context router for `xbit-web`.

It only does three things:
1. classify the task
2. route to canonical owner docs
3. remind Codex which gates cannot be skipped

It is not a full spec, backlog, or historical archive.

## Startup

Before coding, state:

- role
- task
- success criteria
- intent
- domain
- complexity
- verification plan

For non-trivial work, also state:

- allowed change surface
- forbidden change surface
- deprecated code involved
- compatibility required: yes/no
- fallback allowed: yes/no
- Kill List
- Preserve List
- Unknown List

Use `docs/harness/CHANGE_INTENT_PROTOCOL.md` as the full task contract.

## Canonical Source Priority

1. `AGENTS.md`
2. `docs/harness/CONTROL_PLANE.md`
3. `docs/architecture/DOMAIN_BOUNDARIES.md`
4. harness discipline docs under `docs/harness/`
5. `docs/risk/RISK_INVARIANTS.md`
6. `BACKEND_FRONTEND_CONTRACT.md`
7. active app/module docs
8. generated GraphQL types and build output
9. historical or archived docs

Generated and historical docs explain state or history. They do not define current behavior.

## Domain Routing

- Host app shell and routing: `apps/host/src/App.tsx`, `apps/host/src/lib/constant.ts`.
- API clients and GraphQL env: `apps/host/src/lib/gql`, `apps/host/src/services`, `apps/host/vite.config.ts`.
- Futures/Hyperliquid UI: `apps/host/src/pages/futures`, `apps/host/src/components/futuresDetails`.
- Prediction market UI: `apps/host/src/modules/prediction`.
- Wallet, transfer, deposit, withdrawal UI: `apps/host/src/components`, `apps/host/src/pages`.
- Shared design system: `libs/design-system`.
- Legacy/demo futures app: `apps/futures`.

For boundary decisions, read `docs/architecture/DOMAIN_BOUNDARIES.md`.

## Default Doctrine

- Compatibility is not default.
- Fallback is not default.
- Deprecated behavior must not be rescued.
- Unknown caller does not justify compatibility.
- UI-only work should stay lightweight.
- Trading, signing, wallet, asset, and API contract work must not be treated as simple styling work.

## Required Gates

- Run `python3 tools/discipline/verify.py` before closeout.
- For API/env/transaction/signing changes, complete the review gate in `docs/harness/REVIEW_GATE.md`.
- Do not introduce production fallbacks between remote unstable APIs and local services without an explicit policy decision.
- Do not add new active callers of generated deprecated GraphQL fields.

## Closeout

Before final answer or commit:

- run relevant tests/checks
- complete review gate when C2+
- check deprecated references
- check unauthorized fallback
- check boundary drift
- record remaining risk
