# XBIT 后端 Go 开发计划

> 技术方向已定：核心后端统一使用 Go。本文按当前前端 `app-web-v2` 的接口契约拆开发阶段、服务边界、交付物和验收标准。

> 前后端分离开发：Go 后端服务放在同级独立目录 `/Users/zhangza/code/project/xbit-backend`，不放进 `app-web-v2` 前端工程。

---

## 1. 总体策略

### 1.1 技术栈基线

| 层 | 选型 | 说明 |
|---|---|---|
| 主语言 | Go | 核心交易、钱包、行情、实时服务统一 Go |
| GraphQL | gqlgen | 每个服务暴露兼容当前前端的 GraphQL schema |
| Gateway | Apollo Router / Envoy | 先路由多 endpoint，后续再 Federation 收敛 |
| HTTP Router | chi | 用于 health、metrics、REST proxy、webhook |
| DB | PostgreSQL + pgx + sqlc | 强事务数据：用户、订单、钱包、账本 |
| Migration | goose / atlas | 所有 schema 变更走 migration |
| Cache | Redis Cluster + go-redis | session、限流、报价缓存、热点数据 |
| MQ | Kafka + franz-go | 链上事件、订单状态、通知、账本事件 |
| Realtime | EMQX MQTT over WSS | 保持前端现有 MQTT 接入方式 |
| Observability | OpenTelemetry + Prometheus + Zap/Slog | trace、metrics、structured log |
| Config/Secret | Viper/envconfig + Vault/KMS | 本地 env，线上 Vault |
| Test | Go test + testcontainers | 单测、集成测试、契约测试 |

### 1.2 服务拆分原则

- P0 先少服务、快落地：`gateway`、`identity`、`wallet`、`trading`、`market-data`、`stream-bridge`。
- P1 后按业务压力拆细：`indexer-*`、`candle`、`prediction`、`xp-user`、`notification`。
- P2/P3 再补增长、运营、风控、分析。
- 每个服务都必须有：`/healthz`、`/readyz`、`/metrics`、structured log、traceId。

---

## 2. 推荐仓库结构

```text
xbit-backend/
├── cmd/
│   ├── gateway/
│   ├── identity/
│   ├── wallet/
│   ├── trading/
│   ├── market-data/
│   ├── hypertrader/
│   ├── stream-bridge/
│   ├── prediction/
│   └── xp-user/
├── internal/
│   ├── app/              # service bootstrap
│   ├── auth/             # JWT, session, middleware
│   ├── chain/            # Solana/EVM/Hyperliquid clients
│   ├── config/
│   ├── db/
│   ├── gql/              # gqlgen generated + resolvers
│   ├── kafka/
│   ├── mqtt/
│   ├── risk/
│   └── telemetry/
├── pkg/
│   ├── errors/           # GraphQL compatible error codes
│   ├── money/            # decimal amount helpers
│   ├── pagination/
│   └── requestid/
├── schemas/
│   ├── graphql/
│   ├── kafka/
│   └── mqtt/
├── migrations/
├── deploy/
│   ├── helm/
│   └── docker/
├── scripts/
└── docs/
```

如果团队倾向多仓库，也建议先从 monorepo 起步，避免早期跨服务契约漂移。

---

## 3. 阶段计划

## Phase 0：后端骨架和前端兼容入口

**目标**：让当前前端可以指向 Go 后端网关，完成鉴权、错误格式、路由、观测基础。

周期建议：1-2 周。

### 交付物

- Go monorepo 初始化。
- Docker Compose 本地环境：Postgres、Redis、Kafka、EMQX。
- `gateway`：
  - 按当前前端 env 路径转发 GraphQL endpoint。
  - 注入 `traceId`。
  - CORS、限流、request log。
- `pkg/errors`：
  - 统一 GraphQL error：`extensions.code/meta.traceId/meta.retryable`。
  - 兼容 `ErrAccessTokenInvalid` 和 `UNAUTHENTICATED`。
- CI：
  - `go test ./...`
  - lint
  - migration dry-run

### 验收

- 前端所有 GraphQL endpoint 能被 gateway 路由。
- 前端 token 过期时能触发 refresh 逻辑。
- 所有请求日志能按 `operationName` 和 `traceId` 查询。

---

## Phase 1：Identity + Wallet 基础

**目标**：登录、token refresh、账户、钱包、Turnkey 基础能力先跑通。

周期建议：2-3 周。

### 服务

#### `identity-svc`

能力：

- Telegram / Google / Apple / Email OTP / Wallet login。
- `getNonce`、钱包签名登录。
- access token + refresh token rotation。
- 设备指纹绑定。
- 2FA 基础接口。

关键表：

```sql
users
user_identity
sessions
login_nonce
device_fingerprint
user_2fa
```

#### `wallet-svc`

能力：

