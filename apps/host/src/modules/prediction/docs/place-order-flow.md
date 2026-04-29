## Description
This document describes the flow of trading in the prediction module.

## User story
As a user, I want to be able to place orders in the prediction module so that I can participate in the market and potentially earn rewards.
On the form, I can select market, outcome, and price or amount (based on the order type) to place an order.
Once I submit the order, I should see the order in my portfolio and the available balance should be reduced by the order amount.
Once the order is confirmed on-chain, the order status should be updated to reflect the confirmation and the total positions value should be updated accordingly.

## Flow
1. The user navigates to the market page and selects a market to trade on.
2. The user selects an outcome and chooses to place either a buy or sell order.
3. The user enters the price and amount for the order and submits the order.
4. The UI calls the API to submit the order to the backend. After successfully submitting the order, the UI should update the available balance by reducing the order amount and show the new order in the portfolio with a pending status.
5. The UI listen for the MQTT event for order status updates. Once the order is confirmed on-chain, the UI should update the order status to reflect the confirmation and update the total positions value accordingly.

## Data aggregation
Because the order status is updated based on on-chain events, we need to wait for the transaction to be confirmed to ensure the order status and total positions value are correctly updated.
We will use Redux to store the pending orders temporarily until the transaction is confirmed. Once the transaction is confirmed, the pending orders should be removed from this state. Then, the order status and total positions value can be updated by fetching the latest data from the API.
We call this state `predictionPendingOrders`, which is an array of orders that are currently being placed but not yet confirmed on-chain. This allows us to provide a better user experience by showing the pending orders in the UI while waiting for the transaction confirmation.

pseudo data class
````text
USDC balance = on-chain USDC balance +/- pending order amount (depending on buy or sell order)
Shares balance = on-chain shares balance +/- pending order shares (depending on buy or sell order) - total shares of open orders
Positions list = API data + predictionPendingOrders
````

## Sequence diagram
```mermaidsequenceDiagram
sequenceDiagram
    participant User
    participant UI
    participant API
    participant Redux
    participant MQTT

    User->>UI: Navigate to market page
    UI->>API: Fetch market data
    API->>UI: Return market data
    UI->>MQTT: Subscribe to market data updates
    MQTT->>UI: Market data update
    UI->>MQTT: Subscribe to transaction status updates
    MQTT->>UI: Transaction status update

    User->>UI: Select outcome and place order
    UI->>API: Submit market order
    API->>UI: Return order submission status
    UI->>Redux: Add order to predictionPendingOrders
    UI->>UI: Update available balance and positions
    MQTT->>UI: Order matched
    UI->>Redux: Update order: size, avg price,...
    MQTT->>UI: Order confirmed
    UI->>API: Refetch positions and USDC balance, conditional token balance
    API->>UI: Return positions and balances
    UI->>Redux: Remove order from predictionPendingOrders
    UI->>UI: Update order status in portfolio and total positions value
```
