# XBIT Web V2 后端落地契约文档

> 基于当前前端仓库 `app-web-v2` 静态梳理。本文补充 `BACKEND_DESIGN.md` 的落地层：前端真实业务面、已接入的 GraphQL/REST/MQTT 契约、后端服务边界、数据模型和迁移优先级。

> Go 后端开发计划见 [`BACKEND_GO_DEVELOPMENT_PLAN.md`](./BACKEND_GO_DEVELOPMENT_PLAN.md)。

---

## 1. 项目现状

### 1.1 仓库结构

| 模块 | 路径 | 现状 | 后端相关性 |
|---|---|---|---|
| 主应用 | `apps/host` | 真实业务集中区，React + Vite + Apollo + React Query + Redux | 所有后端契约主要从这里反推 |
| 期货子应用 | `apps/futures` | Module Federation 子应用壳，页面仍是占位 | 目前只暴露 `Routes` 和 `store` |
| 设计系统 | `libs/design-system` | 仅有基础 Button 组件 | 与后端无直接契约 |
| 根文档 | `BACKEND_DESIGN.md` 等 | 已有宏观后端架构设计 | 本文作为前端接口契约补充 |

### 1.2 技术栈信号

- 前端运行方式：Nx monorepo + Vite。
- 主应用：React 19、React Router、Apollo Client、TanStack Query、Redux Toolkit。
- 钱包/链：Solana wallet adapter、Wagmi/RainbowKit、Turnkey、Hyperliquid SDK、Jupiter、Rango/Relay。
- 实时：`mqtt` over WSS，两套连接 `VITE_SOCKET_URL` 和 `VITE_SOCKET_URL_DEX`，另有 Prediction WebSocket。
- 监控/增长：Sentry、Firebase/FCM、OneSignal、GrowthBook。

### 1.3 业务域总览

| 业务域 | 前端入口 | 核心能力 |
|---|---|---|
| Meme / DEX | `/meme/discover`, `/meme/:chain/token/:address` | Token 发现、详情、K线、交易、Holder/Pool/Smart Money 分析 |
| 交易 | token detail order form, assets trade history | Swap、限价/挂单、Web3 订单保存、手续费和网络费 |
| 资产 | `/assets`, `/deposit`, `/withdrawal`, `/transfer` | 钱包余额、资金历史、入金/出金、预测市场资产 |
| 期货 / Hyperliquid | `/futures/:baseCoin`, `/funding-rate` | 行情、下单签名、杠杆、资金费率、持仓 |
| Prediction | `/prediction/*`, `/prediction-deposit`, `/prediction-withdraw` | Polymarket 事件、盘口、交易、评论、收藏、资产划转 |
| Smart Money | `/futures/smart-money`, `/meme/smart-money`, `/futures/supervisory` | 聪明钱榜单、地址分组、监控、跟单 |
| Copy Trading | `/wallet-copy/*` | 跟单配置、黑名单、订单和收益 |
| Growth | `/agent`, `/invite-friends`, `/loyalty`, `/redpacket` | 邀请返佣、任务、积分、红包、排行榜 |
| 通知/设置 | `/meme/notifications`, settings pages | 设备 token、站内信、偏好、2FA、白名单 |

---

## 2. 前端已依赖的后端入口

### 2.1 GraphQL 服务清单

前端当前创建了多 Apollo client，各 client 独立 cache。后端必须优先保持这些 endpoint 的 schema 兼容。

| Client | 环境变量 | 当前职责 |
|---|---|---|
| `gqlClient` | `VITE_GRAPHQL_HTTP_URL` | core/meme 旧接口、资产、设置、黑名单等 |
| `gqlMeme2` | `VITE_GRAPHQL_MEME2_URL` | Meme token、K线、分类、holder、pool、xstocks |
| `tradingClient` | `VITE_GRAPHQL_TRADING_HTTP_URL` | swap、订单、交易历史、copy trade |
| `userGqlClient` | `VITE_GRAPHQL_USER_HTTP_URL` | 登录、账户、Turnkey、2FA、Hyperliquid 签名 |
| `futureClient` | `VITE_GRAPHQL_FUTURE_HTTP_URL` | 当前指向 meme2 endpoint，供 futures/monitoring 复用 |
| `walletClient` | `VITE_GRAPHQL_WALLET_HTTP_URL` | 提币费、提币历史、关注钱包、资金账户 |
| `symbolDexClient` | `VITE_GRAPHQL_HTTP_DEX_URL` | 期货 symbol、收藏、banner、热门搜索、提交 Hyperliquid order |
| `agentDexClient` | `VITE_GRAPHQL_AGENT_HTTP_URL` | 邀请、返佣、任务、Agent 数据看板 |
| `dexHyperTraderClient` | `VITE_GRAPHQL_DEX_HYPERTRADER_HTTP_URL` | Smart Money、地址分组、策略分析 |
| `hypertraderClient` | `VITE_DEX_HYPERTRADER_GRAPHQL_URL` | 与 dexHyperTrader 同源，命名需收敛 |
| `notificationClient` | `VITE_GRAPHQL_NOTIFICATION_HTTP_URL` | 通知列表、未读数、设备 token、错误码 |
| `loyaltyClient` | `VITE_APP_LOYALTY_HTTP_URL` | Season、忠诚度状态、排行榜 |
| `redpacketClient` | `VITE_GRAPHQL_REDPACKET_HTTP_URL` | 红包活动、抽奖、提现、Twitter 验证 |
| `predictionClient` | `VITE_GRAPHQL_PREDICTION_HTTP_URL` | Prediction 事件、市场、评论、搜索、盘口 |
| `xpUserClient` | `VITE_GRAPHQL_XP_USER_HTTP_URL` | Prediction 用户资产、proxy wallet、CLOB 交易、提现 |
| `adminClient` | `VITE_GRAPHQL_ADMIN_HTTP_URL` | 公告弹窗、链接配置 |
| `affiliateClient` | `VITE_GRAPHQL_AFFILIATE_HTTP_URL` | client 已声明，但当前业务代码基本未使用 |

### 2.2 GraphQL 操作规模

静态扫描 `apps/host/src/services` 和 `apps/host/src/modules/prediction/gql`，当前约有 360+ 个显式 GraphQL operation。后端不宜一次性重构 schema，建议采用“兼容旧 schema + 新 schema 逐步并行”的迁移方式。

| 文件 | Operation 数 | 业务含义 |
|---|---:|---|
| `services/tokens.service.ts` | 59 | Token 搜索、排行、详情、holder、pool、portfolio |
| `services/auth.service.ts` | 33 | 登录、token refresh、Turnkey、钱包导出、Hyperliquid 签名 |
| `modules/prediction/gql/prediction.gql.ts` | 32 | Prediction 事件、市场、评论、价格、收藏 |
| `modules/prediction/gql/prediction-user.gql.ts` | 29 | Prediction 交易、proxy wallet、USDC、提现、仓位 |
| `services/hypertrader.service.ts` | 29 | Smart Money、地址分组、关注地址和策略分析 |
| `services/agent.dex.service.ts` | 24 | 邀请返佣、任务、等级和奖励 |
| `services/copytrade.service.ts` | 18 | 跟单配置、订单、黑名单和聪明钱统计 |
| `services/swap.service.ts` | 16 | swap/bridge quote、create tx、status、funding swap |
| `services/order.service.ts` | 16 | DEX 订单、挂单、历史、交易配置 |
| `services/redpacket.service.ts` | 16 | 红包、抽奖、排行榜、提现 |
| `services/symbol.dex.service.ts` | 15 | 期货 symbol、收藏、banner、搜索、CLOID |
| `services/assets.service.ts` | 14 | 资产、余额、PnL、资金流水 |

### 2.3 REST / 外部调用

| 来源 | 当前前端调用 | 后端建议 |
|---|---|---|
| Jupiter | `https://lite-api.jup.ag/swap/v1/quote`, `/swap` | 收敛到 trading-svc 代理，加入 platform fee、限流、审计和失败归因 |
| Hyperliquid | `https://api.hyperliquid.xyz`, `wss://api.hyperliquid.xyz/ws` | 收敛到 hypertrader gateway，统一签名、限流和缓存 |
| Relay / Rango | `VITE_RELAY_HOST` 等 | bridge-svc 代理 quote/status，避免前端直连业务密钥或复杂状态 |
| Polymarket CLOB | `wss://ws-subscriptions-clob.polymarket.com/ws/user` 与 fallback WSS | 由 xp-user/prediction-svc 转发私有用户事件，前端只连 XBIT 域名 |
| CryptoCompare / 582btc | datafeed helper 中直连 | 若仍使用，应由 market-data-svc 代理并缓存 |
| RPC | `VITE_RPC_PROXY_MEME` | 保留 RPC proxy；加强 method 级限流、缓存和节点健康路由 |

---

## 3. GraphQL 契约设计

### 3.1 通用请求规范

- HTTP method：POST。
- URL query：前端会附加 `?op=${operationName}`，网关应保留并写入日志。
- Header：
  - `Authorization: Bearer ${accessToken}`。
  - `X-Consumer-Username: xbit`：部分 consumer client 固定携带。
- 错误格式：前端 `GqlError` 从 `extensions.code` 和 `extensions.meta` 解析错误。

建议标准错误：

```json
{
  "errors": [
    {
      "message": "token expired",
      "extensions": {
        "code": "ErrAccessTokenInvalid",
        "meta": {
          "traceId": "01J...",
          "retryable": true
        }
      }
    }
  ]
}
```

必须兼容的认证错误码：

- `ErrAccessTokenInvalid`
- `UNAUTHENTICATED`

这两个 code 会触发前端 refresh token 单飞逻辑。

### 3.2 认证与账户域

前端已依赖的能力：

- Telegram：`loginByTelegram`, `loginTelegramV2`
- Wallet：`getNonce`, `loginByWallet`, `loginByWalletV2`, `checkRegisteredWallet`
- Google / Apple / Email OTP：`loginWithGoogle`, `loginWithApple`, `initEmailOtp`, `loginWithEmailOtp`
- Token refresh：`getAccessToken(refreshToken)`
- Turnkey：创建 sub org、创建钱包、迁移 Turnkey 版本、导出助记词/私钥审批
- 2FA：Google Authenticator 初始化、验证、关闭、白名单
- Hyperliquid：检查/更新 perpetual wallet、签名 create/cancel/update leverage/agent/fee builder/withdraw

后端要求：

- access token 建议 15 分钟，refresh token 30 天并做 rotation。
- refresh token 并发请求需幂等，因为前端用 `refreshingPromise` 折叠并发。
- 所有高风险 mutation 记录审计日志：钱包导出、提币、Hyperliquid agent approve、2FA 关闭。
- OAuth idToken、Telegram init data、钱包签名 nonce 都必须服务端校验，不信任前端。

### 3.3 交易域

前端已依赖的能力：

- `createOrder`, `modifyOrder`, `cancelOrder`, `saveWeb3Order`
- `getNetworkFee`, `config`
- `getPendingOrders`, `orders`, `orderHistory`, `getTransactions`, `getAllTransactions`
- `getPortfolio`, `transactionTokens`, `lastTransactions`, `GetUncompletedOrders`
- swap/bridge：`GetExchangeMeta`, `GetAllPossibleRoutes`, `ConfirmRoute`, `CreateTx`, `SignTx`, `CheckStatus`, `GetQuoteV2`, `QuoteRelay`, `CreateFundingSwap`, `CreateFutureTransaction`

后端要求：

- 所有写操作必须接受 `clientRequestId` 或等价幂等键；当前 schema 如果没有，应以可选字段向后兼容添加。
- quote 响应必须带有效期、路由快照、fee 拆解、gas/priority fee、slippage 约束。
- create tx 与 sign tx 分离，便于非托管钱包前端签名、托管钱包后端 Turnkey 签名。
- 订单状态必须同时支持 GraphQL 查询和 MQTT 推送。
- `getNetworkFee` 与 `public/network_fee_updated/{chain}` 的结构需保持一致。

当前 Go 后端 Phase 2 REST MVP 已在独立后端仓库 `/Users/zhangza/code/project/xbit-backend` 落地：

- `POST /api/trading/trading-gql`
- `POST /trading-gql`
- `POST /graphql`
- `POST /v1/trading/quote`
- `POST /v1/trading/orders`
- `GET /v1/trading/orders?userId=...&status=...`
- `GET /v1/trading/orders/{orderId}`
- `POST /v1/trading/orders/{orderId}/status`
- `POST /v1/trading/orders/{orderId}/cancel`
- `GET /v1/trading/network-fee?chainType=...`
- `GET /v1/trading/exchange-meta`

### 3.4 Meme / Token 数据域

前端已依赖的能力：

- Token 列表：trending/new/popular/category/xstocks/search。
- Token 详情：metadata、price、OHLC、insight、official information、sniper、bundle、dev hold。
- 交易分析：transactions、pool transactions、wallet statistic、holder chart、top100 holder statistic。
- Portfolio：单钱包和多钱包 portfolio、wallet info、token statistic。
- Category：`GetAllCategories`, `GetCategoryStatistic`, `TokensByCategory`。

后端要求：

- 所有金额字段优先使用 string decimal，不用 float。
- 列表接口必须支持 cursor 或稳定 offset；排序字段要白名单。
- Token 详情接口需要明确数据新鲜度字段：`updatedAt`, `source`, `lagMs`。
- 搜索接口建议合并 `SearchToken`, `SearchTokenLite`, `SearchUniversal`, `SearchTokenPc` 的底层实现，仅保留兼容 facade。

当前 Go 后端 Phase 3 market-data MVP 已在独立后端仓库 `/Users/zhangza/code/project/xbit-backend` 落地：

- `POST /api/meme2/meme-gql`
- `POST /api/meme/graphql`
- `POST /meme-gql`
- `POST /graphql`
- `GET /v1/market/tokens`
- `GET /v1/market/tokens/search?q=...`
- `GET /v1/market/tokens/{chainId}/{address}`
- `GET /v1/market/tokens/{chainId}/{address}/ohlc`
- `GET /v1/market/tokens/{chainId}/{address}/transactions`
- `GET /v1/market/tokens/{chainId}/{address}/pools`
- `POST /v1/indexer/tokens`
- `POST /v1/indexer/transactions`
- `GET|PUT /v1/indexer/checkpoints/{source}`

### 3.5 期货 / Hyperliquid / Smart Money 域

前端已依赖的能力：

- symbol：`GetSymbolList`、`SearchSymbol`、`GetFavoriteSymbols`、`UpdateUserSymbolPreference`、`GenerateCloid`。
- 资产/持仓：`GetUserBalance`、`GetUserPrevDayBalance`、`GetUserPosition`、`GetUserTradeHistory`。
- Hyperliquid 签名：`CheckHyperLiquidWallet`、`updateHyperLiquidWallet`、`signHyperLiquidCreateOrder`、`signHyperLiquidCancelOrder`、`signHyperLiquidUpdateLeverage`、agent/fee builder/withdraw approve。
- Smart Money：`GetActiveSmartMoney`、`GetRecentActiveSmartMoney`、ROI/metrics/tag/strategy 分析。
- 地址管理：地址分组 CRUD、关注地址 CRUD、批量导入、分组顺序、关注地址持仓。

当前 Go 后端 Phase 4 hypertrader MVP 已在独立后端仓库 `/Users/zhangza/code/project/xbit-backend` 落地：

- `POST /api/graphql-dex`
- `POST /api/dex-hypertrader/graphql`
- `POST /api/user/user-gql`
- `POST /graphql`
- `GET /v1/futures/symbols`
- `GET /v1/futures/account?userAddress=...`
- `GET /v1/futures/trades`
- `GET /v1/futures/smart-money`
- `GET /v1/futures/funding-rates`
- `GET|POST /v1/futures/orders`
- `POST /v1/futures/orders/{orderId}/cancel`
- `POST /v1/futures/orders/{orderId}/sync`
- `POST /v1/futures/leverage`
- `GET /v1/futures/audit-events`

当前边界：

- 已支持前端联调用的期货/合约 read model、Smart Money 和地址管理。
- 已提供 Hyperliquid 签名类 facade，便于前端打通流程。
- 已落地本地 provider adapter、HTTP provider adapter、订单提交/取消、订单状态同步、杠杆更新、资金费率和高风险操作审计。
- HTTP provider 已支持 Hyperliquid `/info` 账号、资金费率、订单状态读接口，`/exchange` 写接口只转发前端/agent 已签名的 payload。
- 真实 Hyperliquid 私有 WS、agent signer 托管签名和细粒度风控规则仍需继续补齐。

### 3.6 Prediction 域

前端已依赖的能力：

- Public：事件列表、事件详情、市场列表、盘口、价格历史、评论、搜索、体育赛事、热门/新事件。
- User：proxy wallet、USDC allowance、交易启用、market/limit order、open orders、positions、activity、Pnl、claim、withdraw。
- 实时：market update、price、orderbook snapshot/update、trade、resolved、comment、crypto event volume、Polymarket tx status。

后端要求：

- `prediction-svc` 负责 provider 数据聚合和 public cache。
- `xp-user-svc` 负责用户资金、proxy wallet、CLOB 凭证、relayer 交易和提现。
- 下单 mutation 返回必须包含：业务订单 ID、provider order ID、marketId、outcome、side、size、price、status、submitted tx/relayer id。
- private tx status 应走 XBIT 自有 WSS/MQTT，避免前端直连 Polymarket 私有订阅。

### 3.7 增长域

前端已依赖：

- Agent/Invite：referral snapshot、invite code、bind invite、summary、list、reward、withdrawal records、tiers、tasks。
- Loyalty：season、status、leaderboard。
- Redpacket：feature/status、unlock、twitter binding、claim all、withdraw、leaderboard、lotto、daily budget。
- Notification：list、unread count、read、device token、active device token、error messages。

后端要求：

- 奖励、积分、红包都使用 append-only ledger，不直接覆盖余额。
- 邀请关系一旦绑定只能在明确规则下变更，并保留审计。
- 资金类通知不受用户普通通知偏好压制。
- 运营配置类接口加缓存和版本号，避免每次路由渲染打后端。

---

## 4. 实时契约

### 4.1 MQTT 连接

| 连接 | 环境变量 | 认证方式 | 用途 |
|---|---|---|---|
| 主 stream | `VITE_SOCKET_URL` | public: `anon/anon`; user: `userId/accessToken` | Meme、订单、资产、通知、Prediction public topics |
| DEX stream | `VITE_SOCKET_URL_DEX` | 当前使用环境变量 username/password | 期货 symbol、资金费率等 DEX 行情 |

建议：

- 用户私有 topic 必须走 JWT ACL：`users/{uid}/...` 只能由本人订阅。
- public topic 可匿名，但 broker 要做 IP/clientId 级连接数和订阅数限制。
- payload 统一包一层 envelope，逐步兼容旧 payload：

```json
{
  "topic": "public/meme/token_info/501424/So111...",
  "ts": 1760000000,
  "seq": 123456,
  "payload": {}
}
```

当前 Go 后端 `stream-bridge` MVP 已在独立后端仓库 `/Users/zhangza/code/project/xbit-backend` 落地：

- `POST /v1/stream/events`
- `POST /v1/stream/events/batch`
- `GET /v1/stream/topics`
- `GET /v1/stream/events?topic=...`
- MQTT envelope 和 event/topic 映射见 `/Users/zhangza/code/project/xbit-backend/schemas/mqtt/README.md`

### 4.2 当前前端已订阅的主要 topic

| Topic | 用途 | 后端发布方 |
|---|---|---|
| `public/meme/new` | Meme 新 token feed | meme-svc |
| `public/token/new` | 新 token feed | meme-svc |
| `public/pairs/new` | 新交易对 | dex-symbol-svc |
| `public/meme/token_info/{chainId}/{token}` | token 详情实时更新 | market-data-svc |
| `public/token_statistic/{chainId}/{token}` | 价格/成交/holder/volume 统计 | market-data-svc |
| `public/meme/token_sm_holding/{chainId}/{token}` | smart money 持仓 | agent-svc |
| `public/meme/token_image/#` | token 图片更新 | asset/media-svc |
| `public/transaction/new/{chainId}/{token}` | token 新成交 | indexer/market-data-svc |
| `public/transaction/new_detail/{token}` | token 新成交详情 | indexer/market-data-svc |
| `public/transaction/update/{chainId}/{token}` | 成交更新 | indexer/market-data-svc |
| `public/kline/ohlc_1m/{address}` | 1m K线 | candle-svc |
| `public/kline/ohlc_1d/{address}` | 1d K线 | candle-svc |
| `public/wallet_token/{address}/{token}` | 持仓余额 | wallet/portfolio-svc |
| `public/wallet_token_balance/{address}/{token}` | token balance 更新 | wallet/portfolio-svc |
| `public/network_fee_updated/{chain}` | 网络费配置 | trading-svc |
| `public/latest_blockhash/SOLANA` | Solana latest blockhash | rpc-proxy |
| `public/price/usd` | USD 价格 | market-data-svc |
| `public/maintenance_status_updated` | 系统维护状态 | admin-svc |
| `public/turnkey_policy_updated` | Turnkey policy 更新 | wallet-svc |
| `users/{userId}/order_updated` | 订单状态更新 | trading-svc |
| `users/{userId}/order_submit_failed` | 下单失败 | trading-svc |
| `users/{userId}/fill_web3_order_failed` | Web3 订单 fill 失败 | trading-svc |
| `users/{userId}/order_confirmation` | 订单确认 | trading-svc |
| `users/{userId}/wallet_balance_updated` | 钱包余额更新 | wallet-svc |
| `users/{userId}/withdraw_statistics_updated` | 提币统计更新 | wallet-svc |
| `users/{userId}/funding_histories_updated` | 资金流水更新 | wallet-svc |
| `users/{userId}/notifications` | 站内通知 fallback | notification-svc |

### 4.3 Prediction MQTT topic

| Topic | Payload 类型 |
|---|---|
| `public/event/new` | `MqttEventPayload[]` |
| `public/event/update` | `MqttEventPayload[]` |
| `public/market/new` | `MqttMarketPayload[]` |
| `public/market/{marketId}/update` | `MqttMarketPayload` |
| `public/market/{marketId}/price` | `MqttPricePayload` |
| `public/market/{marketId}/orderbook` | `MqttOrderBookPayload` |
| `public/market/{marketId}/orderbook/update` | `MqttOrderBookUpdatePayload[]` |
| `public/market/{marketId}/trade` | `MqttTradePayload` |
| `public/market/{marketId}/resolved` | `MqttMarketResolvedPayload` |
| `public/comment/{event|series|market}/{entityId}` | `MqttCommentPayload` |
| `public/{source}/price/{symbol}` | `MqttBinancePricePayload` |
| `public/crypto-event/{eventSlug}/volume` | crypto event volume/trade event |
| `public/polymarket/tx_status/{proxyWallet}` | `MqttPolymarketTxStatusPayload` |

---

## 5. 建议后端服务边界

| 服务 | 对应前端 client/topic | 核心职责 |
|---|---|---|
| api-gateway | 全部 HTTP/WSS | 鉴权、限流、CORS、GraphQL routing、traceId |
| identity-svc | user gql | 登录、OAuth、SIWE/Solana sign-in、token refresh、2FA |
| wallet-svc | wallet gql, wallet topics | 钱包、Turnkey、提币、余额聚合、地址关注 |
| trading-svc | trading gql, order topics | swap、quote、订单、网络费、交易历史 |
| market-data-svc | meme2/core gql, public market topics | token 列表、详情、价格、OHLC、排行 |
| indexer-solana / indexer-evm | Kafka source | 链上事件解析、交易/池子/holder 增量 |
| candle-svc | OHLC GraphQL + MQTT | K线构建、TradingView datafeed |
| dex-symbol-svc | symbol dex gql, dex stream | futures symbol、收藏、banner、热门搜索 |
| hypertrader-svc | dex hypertrader gql | Hyperliquid proxy、smart money、地址分组 |
| copy-trading-svc | copytrade operations | 跟单配置、复制执行、黑名单 |
| prediction-svc | prediction gql + public topics | Polymarket public 数据、评论、搜索、体育赛事 |
| xp-user-svc | xp-user gql + private tx events | proxy wallet、CLOB order、USDC、claim、withdraw |
| agent-svc | agent gql | 邀请返佣、任务、等级、smart money 标签 |
| loyalty-svc | loyalty gql | Season、积分等级、排行榜 |
| redpacket-svc | redpacket gql/rest | 红包、抽奖、提现、Twitter 验证 |
| notification-svc | notification gql + user notifications | 站内信、Push、FCM/OneSignal、模板和偏好 |
| admin-svc | admin gql | 公告、链接配置、维护状态 |
| rpc-proxy | `VITE_RPC_PROXY_MEME` | 多链 RPC 代理、节点池、method 级限流 |

