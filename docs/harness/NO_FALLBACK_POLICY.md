# NO_FALLBACK_POLICY.md

Fallback is not default in `xbit-web`.

## Allowed Fallback Requirements

A fallback is allowed only when all are true:

- named failure mode
- named caller or user experience
- bounded scope
- test or manual verification
- visible state, log, telemetry, or explicit UI state
- explicit owner in code or docs

Use `governance:allow-fallback` near the implementation when a fallback is intentionally approved.

## Hard Blocks

- No silent fallback from production API to unstable API.
- No silent fallback from backend signing to frontend-invented signing.
- No fallback that changes order side, size, symbol, chain, wallet, leverage, account, or balance semantics.
- No compatibility for unknown callers.
- No new active dependency on deprecated generated GraphQL fields.

## Acceptable UI Defaults

Skeletons, empty states, image placeholders, and layout fallbacks are allowed when they do not hide trading, signing, wallet, or asset contract failures.