- 用户钱包列表。
- Turnkey sub-org / wallet 创建。
- embedded wallet name/order。
- 提币白名单。
- 钱包安全事件审计。

关键表：

```sql
wallets
wallet_whitelist
wallet_security_events
turnkey_accounts
```

### 验收

- 前端登录页所有主路径可用。
- `getAccessToken(refreshToken)` 并发请求幂等。
- 高危操作生成 audit log。

---

## Phase 2：Trading MVP

**目标**：实现 DEX 交易闭环：报价、创建交易、签名、提交、状态追踪、订单历史。

周期建议：3-5 周。

### 服务

#### `trading-svc`

当前 Go 后端已落地独立服务目录：

- 服务入口：`/Users/zhangza/code/project/xbit-backend/cmd/trading`
- 业务模块：`internal/trading`
- 迁移文件：`migrations/trading/000001_trading_base.sql`
- 运行方式：`SERVICE_ADDR=:8083 go run ./cmd/trading`
- 已实现 REST MVP：`/v1/trading/quote`、`/v1/trading/orders`、订单状态更新/取消、订单列表、`/v1/trading/network-fee`、`/v1/trading/exchange-meta`
- 已实现轻量 GraphQL facade：`/graphql`、`/trading-gql`、`/api/trading/trading-gql`，覆盖当前前端核心交易 operation 的 MVP 响应
- 当前存储策略：默认内存存储，配置 `POSTGRES_DSN` 后切换 Postgres

GraphQL 能力：

- `GetExchangeMeta`
- `GetAllPossibleRoutes`
- `ConfirmRoute`
- `CreateTx`
- `SignTx`
- `CheckStatus`
- `createOrder`
- `modifyOrder`
- `cancelOrder`
- `getPendingOrders`
- `orders`
- `orderHistory`
- `getTransactions`
- `getNetworkFee`

核心模块：

- quote aggregator：Jupiter / EVM aggregator / Relay。
- order manager：订单状态机。
- tx builder：Solana / EVM 交易构造。
- tx tracker：链上确认和失败归因。
- fee engine：platform fee、priority fee、slippage。

关键表：

```sql
orders
order_events
quote_snapshots
transactions
network_fee_snapshots
idempotency_keys
```

### 实时事件

- `users/{userId}/order_updated`
- `users/{userId}/order_submit_failed`
- `users/{userId}/fill_web3_order_failed`
- `users/{userId}/order_confirmation`
- `public/network_fee_updated/{chain}`

### 验收

- 同一 `clientRequestId` 重复提交不会重复下单。
- 订单状态 GraphQL 查询和 MQTT 推送一致。
- quote P99 目标小于 800ms。
- 每笔交易有 route snapshot 和完整状态事件。

---

## Phase 3：Market Data + Indexer + K线

**目标**：支撑 Meme/token 发现、详情、K线、成交、holder/pool 基础数据。

周期建议：4-6 周。

### 服务

#### `market-data-svc`

当前 Go 后端已落地独立服务目录：

- 服务入口：`/Users/zhangza/code/project/xbit-backend/cmd/market-data`
- 业务模块：`internal/marketdata`
- 迁移文件：`migrations/market-data/000001_market_data_base.sql`
- 运行方式：`SERVICE_ADDR=:8084 go run ./cmd/market-data`
- 已实现 REST MVP：token list/detail/search、OHLC、transactions、pools、categories
- 已实现轻量 GraphQL facade：`/graphql`、`/meme-gql`、`/api/meme2/meme-gql`、`/api/meme/graphql`
- 已实现 indexer 写入入口：`POST /v1/indexer/tokens`、`POST /v1/indexer/transactions`、checkpoint 读写
- 当前存储策略：默认 seed + 内存 read model，配置 `POSTGRES_DSN` 后切换 Postgres

能力：

- token list：trending/new/popular/category/search。
- token detail：price、metadata、statistic、official info。
- transactions、pool transactions。
- portfolio read model。

#### `indexer-solana`

能力：

- Solana RPC/Geyser 消费。
- Pumpfun/Raydium/Meteora/Orca 等 swap/pool/token 事件解析。
- 写 Kafka 标准事件。

#### `indexer-evm`

能力：

- ETH/ARB/BSC/MON 事件监听。
- reorg 处理。
- DEX factory/pair/swap 解析。

#### `candle-svc`

能力：

- OHLC 构建。
- TradingView datafeed 历史查询。
- MQTT 推送实时 candle。

#### `stream-bridge`

当前 Go 后端已落地独立服务目录：

- 服务入口：`/Users/zhangza/code/project/xbit-backend/cmd/stream-bridge`
- 业务模块：`internal/streambridge`
- 运行方式：`SERVICE_ADDR=:8085 go run ./cmd/stream-bridge`
- MQTT 模式：`MQTT_ENABLED=true MQTT_BROKER_URL=tcp://localhost:1883 SERVICE_ADDR=:8085 go run ./cmd/stream-bridge`
- 已实现事件入口：`POST /v1/stream/events`、`POST /v1/stream/events/batch`
- 已实现调试回放：`GET /v1/stream/topics`、`GET /v1/stream/events?topic=...`
- 已实现 topic 映射：market token、statistics、transactions、OHLC、network fee、private trading order events

### 实时事件

- `public/meme/new`
- `public/token/new`
- `public/pairs/new`
- `public/meme/token_info/{chainId}/{token}`
- `public/token_statistic/{chainId}/{token}`
- `public/transaction/new/{chainId}/{token}`
- `public/kline/ohlc_1m/{address}`
- `public/kline/ohlc_1d/{address}`

### 验收

- Token 详情首屏 GraphQL 数据和 MQTT 增量字段兼容。
- K线历史和实时更新连续，不重复、不跳点。
- Indexer lag 有指标和告警。

---

## Phase 4：Hyperliquid / Futures / Smart Money

**目标**：补齐期货交易、资金费率、聪明钱、地址分组和监控。

周期建议：3-5 周。

### 服务

#### `hypertrader-svc`

当前 Go 后端已落地独立服务目录：

- 服务入口：`/Users/zhangza/code/project/xbit-backend/cmd/hypertrader`
- 业务模块：`internal/hypertrader`
- 迁移文件：`migrations/hypertrader/000001_hypertrader_base.sql`
- 运行方式：`SERVICE_ADDR=:8086 go run ./cmd/hypertrader`
- 已实现 REST MVP：`/v1/futures/symbols`、`/v1/futures/account`、`/v1/futures/trades`、`/v1/futures/open-orders`、`/v1/futures/smart-money`、`/v1/futures/funding-rates`、`/v1/futures/orders`、`/v1/futures/orders/{orderId}/sync`、`/v1/futures/leverage`、`/v1/futures/audit-events`
- 已实现轻量 GraphQL facade：`/graphql`、`/api/graphql-dex`、`/api/dex-hypertrader/graphql`、`/api/user/user-gql`
- 当前覆盖：期货 symbol、收藏/偏好、用户持仓/交易历史/open orders、Smart Money 列表、地址分组/关注地址 CRUD、资金费率、本地 provider 订单提交/取消/状态同步、杠杆更新、Hyperliquid wallet 检查和签名类操作
- 已新增 provider 抽象：默认 `LocalProvider`；新增 `HTTPProvider`，可配置读取 Hyperliquid `/info` 账号、成交历史、open orders、资金费率和订单状态，并仅转发已签名 `/exchange` payload
- 已新增 Hyperliquid 私有 WS bridge：订阅 `orderUpdates`、`userEvents`、`userFills`、`userFundings`、`userNonFundingLedgerUpdates`、`openOrders`、`clearinghouseState`，通过 stream-bridge publisher 推送私有 MQTT topic
- 已新增 live read model：WS reconnect 会用 provider 补 open orders、account/positions、recent fills，读接口在 provider 异常时可回退到持久化快照
- 已新增订单审计：签名、下单、撤单、杠杆更新会写入 audit event
- 当前存储策略：默认 seed + 内存 read model，配置 `POSTGRES_DSN` 后切换 Postgres

能力：

- Hyperliquid HTTP/WS proxy 和私有 MQTT 推送。
- sign create/cancel/update leverage/approve agent/withdraw。
- PnL、持仓、资金费率历史。
- Smart Money 地址分组、标签、ROI、策略分析。

#### `dex-symbol-svc`

能力：

- symbol list、popular/new/hot searches。
- favorite symbols。
- banner/route banner。
- CLOID 生成和订单提交桥接。

### 验收

- `/futures/:baseCoin` 关键接口可由 Go 服务支撑。
- 资金费率实时表通过 DEX MQTT 更新。
- Smart Money 地址分组 CRUD 可用。

---

## Phase 5：Prediction / XP User

**目标**：支撑 `/prediction/*`、预测市场交易、proxy wallet、USDC、提现和私有交易状态。

周期建议：4-6 周。

### 服务

#### `prediction-svc`

能力：

- events、markets、orderbook、price history、comments、search。
- sports、crypto、finance、breaking、trending。
- public MQTT 转发。

#### `xp-user-svc`

能力：

- proxy wallet。
- USDC allowance / approve。
- market/limit order。
- open orders、positions、activity、PnL。
- claim positions。
- withdraw / cross-chain withdraw。
- relayer status。

### 实时事件

- `public/event/new`
- `public/event/update`
- `public/market/{marketId}/update`
- `public/market/{marketId}/orderbook`
- `public/market/{marketId}/orderbook/update`
- `public/market/{marketId}/trade`
- `public/market/{marketId}/resolved`
- `public/comment/{entityType}/{entityId}`
- `public/polymarket/tx_status/{proxyWallet}`

