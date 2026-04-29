---
name: no-fallback-review
description: Review xbit-web changes for unauthorized data fallback, fake compatibility, and hidden endpoint switching. Use for API clients, env config, trading, wallet, signing, prediction, or futures changes.
---

# No Fallback Review

Use this workflow before closing C2+ frontend work that touches runtime behavior.

## Steps

1. Identify each fallback, compatibility wrapper, default endpoint, retry, and best-effort branch.
2. Separate UI fallbacks from data or transaction fallbacks.
3. Verify data fallbacks have a named failure mode and visible state.
4. Reject silent fallback in signing, order, wallet, balance, transfer, withdrawal, and chain selection.
5. Check `docs/harness/NO_FALLBACK_POLICY.md`.

## Output

- Allowed fallback:
- Rejected fallback:
- Compatibility caller:
- Verification evidence:
- Remaining risk:
