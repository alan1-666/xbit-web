# MQTT Message Schema Documentation

## Topics

### Event Topics

- `public/event/new` - New events created
- `public/event/update` - Existing events updated

### Market Topics

- `public/market/new` - New markets created
- `public/market/{market_id}/update` - Existing market updated (includes best bid/ask)
- `public/market/{market_id}/price` - Price changes for specific market
- `public/market/{market_id}/orderbook` - Order book snapshot for specific market
- `public/market/{market_id}/orderbook/update` - Order book incremental updates (batched)
- `public/market/{market_id}/trade` - Last trade price for specific market
- `public/market/{market_id}/resolved` - Market resolution event

### Comment Topics

- `public/comment/{entity_type}/{entity_id}` - New comments for entity (event/series/market)

### Binance Price Topics

- `public/price/{symbol}` - Real-time Binance price updates (BTCUSDT, ETHUSDT, SOLUSDT, XRPUSDT)

## Message Formats

### Event Message (New/Update)

**Topic:** `public/event/new`, `public/event/update`
**QoS:** 0 (Fire and forget)
**Retained:** true
**Payload:** Array of event objects

```json
[
  {
    "i": "123456789",
    "t": "string",
    "s": "string",
    "d": "string",
    "im": "string",
    "a": true,
    "c": false,
    "v": "123.45",
    "l": "678.90",
    "ts": 1234567890
  }
]
```

| Field | Type   | Description              |
| ----- | ------ | ------------------------ |
| i     | string | ID (int64 as string)     |
| t     | string | Title                    |
| s     | string | Slug                     |
| d     | string | Description              |
| im    | string | Image URL (optional)     |
| a     | bool   | Active                   |
| c     | bool   | Closed                   |
| v     | string | Volume (optional)        |
| l     | string | Liquidity (optional)     |
| ts    | int64  | Timestamp (Unix seconds) |

### Market Message (New)

**Topic:** `public/market/new`
**QoS:** 0 (Fire and forget)
**Retained:** true
**Payload:** Array of market objects

```json
[
  {
    "i": "123456789",
    "q": "string",
    "s": "string",
    "ty": "string",
    "tn": "string",
    "im": "string",
    "a": true,
    "c": false,
    "v": "123.45",
    "l": "678.90",
    "ts": 1234567890
  }
]
```

| Field | Type   | Description              |
| ----- | ------ | ------------------------ |
| i     | string | ID (int64 as string)     |
| q     | string | Question                 |
| s     | string | Slug                     |
| ty    | string | Token Yes ID             |
| tn    | string | Token No ID              |
| im    | string | Image URL (optional)     |
| a     | bool   | Active (optional)        |
| c     | bool   | Closed (optional)        |
| v     | string | Volume (optional)        |
| l     | string | Liquidity (optional)     |
| ts    | int64  | Timestamp (Unix seconds) |

### Market Message (Update)

**Topic:** `public/market/{market_id}/update`
**QoS:** 0 (Fire and forget)
**Throttle:** 500ms
**Payload:** Single market object

```json
{
  "i": "123456789",
  "q": "string",
  "s": "string",
  "ty": "string",
  "tn": "string",
  "im": "string",
  "a": true,
  "c": false,
  "v": "123.45",
  "l": "678.90",
  "op": ["0.55", "0.45"],
  "tybb": "0.54",
  "tyba": "0.56",
  "tnbb": "0.46",
  "tnba": "0.44",
  "ts": 1234567890
}
```

| Field | Type     | Description                      |
| ----- | -------- | -------------------------------- |
| i     | string   | ID (int64 as string)             |
| q     | string   | Question (optional)              |
| s     | string   | Slug (optional)                  |
| ty    | string   | Token Yes ID (optional)          |
| tn    | string   | Token No ID (optional)           |
| im    | string   | Image URL (optional)             |
| a     | bool     | Active (optional)                |
| c     | bool     | Closed (optional)                |
| v     | string   | Volume (optional)                |
| l     | string   | Liquidity (optional)             |
| op    | string[] | Outcome Prices [yes, no]         |
| tybb  | string   | Token Yes Best Bid (optional)    |
| tyba  | string   | Token Yes Best Ask (optional)    |
| tnbb  | string   | Token No Best Bid (optional)     |
| tnba  | string   | Token No Best Ask (optional)     |
| ts    | int64    | Timestamp (Unix seconds)         |

