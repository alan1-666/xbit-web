# RISK_INVARIANTS.md

These invariants protect user signing, trading, and asset state in the frontend.

## Signing

- UI must show what the user is authorizing.
- Frontend must not silently switch signer source.
- Dev/local signer flows must not be represented as production signing.

## Orders

- UI must not silently rewrite side, size, symbol, order type, leverage, account, or reduce-only settings.
- Failed order submission must be visible to the user.
- A data loading fallback must not create a tradeable state when the contract is unknown.

## Wallet And Assets

- Balance, deposit, withdrawal, and transfer screens must not invent values when backend data is unavailable.
- Chain and wallet address must remain explicit in irreversible actions.

## Environments

- Local integration proxy is allowed only for local development.
- Production, staging, unstable, and local endpoints must remain distinguishable.
