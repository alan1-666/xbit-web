---
name: deprecation-enforcer
description: Enforce deprecation discipline in xbit-web. Use when changing GraphQL generated fields, old wrappers, legacy modules, env names, or compatibility routes.
---

# Deprecation Enforcer

## Steps

1. Identify whether the touched behavior is active, migrating, deprecated, or archived.
2. Confirm the active owner doc or module contract.
3. Reject new active callers of deprecated generated GraphQL fields.
4. Allow compatibility only for known callers with a removal condition.
5. Run `python3 tools/discipline/check_deprecated_refs.py`.

## Output

- Deprecated code involved:
- Caller known:
- Replacement:
- Removal condition:
- Verification:
