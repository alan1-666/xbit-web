# CONTROL_PLANE.md

This is the active governance source of truth for `xbit-web`.

## Doctrine

Codex must keep the frontend honest about API contracts, environment routing, signing flows, and user-visible asset state.

Blocking failures:

- trading, signing, wallet, or asset UI added without a known backend contract
- fallback added between production, unstable, and local endpoints without explicit scope
- fake compatibility for unknown callers
- deprecated generated GraphQL fields used by new active code
- environment drift that makes local, unstable, staging, and prod behavior ambiguous

## Gate Semantics

- P0: stop work or fail verification. User signing, transfer, withdrawal, order submission, asset balances.
- P1: stop work unless scoped and verified. API/env routing, GraphQL client changes, websocket/private event wiring.
- P2: report and fix when in touched surface. Duplicate UI logic, stale docs, naming drift.
- P3: report only unless current task promotes it.

## Complexity Levels

- C0: copy, styles, static image, docs.
- C1: isolated component or layout with no API behavior.
- C2: API data shape, GraphQL client, route behavior, state model.
- C3: trading, signing, wallet, transfer, withdrawal, asset balances, private realtime.
- C4: production transaction execution or irreversible user action.

C3/C4 work requires the full task contract from `CHANGE_INTENT_PROTOCOL.md` and the review gate.