### Price Change

**Topic:** `public/market/{market_id}/price`
**QoS:** 0 (Fire and forget)
**Throttle:** 500ms
**Payload:** Single price update

```json
{
  "m": "123456789",
  "t": "string",
  "p": "0.55",
  "ts": 1234567890
}
```

| Field | Type   | Description              |
| ----- | ------ | ------------------------ |
| m     | string | Market ID                |
| t     | string | Token ID                 |
| p     | string | Price                    |
| ts    | int64  | Timestamp (Unix seconds) |

### Order Book

**Topic:** `public/market/{market_id}/orderbook`
**QoS:** 0 (Fire and forget)
**Throttle:** 500ms
**Payload:** Order book snapshot

```json
{
  "m": "123456789",
  "t": "string",
  "b": [
    { "price": "0.55", "size": "100" },
    { "price": "0.54", "size": "200" }
  ],
  "a": [
    { "price": "0.56", "size": "150" },
    { "price": "0.57", "size": "250" }
  ],
  "h": "string",
  "ts": 1234567890
}
```

| Field | Type   | Description                           |
| ----- | ------ | ------------------------------------- |
| m     | string | Market ID                             |
| t     | string | Token ID                              |
| b     | array  | Bids (array of {price, size} objects) |
| a     | array  | Asks (array of {price, size} objects) |
| h     | string | Hash                                  |
| ts    | int64  | Timestamp (Unix seconds)              |

### Order Book Update

**Topic:** `public/market/{market_id}/orderbook/update`
**QoS:** 0 (Fire and forget)
**Throttle:** 500ms
**Payload:** Array of order book level updates (batched)

```json
[
  {
    "m": "123456789",
    "t": "token_id",
    "p": "0.55",
    "s": "100",
    "ty": "BUY",
    "ts": 1234567890
  }
]
```

| Field | Type   | Description              |
| ----- | ------ | ------------------------ |
| m     | string | Market ID                |
| t     | string | Token ID                 |
| p     | string | Price                    |
| s     | string | Size                     |
| ty    | string | Type (BUY/SELL)          |
| ts    | int64  | Timestamp (Unix seconds) |

### Last Trade Price

**Topic:** `public/market/{market_id}/trade`
**QoS:** 0 (Fire and forget)
**Throttle:** 500ms
**Payload:** Last trade

```json
{
  "m": "123456789",
  "p": "0.55"
}
```

| Field | Type   | Description     |
| ----- | ------ | --------------- |
| m     | string | Market ID       |
| p     | string | Price (decimal) |

### Market Resolved

**Topic:** `public/market/{market_id}/resolved`
**QoS:** 0 (Fire and forget)
**Throttle:** 500ms
**Payload:** Resolution info

```json
{
  "m": "123456789",
  "wt": "string",
  "wo": "Yes",
  "ts": 1234567890
}
```

| Field | Type   | Description              |
| ----- | ------ | ------------------------ |
| m     | string | Market ID                |
| wt    | string | Winning Token ID         |
| wo    | string | Winning Outcome          |
| ts    | int64  | Timestamp (Unix seconds) |

### New Comments

**Topic:** `public/comment/{entity_type}/{entity_id}`
**QoS:** 0 (Fire and forget)
**Retained:** true
**Payload:** Array of new comment objects

- `{entity_type}`: `event`, `series`, or `market`
- `{entity_id}`: ID of the parent entity (int64 as string)

