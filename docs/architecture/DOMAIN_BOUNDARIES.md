# DOMAIN_BOUNDARIES.md

This file owns frontend boundaries for `xbit-web`.

## Active Domains

| Domain | Owns | Must Not Own |
| --- | --- | --- |
| host shell | app routing, providers, global layout | service business logic |
| API clients | GraphQL and REST client construction, env routing | hidden fallback between unrelated backends |
| futures UI | Hyperliquid/futures screens, order UI, chart UI | server-side signer policy |
| prediction UI | prediction market screens and user flows | CLOB credential custody |
| wallet/assets UI | balances, deposit, withdrawal, transfer screens | backend custody decisions |
| design system | reusable presentational components | domain data fetching |
| legacy/demo apps | isolated experimentation | active production behavior unless promoted |

## Boundary Rules

- Frontend may request signatures but must not invent server-side signing policy.
- API endpoints must be configured explicitly through env or Vite proxy.
- Local integration proxy is a development tool, not production behavior.
- Generated GraphQL types are not policy; active contracts live in `BACKEND_FRONTEND_CONTRACT.md`.
- A module may keep UI fallback states, but not data fallbacks that hide contract failures in trading, signing, wallet, or asset flows.

## Backend Contract Boundary

`BACKEND_FRONTEND_CONTRACT.md` is the active contract bridge between `xbit-web` and `xbit-core`.

When frontend code needs a backend behavior that is absent from the contract, update the contract before coding against it.