当前 Go Phase 4 MVP 暂由 `hypertrader-svc` 同时承接 `symbolDexClient` 和 `dexHyperTraderClient` 的前端兼容 facade，后续流量和团队边界稳定后可再拆出独立 `dex-symbol-svc`。

---

## 6. 核心数据模型

### 6.1 用户与钱包

```sql
users(id, email, phone, status, created_at, updated_at)
user_identity(id, user_id, provider, provider_uid, verified_at)
session(id, user_id, refresh_token_hash, device_id, expires_at, revoked_at)
wallet(id, user_id, chain_type, address, wallet_type, turnkey_org_id, name, sort, created_at)
wallet_security_event(id, user_id, wallet_id, action, risk_level, metadata_json, created_at)
wallet_whitelist(id, user_id, chain_type, address, label, created_at)
```

### 6.2 交易与订单

```sql
orders(
  id, user_id, chain_id, wallet_address, order_type, side,
  input_token, output_token, input_amount, expected_output_amount,
  min_output_amount, slippage_bps, route_snapshot_json,
  status, tx_hash, failure_code, client_request_id,
  created_at, updated_at, filled_at, expired_at
)

order_events(id, order_id, event_type, payload_json, created_at)
network_fee_snapshot(id, chain_type, payload_json, source, created_at)
```

### 6.3 Market data

```sql
token(id, chain_id, address, symbol, name, decimals, logo_url, launchpad, created_time)
token_statistic(token_id, timeframe, price, volume, liquidity, holder_count, tx_count, updated_at)
pool(id, chain_id, address, dex, token0, token1, fee_bps, created_time)
swap_event(id, chain_id, tx_hash, block_number, log_index, pool_id, trader, amount_in, amount_out, created_at)
candle(symbol, timeframe, open_time, open, high, low, close, volume)
```

### 6.4 Prediction

```sql
prediction_event(id, provider, provider_id, slug, title, status, volume, liquidity, starts_at, ends_at)
prediction_market(id, event_id, provider_market_id, question, condition_id, yes_token_id, no_token_id, status)
prediction_order(id, user_id, proxy_wallet, market_id, outcome, side, order_type, size, price, status, provider_order_id)
prediction_position(id, user_id, proxy_wallet, market_id, outcome, size, avg_price, realized_pnl, updated_at)
prediction_comment(id, entity_type, entity_id, user_id, body, parent_id, created_at)
```

### 6.5 增长和通知

```sql
reward_ledger(id, user_id, currency, amount, balance_after, source, ref_id, idempotency_key, created_at)
invite_relation(id, inviter_user_id, invitee_user_id, invite_code, created_at)
task_progress(id, user_id, task_id, status, progress_json, completed_at)
notification(id, user_id, template_code, title_i18n_key, body_i18n_key, data_json, read_at, created_at)
device_token(id, user_id, platform, token, provider, active, last_seen_at)
```

---

## 7. 迁移差距与风险