### 验收

- 下单返回业务订单 ID、provider order ID、marketId、outcome、side、size、price、status。
- 前端不需要直连 Polymarket 私有 websocket。
- Claim/withdraw 可审计、可重试、可查状态。

---

## Phase 6：Notification + Growth

**目标**：通知、邀请、忠诚度、红包、任务和排行榜。

周期建议：3-5 周。

### 服务

#### `notification-svc`

能力：

- notification list/read/unread count。
- FCM/OneSignal device token。
- 多语言模板。
- MQTT fallback：`users/{userId}/notifications`。

#### `agent-svc`

能力：

- invite code、bind invite。
- referral snapshot、reward records。
- task categories/tasks/complete/claim。
- tier benefits。

#### `loyalty-svc`

能力：

- season。
- loyalty status。
- leaderboard。

#### `redpacket-svc`

能力：

- red packet status/features/unlock。
- claim all、withdraw。
- lotto、leaderboard、Twitter verification。

### 验收

- 奖励/积分/红包统一 append-only ledger。
- 资金类通知必达且幂等。
- 运营配置有缓存和版本号。

---

## Phase 7：安全、风控和运营后台

**目标**：把交易安全、合规审计、运营配置补齐。

周期建议：持续迭代。

能力：

- risk-svc：金额、频次、设备、IP、地址黑名单、token 黑名单。
- AML：高风险地址识别。
- admin-svc：公告、维护状态、链接配置、风控规则。
- 审计日志归档。
- emergency pause。

验收：

- 所有资金写操作有风控检查和 audit log。
- 风控服务异常时资金操作 fail closed。
- 关键配置变更可追溯、可回滚。

---

## 4. 开发顺序建议

第一批人力优先做：

1. 后端骨架 + gateway + observability。
2. identity-svc。
3. wallet-svc。
4. trading-svc MVP。
5. stream-bridge + EMQX ACL。

第二批并行做：

1. market-data-svc。
2. indexer-solana。
3. candle-svc。
4. notification-svc。

第三批做：

1. hypertrader-svc MVP 已落地，后续补齐 WS 生产监控、agent signer、风控和审计。
2. prediction-svc。
3. xp-user-svc。
4. agent/loyalty/redpacket。

---

## 5. 团队分工建议

| 小组 | 人数建议 | 负责 |
|---|---:|---|
| Platform | 1-2 | gateway、CI/CD、observability、deploy、common libs |
| Identity/Wallet | 2 | 登录、token、Turnkey、钱包、安全审计 |
| Trading | 2-3 | quote、order、tx、network fee、status tracker |
| Market Data | 2-3 | indexer、token、K线、portfolio read model |
| Prediction | 2 | prediction public data、xp-user、Polymarket relayer |
| Growth/Ops | 1-2 | notification、agent、loyalty、redpacket、admin |

---

## 6. 每个 Go 服务的标准交付清单

- `cmd/{service}/main.go`
- `internal/{service}/config.go`
- `internal/{service}/resolver.go` 或 handler
- `schemas/graphql/{service}.graphqls`
- `migrations/{service}/`
- `Dockerfile`
- Helm values
- health/ready/metrics endpoint
- OpenTelemetry trace
- structured logs
- unit tests
- integration tests
- contract tests for current frontend operations
- README：本地启动、env、依赖、常见错误

---

## 7. 关键验收命令

```bash
go test ./...
go test -race ./...
golangci-lint run
sqlc generate
goose status
```

前端契约验收：

```bash
cd apps/host
pnpm codegen
```

上线前必须通过：

- 当前前端 codegen。
- GraphQL operation replay。
- MQTT topic smoke test。
- 交易幂等测试。
- 钱包/提币安全审计测试。

---

## 8. 近期 4 周任务拆解

### Week 1

- 初始化 Go monorepo。
- Docker Compose 起 Postgres/Redis/Kafka/EMQX。
- gateway 路由当前所有 GraphQL endpoint。
- 定义统一错误码和 traceId。
- 建第一版 CI。

### Week 2

- identity-svc：JWT、refresh token、nonce、wallet login skeleton。
- wallet-svc：wallet table、wallet list、Turnkey adapter interface。
- EMQX public/user ACL 方案落地。
- 前端 dev env 切 gateway smoke test。

### Week 3

- trading-svc：order table、createOrder/checkStatus skeleton。
- quote aggregator interface。
- network fee query + MQTT publish。
- order status MQTT publish。
- 幂等键中间件。

### Week 4

- Jupiter quote/swap 代理接入。
- Solana tx tracker MVP。
- wallet balance read model skeleton。
- token statistic MQTT schema 定版。
- 第一轮端到端：登录 -> quote -> create order -> status -> notification。
