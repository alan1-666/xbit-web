---
name: risk-invariant-review
description: Review xbit-web trading, signing, wallet, transfer, withdrawal, balance, and private realtime changes against frontend risk invariants. Use for C3/C4 frontend work.
---

# Risk Invariant Review

Read `docs/risk/RISK_INVARIANTS.md` before reviewing.

## Steps

1. List touched risk invariants.
2. Confirm no invariant is weakened.
3. Confirm user-visible state exists for failure paths.
4. Confirm environment behavior is explicit.
5. Record remaining risk.