| 风险 | 当前证据 | 建议 |
|---|---|---|
| 前端直连第三方交易/行情 | Jupiter、Hyperliquid、Polymarket CLOB、CryptoCompare 等 | 用后端代理逐步替换，先从资金/交易路径开始 |
| endpoint 分散且 schema 重叠 | 多个 Apollo client，`future` 指向 `meme2`，`dexHyperTrader`/`hypertrader` 同源 | 建 gateway routing 表，先兼容，后合并 schema |
| public env 暴露 broker 凭据 | `VITE_USERNAME_MQTT_DEX`, `VITE_PASSWORD_MQTT_DEX` | public topic 使用 anon，私有 topic 使用 JWT ACL |
| codegen 中存在硬编码 token | `apps/host/codegen.ts` 的 xpUser schema header | 移到本地 `.env` 或 CI secret，避免提交长期 token |
| GraphQL 错误格式未完全标准化 | 前端只解析 `extensions.code/meta` | 后端统一 code、traceId、retryable、userAction |
| 部分接口命名不一致 | `GetRerferrerCode`, `GetHotSearchs`, 多处大小写混用 | 新 schema 修正命名，旧 schema 保留 alias |
| MQTT payload 缺少统一 seq | 当前多数直接 JSON payload | 增加 envelope 和 seq，旧客户端可继续读原 payload |
| 订单幂等不明显 | 前端 mutation 未统一携带 idempotency key | 新增可选 `clientRequestId`，逐步强制 |

---

## 8. 后端开发优先级

### P0：先保证当前前端可用

1. 搭建 API Gateway，并按环境变量路径完整转发当前 GraphQL endpoint。
2. 标准化鉴权、错误码、traceId、refresh token 行为。
3. 保持当前 16+ GraphQL 服务 schema 兼容，通过 codegen 校验。
4. MQTT broker 建 public/user ACL，覆盖订单、资产、token statistic、prediction topics。
5. RPC proxy、Jupiter/Hyperliquid/Polymarket 资金相关调用进入后端代理。

### P1：交易闭环

1. trading-svc 实现 quote/create tx/sign tx/check status/order history。
2. wallet-svc 实现 Turnkey 签名、提币、余额聚合、资金历史。
3. market-data-svc/indexer/candle-svc 支持 token detail、OHLC、transactions、pool/holder。
4. notification-svc 接入订单、提币、登录安全事件。

### P2：Prediction 和 Hyperliquid 完整体验

1. prediction-svc 聚合 Polymarket public 数据并提供搜索、体育、评论。
2. xp-user-svc 管 proxy wallet、CLOB 凭证、下单、claim、withdraw、relayer status。
3. hypertrader-svc 已完成 Go MVP facade、订单/审计、本地 provider 和 HTTP provider；下一步代理 Hyperliquid 私有 WS，补齐真实订单状态和 agent signer。
4. private WSS/MQTT 取代前端直连第三方私有 websocket。

### P3：增长和运营

1. loyalty/agent/redpacket 的 ledger 化和结算任务。
2. admin 配置、维护状态、公告弹窗、链接配置。
3. 风控、AML、审计日志、运营后台。

---

## 9. 验收标准

### 9.1 Schema 兼容

- `pnpm --filter xbit-web codegen` 可以对所有配置服务成功生成类型。
- 现有 operationName 在新后端上不报 unknown field/unknown operation。
- GraphQL 错误都带 `extensions.code`，认证错误能触发前端 refresh。

### 9.2 实时链路

- public MQTT 断线重连后能恢复 token statistic、orderbook、price topics。
- user MQTT 只能订阅自己的 `users/{userId}/...` topic。
- 订单状态从 create 到 confirmed/failed 可在 GraphQL 和 MQTT 上一致查询。

### 9.3 交易链路

- quote P99 < 800ms。
- create order 写入幂等，重复提交同一 `clientRequestId` 不重复扣款或下单。
- tx status 能覆盖 submitted、confirmed、failed、expired、cancelled。
- 所有签名和提币操作可审计。

### 9.4 数据一致性

- token 详情 GraphQL 首屏数据与 MQTT 增量字段兼容。
- K线历史和实时 candle 不跳点，TradingView datafeed 可连续加载。
- 资产余额在链上确认后最终一致，前端 refresh 后不回退到旧余额。

---

## 10. 与 `BACKEND_DESIGN.md` 的关系

`BACKEND_DESIGN.md` 适合作为后端总架构蓝图：服务拆分、基础设施、数据层、链交互、安全和容灾。

本文建议作为研发落地 checklist：

- 后端排期按本文 P0/P1/P2/P3。
- schema 变更先对照本文的前端入口和 operation 范围。
- 任何 endpoint 合并都先做兼容 facade，再让前端逐步收敛 Apollo client。