```json
[
  {
    "i": "123456789",
    "b": "string",
    "t": "event",
    "pid": "123456789",
    "ua": "0x...",
    "pn": "string",
    "pm": "string",
    "rc": 5,
    "ca": 1234567890,
    "ts": 1234567890
  }
]
```

| Field | Type   | Description                           |
| ----- | ------ | ------------------------------------- |
| i     | string | ID (int64 as string)                  |
| b     | string | Body (comment content)                |
| t     | string | Type (event/series/market)            |
| pid   | string | Parent ID (int64 as string)           |
| ua    | string | User Address                          |
| pn    | string | Profile Name (optional)               |
| pm    | string | Profile Image URL (optional)          |
| rc    | int    | Reaction Count                        |
| ca    | int64  | Created At (Unix seconds, provider)   |
| ts    | int64  | Timestamp (Unix seconds, publish time)|

### Binance Price

**Topic:** `public/price/{symbol}`
**QoS:** 0 (Fire and forget)
**Throttle:** 200ms
**Payload:** Price update

Supported symbols: `BTCUSDT`, `ETHUSDT`, `SOLUSDT`, `XRPUSDT`

```json
{
  "t": 1234567890,
  "p": "42150.50"
}
```

| Field | Type   | Description              |
| ----- | ------ | ------------------------ |
| t     | int64  | Timestamp (Unix seconds) |
| p     | string | Price                    |

## Field Name Mapping

For bandwidth optimization, all field names have been shortened:

| Full Name          | Short | Description                        |
| ------------------ | ----- | ---------------------------------- |
| id                 | i     | Identifier (int64 as string)       |
| title              | t     | Event title                        |
| question           | q     | Market question                    |
| slug               | s     | URL-friendly slug                  |
| description        | d     | Event description                  |
| image              | im    | Image URL                          |
| active             | a     | Active status                      |
| closed             | c     | Closed status                      |
| volume             | v     | Trading volume                     |
| liquidity          | l     | Market liquidity                   |
| outcome_prices     | op    | Outcome prices [yes, no]           |
| token_yes_best_bid | tybb  | Token Yes best bid price           |
| token_yes_best_ask | tyba  | Token Yes best ask price           |
| token_no_best_bid  | tnbb  | Token No best bid price            |
| token_no_best_ask  | tnba  | Token No best ask price            |
| timestamp          | ts    | Unix timestamp in seconds          |
| market_id          | m     | Market identifier                  |
| token_id           | t     | Token identifier                   |
| token_yes_id       | ty    | Yes token ID                       |
| token_no_id        | tn    | No token ID                        |
| price              | p     | Price value                        |
| size               | s     | Order size                         |
| type               | ty    | Order type (BUY/SELL)              |
| bids               | b     | Order book bids                    |
| asks               | a     | Order book asks                    |
| hash               | h     | Order book hash                    |
| winning_token_id   | wt    | ID of winning token                |
| winning_outcome    | wo    | Outcome description                |
| body               | b     | Comment body/content               |
| type               | t     | Comment type (event/series/market) |
| parent_id          | pid   | Parent entity's ID                 |
| user_address       | ua    | User's wallet address              |
| profile_name       | pn    | User's profile name                |
| profile_image      | pm    | User's profile image URL           |
| reaction_count     | rc    | Number of reactions                |
| created_at         | ca    | Comment creation time (provider)   |

**Note:** Order book levels use full field names `{"price": "...", "size": "..."}` instead of shortened versions for clarity.

## Notes

- All IDs are **int64** values serialized as strings (e.g., `"123456789"`)
- `{market_id}` in topics uses the int64 ID as string
- `{entity_type}` for comments must be lowercase: `event`, `series`, or `market`
- Timestamps are Unix seconds (not milliseconds)
- Optional fields are omitted if empty/zero
- Arrays may be empty `[]`
- QoS 0 = Fire and forget (may lose messages under network issues)
- Throttled topics will batch updates within the throttle window (500ms)
- Retained topics (`public/event/new`, `public/event/update`, `public/market/new`, comments) store the last message so new subscribers receive it immediately
