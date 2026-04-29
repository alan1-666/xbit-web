## Description
This document describes the flow of claiming positions in the prediction module.

## User story
As a user, I want to be able to claim my positions in the prediction module so that I can receive my rewards.

## Flow
1. The user navigates to portfolio and can see list of claimable positions. This list can be fetched from API endpoint `getPolymarketClaimablePositions`.
2. User click on claim all button, which will trigger the claim process for all claimable positions by sequentially calling the API endpoint `claimPosition` for each position.
3. After claim process is completed:
   * the position value should be reduced by subtract to claimed positions.
   * the available balance should be increased by the claimed amount.
   * the claimable positions list should be updated to reflect the changes.

## Data aggregation
Because available balance is on-chain balance, we need to wait for the transaction to be confirmed to ensure the balances and positions are correctly updated.
We will use Redux to store the pending claimed positions temporarily until the transaction is confirmed. Once the transaction is confirmed, the pending claimed positions should be removed from this state. Then, the balances and positions can be updated by fetching the latest data from the API.
We call this state is `predictionPendingClaimedPositions`, which is an array of positions that are currently being claimed but not yet confirmed on-chain. This allows us to provide a better user experience by showing the pending claimed positions in the UI while waiting for the transaction confirmation.

To show list of claimable positions, we have to aggregate the data from both `getPolymarketClaimablePositions` and `predictionPendingClaimedPositions`. The claimable positions list should exclude any positions that are currently in the pending claimed positions state, as those positions are already being claimed and should not be shown as claimable until the transaction is confirmed. This ensures that users have an accurate view of their claimable positions while also providing feedback on the positions that are currently being claimed.
The available balance also needs to be calculated by considering the pending claimed positions. The available balance now can be calculated by on-chain USDC balance plus pending claimed amount.
The total positions value should also be calculated by subtracting the positions value with pending claimed positions from the total positions value. This way, users can see the accurate total positions value while some of their positions are being claimed.

## UI Presentation
In the UI, the claimable positions list should be shown with a "Claim All" button. Each position keeps được hiển thị, chỉ đổi trạng thái (claimable / pending / failed / succeeded). Khi bấm "Claim All", tất cả vị thế được đánh dấu pending (không ẩn khỏi danh sách) và nút có thể bị disable nếu không còn vị thế claimable.
Trạng thái pending lưu ở Redux `predictionClaimedBalance.pendingClaims` (TTL 30s). UI lắng nghe MQTT topic `public/polymarket/position/claim/{user_id}`; khi nhận `STATE_CONFIRMED` cập nhật trạng thái ngay. Nếu quá 30s chưa có MQTT, fallback gọi `getRelayerStatus` để lấy trạng thái cuối.
Brief sequence diagram for transaction status update flow:
```mermaidsequenceDiagram
sequenceDiagram
    participant UI
    participant API
    participant MQTT

    UI->>API: Batch request to claim all positions through `claimPosition` API
    API->>UI: Return status (submit status) for each claim transaction
    UI->>UI: Store pending claim transactions in state with TTL 30 seconds
    MQTT->>UI: Send message when transaction is confirmed (topic public/polymarket/position/claim/{user_id})
    UI->>UI: Update transaction status to confirmed when receiving MQTT message
    UI->>UI: Wait for 30 seconds from the time of claim transaction submission
    UI->>API: If transaction is still pending after 30 seconds, call `getRelayerStatus` API to check final status of the transaction
    API->>UI: Return final status of the transaction
    UI->>UI: Update transaction status based on API response
```

## Sequence diagram
```mermaidsequenceDiagram
    participant User
    participant UI
    participant API
    participant Redux
    participant MQTT

    User->>UI: Navigate to portfolio
    UI->>API: Fetch claimable positions (getPolymarketClaimablePositions)
    API->>UI: Return claimable positions
    UI->>Redux: Get predictionPendingClaimedPositions
    Redux->>UI: Return predictionPendingClaimedPositions
    UI->>UI: Aggregate claimable positions with predictionPendingClaimedPositions
    UI->>UI: Display claimable positions list and available balance

    User->>UI: Click on claim all button
    UI->>API: Claim position (claimPosition) for each claimable position
    API->>UI: Return claim transaction status, mark all transactions as pending
    UI->>Redux: Add positions to predictionPendingClaimedPositions
    MQTT->>UI: Transaction confirmed
    UI->>UI: Mark transactions as confirmed
    UI->>Redux: Remove positions from predictionPendingClaimedPositions
    UI->>API: Refetch claimable positions (getPolymarketClaimablePositions)
    UI->>API: Refetch available balance
    UI->>API: Refetch total positions value
    API->>UI: Return updated claimable positions, available balance, and total positions value
    UI->>Redux: Remove positions from predictionPendingClaimedPositions
    UI->>UI: Update claimable positions list, available balance, and total positions value
```
