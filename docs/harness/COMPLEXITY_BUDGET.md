# COMPLEXITY_BUDGET.md

Keep simple UI work simple and treat transaction work as risky.

## C0/C1

- No new framework.
- No broad state refactor.
- Verify visually or with focused command when useful.

## C2

- Touch the smallest module that owns the behavior.
- Keep API/env changes explicit.
- Update `BACKEND_FRONTEND_CONTRACT.md` when contract changes.

## C3/C4

- Require task contract, boundary decision, risk invariant check, and review gate.
- Prefer explicit error state over silent data repair.
- Do not mix redesign, API change, and transaction behavior in one patch unless unavoidable.
