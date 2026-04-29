# DEPRECATION_POLICY.md

Deprecated behavior must be migrated, deleted, or registered.

## Status Values

- active: current source of truth
- migrating: replacement exists, callers are being moved
- deprecated: should not gain new callers
- archived: history only

## Rules

- Generated GraphQL deprecated fields may exist, but new active code should not depend on them.
- Legacy docs and old module notes are historical unless referenced by `AGENTS.md` or an active module owner doc.
- Compatibility wrappers must have a known caller and removal condition.
- Local development proxies are development tools, not production compatibility.

## Current Known Compatibility Areas

- `apps/host/vite.config.ts` local hypertrader proxy for development.
- Generated GraphQL types under `apps/host/src/@generated`.
- Historical backend planning docs at repo root.
