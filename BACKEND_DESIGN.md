# XBIT DEX 后端服务设计文档

> 基于前端项目 `app-web-v2` 反推 + 业内成熟实践整理。覆盖前端已有的全部 GraphQL 端点、WS/MQTT 通道、RPC 代理、业务特性。

> 落地接口契约、前端 operation 清单、MQTT topic 和迁移优先级见 [`BACKEND_FRONTEND_CONTRACT.md`](./BACKEND_FRONTEND_CONTRACT.md)。

> Go 技术栈开发阶段、服务交付清单和近期 4 周计划见 [`BACKEND_GO_DEVELOPMENT_PLAN.md`](./BACKEND_GO_DEVELOPMENT_PLAN.md)。

---

## 0. 前言

### 0.1 设计目标
- 支撑前端已有的 **17 个 GraphQL 端点 + 多套 WS/MQTT + RPC 代理**
- 多链：Solana mainnet + EVM (Ethereum / Arbitrum / BSC) + Hyperliquid L1
- 业务覆盖：现货 swap、期货、跟单、跨链、红包、忠诚度、邀请返佣、智能钱包追踪、Meme 发现、预测市场
- 高可用、可水平扩展、可观测、合规可审计

### 0.2 总体原则
1. **业务边界 = 服务边界**：每个 GraphQL endpoint 背后就是一个独立微服务（前端的 17 client 设计已经在暗示这一点）
2. **状态分层**：链上为最终真相，链下做加速 + 业务态；不在链下持久化"链上能查到"的东西超过缓存语义
3. **写入路径同步、读取路径异步**：用户提交订单同步返回签名结果；行情/历史走流式聚合
4. **绝不直接对外暴露 RPC**：所有 RPC 调用过自建代理，做限流、缓存、节点切换、密钥隔离
5. **签名永不出域**：托管钱包私钥永不离开 Turnkey/HSM；非托管钱包永不接收私钥
6. **幂等 + 可重放**：所有写操作携带 client request id；所有链上动作可在掉电后恢复

---

## 1. 顶层架构

### 1.1 服务全景图（逻辑分层）

```
┌─────────────────────────────────────────────────────────────────┐
│                        客户端 (Web / iOS / Android)              │
└────────────────┬────────────────────────────┬───────────────────┘
                 │ HTTPS/WSS                  │ MQTT/WSS
        ┌────────▼─────────┐         ┌────────▼─────────┐
        │   API Gateway    │         │  Stream Gateway  │
        │  (Apollo Router  │         │ (EMQX / NATS WS) │
        │   + REST proxy)  │         └────────┬─────────┘
        └────────┬─────────┘                  │
                 │                            │
   ┌─────────────┴──────────────┐  ┌──────────┴──────────┐
   │  GraphQL Federation 层      │  │  Pub/Sub Bus (Kafka)│
   │  (subgraph composition)    │  └──────────┬──────────┘
   └─┬────┬────┬────┬────┬─────┬┘             │
     │    │    │    │    │     │              │
   ┌─▼┐ ┌─▼┐ ┌▼─┐ ┌▼─┐ ┌▼─┐ ┌─▼──────────────▼──────┐
   │身│ │交│ │发│ │资│ │增│ │   实时引擎集群           │
   │份│ │易│ │现│ │产│ │长│ │ (撮合行情/订单簿/K线)    │
   └─┬┘ └─┬┘ └─┬┘ └─┬┘ └─┬┘ └─┬─────────────────────┘
     │    │    │    │    │    │
   ┌─▼────▼────▼────▼────▼────▼──────────────────────┐
   │           链交互层 (Chain Interaction Layer)       │
   │  ┌──────────┐  ┌──────────┐  ┌──────────────┐    │
   │  │ EVM 节点 │  │Solana 节点│  │ Hyperliquid │    │
   │  │ 池(rotat)│  │ Geyser/RPC│  │ HTTP+WS API │    │
   │  └──────────┘  └──────────┘  └──────────────┘    │
   │  ┌──────────────────────────────────────────┐    │
   │  │  Indexer 集群 (Subsquid / Geyser stream) │    │
   │  └──────────────────────────────────────────┘    │
   │  ┌──────────────────────────────────────────┐    │
   │  │  签名服务 (Turnkey / HSM / KMS)          │    │
   │  └──────────────────────────────────────────┘    │
   └────────────┬────────────────────────────────────┘
                │
   ┌────────────▼────────────────────────────────────┐
   │  数据层 (Postgres / TimescaleDB / Redis / S3)   │
   └──────────────────────────────────────────────────┘
```

### 1.2 部署拓扑

- **环境**：dev / unstable / staging / prod 共四套（与前端 `.env.*` 对齐）
- **区域**：主区 + 灾备区双活，核心服务多 AZ
- **入口**：Cloudflare → AWS ALB → Envoy（mTLS）→ 服务网格（Linkerd 或 Istio）
- **服务编排**：Kubernetes（EKS）+ Argo CD GitOps
- **命名空间隔离**：`gateway-*`、`trading-*`、`indexer-*`、`infra-*`

---

## 2. 服务域拆分（与前端 GraphQL client 一一对应）

每个 GraphQL endpoint = 一个 subgraph（用 Apollo Federation 或 Hasura Remote Schema 组合），背后是 1~N 个微服务。

| 服务域 | 前端端点 | 职责 | 技术栈建议 |
|---|---|---|---|
| **identity-svc** | `wallet`, `auth` | 注册、登录、Token 刷新、Turnkey 会话、设备指纹绑定 | Go / NestJS |
| **wallet-svc** | `wallet` | 钱包元数据、地址组、余额聚合、签名编排 | Go |
| **meme-svc** | `meme` | Meme token 发现、热度榜、新发币 feed | Rust + Postgres |
| **trading-svc** | `trading-gql` | 现货 swap 路由、报价聚合、交易构造、提交 | Go + Rust |
| **dex-symbol-svc** | `symbol-dex` | 交易对元数据、池子元数据、token 元数据 | Go |
| **agent-svc** | `dex-agent` | Smart money 追踪、KOL 钱包标签、信号生成 | Python (数据科学) + Go |
| **hypertrader-svc** | `dex-hypertrader`, `hypertrader` | Hyperliquid 期货代理、交易构造、PnL 计算 | Go |
| **futures-svc** | `future` | 期货撮合元数据、保证金计算、清算预警（如自营撮合） | Go |
| **prediction-svc** | `prediction` | Polymarket 行情代理、预测市场聚合 | Node.js |
| **loyalty-svc** | `loyalty` | 积分账本、等级、任务、签到 | Go |
| **redpacket-svc** | `redpacket` | 红包发放、抢、链上结算 | Go |
| **affiliate-svc** | `affiliate` | 邀请关系、返佣计算、结算 | Go |
| **xp-user-svc** | `xp-user` | 用户经验值、成长体系 | Go |
| **notification-svc** | `notification` | 站内信、推送编排（OneSignal/FCM）、模板 | Node.js |
| **admin-svc** | `admin` | 后台运营、风控规则配置 | NestJS |
| **bridge-svc** | (REST/Rango 包装) | 跨链桥报价、状态查询、补单 | Go |
| **copy-trading-svc** | (REST + WS) | 跟单关系、信号复制、风控 | Go |
| **monitoring-svc** | (REST + WS) | 用户自定义价格预警、告警分发 | Go |

**为什么这样拆**：业务变化频率不同 + 数据库不同 + 团队不同 + SLA 不同。例如 `loyalty-svc` 一周改 N 次，`trading-svc` 改一次心惊肉跳，必须解耦。

---

## 3. 接入层 (Edge / Gateway)

### 3.1 API Gateway

**技术选型**：Apollo Router (Rust) 做 GraphQL Federation，前面挂 Envoy 做 L7。

**职责**：
- GraphQL schema 组合：聚合 17 个 subgraph，对外呈现统一 schema（前端的 17 client 可以**逐步收敛成 1 个**，分阶段迁移）
- 鉴权：解析 JWT，把 `userId / deviceId / scope` 注入 GraphQL context（headers）
- 限流：按 userId / IP / operation name 三维度
- 持久化查询（APQ）：减小 payload，挡 DDoS
- Query depth / complexity 限制：防爬虫嵌套查询打挂
- CORS / CSP / 响应头注入

**为什么不直接保留 17 个 client**：前端那种做法是为了"缓存隔离"，本质是绕过了 Apollo 的 typePolicies。后端做 federation 后，前端可以单 client + 用 directive 控制 cache，技术债自然消化。

### 3.2 REST 代理层

- `/api/rpc-meme` → RPC Proxy 服务（见 §6.1）
- `/api/gamma` `/api/data` `/api/pnl` → Polymarket 反代（加缓存、加 ratelimit）
- `/api/hyperliquid/info` → Hyperliquid 反代

### 3.3 Stream Gateway

**技术选型**：EMQX 集群（5+ 节点）做 MQTT broker，前端已有 `mqtt 5.8.0` 客户端。WebSocket fallback 用 `graphql-ws`。

**Topic 设计**：
```
dex/{chain}/token/{mint}/price          # 价格 tick
dex/{chain}/token/{mint}/trades         # 成交
dex/{chain}/pool/{poolId}/depth         # 深度
hyperliquid/symbol/{sym}/candle/{tf}    # K线
hyperliquid/user/{uid}/orders           # 用户订单（私有 topic, ACL）
user/{uid}/notification                 # 站内消息
```

**鉴权**：MQTT CONNECT 携带 JWT，Broker 调 identity-svc 验证；ACL 表控制订阅权限（user 私有 topic 只能订阅自己）。

**为什么 MQTT 不用纯 WS**：MQTT 天然支持 QoS、retained message、wildcard topic、桥接，运营成本低于自己造 pub/sub 协议。

---

## 4. 身份与钱包子系统

### 4.1 认证流程矩阵

| 登录方式 | 前端入口 | 后端处理 |
|---|---|---|
| Email + 密码 | login page | identity-svc 颁发 JWT，密码用 argon2id |
| Google / Apple OAuth | Firebase Auth | 前端拿 idToken，后端 verify，绑定/创建 user |
| Turnkey WebAuthn | turnkey login | 调 Turnkey API 创建 sub-organization，存 orgId |
| Wallet 签名 (SIWE / Sign-In With Solana) | wagmi connector | 后端发 nonce → 前端签 → 验证 → 颁发 JWT |
| Telegram | telegram callback | 验证 Telegram WebApp initData hash |

### 4.2 JWT 设计

```
access_token:  15min, JWT (RS256), claims: { uid, did, scope, exp, iat, sid }
refresh_token: 30d,  opaque (Redis-backed), 一次性 (rotation)
```
- **关键**：refresh 旋转 + reuse detection（用过的 refresh 再来 → 整个会话登出，发安全事件）
- 前端的 `refreshingPromise` 锁机制对应后端要支持**并发 refresh 的幂等**

### 4.3 设备指纹与风控

- 前端 Fingerprint.js 上报 `visitorId`，后端绑定 `did → uid` 关系
- 异常登录：新设备 → 邮件/Push 通知 + 强制二次验证
- 设备黑名单 / 速率限制（同 IP 15 分钟 5 次失败 → 封 1h）

### 4.4 钱包托管模型

- **托管钱包（Turnkey）**：用户走社交登录后，后端为其在 Turnkey 创建 sub-org + 钱包；签名时由 wallet-svc 调 Turnkey API；私钥**永远在 Turnkey 内**
- **非托管钱包**：用户连接 MetaMask/Phantom，后端只存地址，签名走前端
- **混合**：同一 user 可绑定多个钱包，主钱包用于扣费/积分，业务钱包按需切换

### 4.5 地址组（AddressGroup）

前端有 `AddressGroupsProvider`，对应后端 schema：
```
address_group(id, user_id, name, color, sort)
address_group_member(group_id, address, chain, label)
```
查询路径加二级缓存，因为这是极高频读。

---

## 5. 数据层

### 5.1 数据库选型矩阵

| 数据特征 | 选型 | 用途 |
|---|---|---|
| 强事务、关系型 | **PostgreSQL 16**（主从 + Patroni） | 用户、钱包、订单、积分账本、邀请关系 |
| 时序 | **TimescaleDB**（PG 扩展） | K线、价格历史、PnL 时序 |
| KV 缓存 | **Redis Cluster** | session、报价缓存、限流计数、token 元数据热数据 |
| 分布式 KV | **ScyllaDB / Cassandra** | 链上事件流、超大规模 holder 表 |
| 列式分析 | **ClickHouse** | 行情明细、撮合 tick、用户行为埋点、风控分析 |
| 全文/向量 | **OpenSearch** | token 搜索、KOL 搜索 |
| 对象存储 | **S3** | 头像、token logo、合规文档、审计日志归档 |
| 消息队列 | **Kafka**（核心）+ **NATS JetStream**（轻量） | 事件总线、异步任务 |

### 5.2 关键表结构（概念层）

只列复杂的几个：

**`order`（链下订单簿 / 限价单）**
```
id (uuid)
user_id, chain, type (limit/market/stop), side
input_token, output_token, input_amount, min_output
trigger_price (limit) / trigger_condition (stop)
status (pending/partially_filled/filled/cancelled/failed)
created_at, expires_at, filled_at
tx_hash[] (可能多笔成交)
client_request_id (幂等键)
slippage_bps, route_snapshot (jsonb, 当时聚合的报价)
```

**`copy_trading_relation`**
```
follower_uid, leader_uid, leader_wallet
copy_amount_mode (fixed/percent/full)
copy_value, max_per_trade, max_daily, stop_loss_pct
status (active/paused/stopped)
filters (jsonb, 链/dex/token 黑白名单)
```

**`reward_ledger`（双面记账）**
```
ledger_id, user_id, currency, amount (signed)
balance_after, source (swap_rebate/invite/airdrop/...)
ref_id, idempotency_key
created_at
```
所有"加积分""减积分"都是 append-only entry，**不直接 UPDATE 余额**。余额在物化视图或 Redis 中维护。

### 5.3 时序数据策略

- TimescaleDB hypertable 按 `time` + `symbol` 双键
- **保留策略**：1m K → 7d 原始；5m → 30d；1h → 1y；1d → 永久
- 老数据走 continuous aggregates 自动降采样
- 行情写入 ClickHouse 的同时 fan-out 到 Redis 做最近 1 小时热数据

### 5.4 缓存与一致性

- **读多写少**（token 元数据、池元数据）：Redis + write-through，TTL 5min + 主动失效
- **频繁变化**（价格、深度）：Redis Pub/Sub + 客户端订阅 MQTT，**不查缓存**
- **强一致**（余额、订单状态）：直查 PG，不进缓存
- **缓存击穿**：用 Redis SETNX + 单飞（singleflight）保护回源

---

## 6. 链交互层

### 6.1 RPC 代理（前端 `/api/rpc-meme` 对应）

**职责**：
- 节点池管理：每条链维护 N 个 RPC（自建 + 第三方 Helius / QuickNode / Ankr）
- 健康检查：每 5s 探活，失败节点降权
- 请求路由：按 method 路由（写请求只走自建保签节点；读请求走最低延迟）
- 缓存：`getBlockHeight` 1s、`getAccountInfo` 5s、`getMultipleAccounts` 不缓存
- 限流：客户端 ID + 方法维度，防被刷爆
- 隐藏真实节点 URL，避免被白嫖

**部署**：Envoy + Lua 插件 / 自研 Rust 服务（zero-copy, 高吞吐）

### 6.2 Indexer 集群

**Solana**：
- **Geyser plugin** 直连 validator，订阅账户变更和交易
- 解析 Pumpfun / Raydium / Meteora / Orca 等池子的 swap 事件
- 写入 Kafka topic `solana.swap.v1`

**EVM**：
- Subsquid / 自研 Substreams 风格服务
- 监听 Uniswap V2/V3、PancakeSwap、各 launchpad 工厂合约
- 处理 reorg：保留最近 N 块的"待确认"层，确认后入库

**Hyperliquid**：
- 直接走官方 WS API，落地为权威源（Hyperliquid 是 L1，无需自己 indexer）

**关键设计**：
- 所有 indexer 输出**统一 swap 事件 schema**：`{chain, dex, pool, token_in, token_out, amount_in, amount_out, trader, tx_hash, block_time, slot}`
- 下游 trading-svc / agent-svc / dex-symbol-svc 都从 Kafka 消费，不直接读节点

### 6.3 签名服务

```
Sign Request → wallet-svc → 检查权限 + 风控 → Turnkey API → 返回签名
                                            └ HSM (运营资金) → 返回签名
```
- 用户级签名走 Turnkey
- 平台运营资金（红包发放、做市资金）走自建 HSM（AWS CloudHSM 或 Fireblocks）
- 所有签名调用记 audit log，不可删

### 6.4 交易广播与跟踪

- 提交 → 本地 mempool → 多节点并行广播（提高落块率）
- 跟踪：每 2s 查 status，30s 未确认重试加 priority fee（EVM）/ recent blockhash 刷新（Solana）
- 失败原因分类：blockhash expired / slippage / out of gas / 用户拒绝
- 状态变更通过 Kafka 推到 notification-svc 和 trading-svc

---

## 7. 交易子系统（最核心）

### 7.1 Swap 路由聚合

**架构**：
```
报价请求 → quote-aggregator
            ├─ Jupiter API (Solana)
            ├─ 1inch / 0x (EVM)
            ├─ 自建路由器 (基于 indexer 数据计算最优)
            └─ Rango (跨链)
        ↓ 并发查询，超时 800ms
返回 N 个报价 → 排序（净输出 - gas - 平台费）→ 返回前 3 个 + best
```

**关键点**：
- **报价缓存极短（≤2s）**：超时直接重新查，因为价格变化快
- **报价快照入库**：用户接受报价 → 把当时的 route 存到 order，链上失败时审计
- **平台费**：在路由层对 output 减 X bps，转入平台金库地址（合约层 fee 比代码层 fee 更可信）

### 7.2 Hyperliquid 期货后端

虽然 Hyperliquid 是 L1（撮合在链上），但平台仍需要后端做：

- **代理 + 缓存 Hyperliquid HTTP API**：避免前端打 Hyperliquid 公网，省带宽 + 加自定义字段
- **PnL 计算服务**：聚合用户成交，按 FIFO/平均成本算实现盈亏 + 未实现盈亏
- **资金费率历史**：indexer 拉历史，本地存 ClickHouse 加速查询
- **持仓预警**：实时监控用户保证金率，<阈值推 push（notification-svc）
- **跟单信号源**：把 leader 钱包的成交事件转成 follow signal 入 Kafka

### 7.3 限价单 / 止盈止损（链下订单簿）

**为什么需要后端**：链上 swap 是市价的，限价 = 后端守一个价格阈值，触发时帮用户提交。

**架构**：
```
order-keeper (常驻服务)
  ├─ 订阅 Kafka 价格流
  ├─ Redis ZSET 按触发价排序的活动订单
  ├─ 价格 tick 到达 → 二分查找该触发的订单
  ├─ 触发 → 发任务到 executor 队列
  └─ executor → 调 swap 路由 → 签名（用户授权额度）→ 广播
```
**用户授权**：要么用户预签 EIP-2612 permit / Solana delegate，要么走托管钱包自动签。

**风控**：
- 单笔最大金额、单日最大金额
- 价格异常熔断（短时间偏离中位数 X% 不执行）
- 订单过期自动取消

### 7.4 跟单交易

```
leader 成交事件 (Kafka) 
    → fan-out 到 N 个 follower（按 copy_relation 表 join）
    → 每个 follower 计算复制金额（按比例/固定）
    → 走限价单/市价单同一执行通道
    → 跟单状态回写 + 通知
```
- 延迟目标：leader 成交后 follower 提交 ≤ 500ms
- **逆选择问题**：leader 提前知道自己要交易，可能薅 follower → 加最小延迟随机化 + 滑点保护

### 7.5 跨链桥（Rango 包装）

- 报价：直接代理 Rango，加平台费
- 状态：定时轮询 Rango status API，事件入 Kafka
- 补单：长时间未到账 → 触发人工 + 自动重试机制

---

## 8. 行情与发现

### 8.1 K线服务

**写入路径**：
```
indexer swap 事件 → Kafka → candle-builder
    → 1s K (in-memory ring buffer)
    → flush 到 TimescaleDB
    → 实时推 MQTT topic
```
**读取路径**：
- 历史：HTTP query → ClickHouse / TimescaleDB（前端 TradingView 自定义 datafeed）
- 实时：MQTT 订阅，前端增量合成最新 candle

**多周期处理**：1s 是基础单位，多周期由 continuous aggregate 自动维护，避免重复计算。

### 8.2 Token 发现与排行

**热度分**：综合 1h volume、holder 增量、unique trader 数、价格涨幅、社交提及（可选 Twitter API）。
- 计算频率：1 分钟全量 + 实时增量
- 存 Redis ZSET，前端分页直接读

**新发币**：indexer 监听各 launchpad 的 `tokenCreated` 事件，5s 内可见。

### 8.3 Smart Money / KOL 追踪

**离线分析（Python + Spark）**：
- 每天扫所有钱包近 30d 表现：胜率、PnL、夏普、最大回撤
- 打 tag：`whale / kol / sniper / mev / insider`
- 结果回写 PG，agent-svc 提供查询

**实时信号**：标记的 smart money 钱包成交 → Kafka → 推送给关注用户

### 8.4 Holder / Pool 分析

- holders 表分片：按 token mint hash 分片到 ScyllaDB
- 池子 TVL / APY：indexer 每分钟快照，TimescaleDB 存历史

---

## 9. 增长 & 运营子系统

### 9.1 邀请返佣

```
user 注册 → 携带 invite code → 写 invite_relation
user 交易 → trading-svc 出 trade_settled 事件
        → affiliate-svc 消费 → 计算多级返佣（一般 2 级）
        → 写 reward_ledger
        → 触发结算（按周/手动）
```
- **防刷**：同设备指纹 / 同 IP / 自邀请检测
- **多级返佣的循环检测**：不允许 A→B→A

### 9.2 红包

```
发红包：用户存入金额 → 平台合约托管 → 生成红包 ID + 链接
抢红包：调 backend 校验 → backend 用平台签名钱包发起转账（或合约一笔到位）
风控：领取限速、同 IP 限领、设备指纹去重
过期：未领完链上自动退回（合约设计）
```
**关键**：红包资产**必须先入合约**，不允许"先白条后扣款"。

### 9.3 忠诚度 / 任务 / 经验值

- 任务定义：jsonb 配置（条件 + 奖励），不写死代码
- 进度追踪：消费业务事件 → 更新 progress
- 等级表：经验阈值 → 等级 → 权益（手续费折扣等）
- **手续费折扣联动 trading-svc**：报价时调 loyalty-svc 拿用户 tier，影响 fee bps

### 9.4 通知子系统

```
business event → Kafka topic notification.outbound
                  ↓
            notification-svc
                  ├─ 模板渲染（多语言 fallback）
                  ├─ 用户偏好检查（订阅了哪些 channel）
                  ├─ 去重 + 频率控制
                  └─ 分发：
                        ├─ Push (OneSignal / FCM)
                        ├─ MQTT (in-app)
                        ├─ Email (SES)
                        └─ Telegram bot
```
- **关键**：去重窗口（5 分钟内同类型同 ref 不重复发）
- 重要消息（资金类）必发，不受用户偏好压制

### 9.5 价格预警 / 监控

```
用户配置 → monitoring-svc 写 PG + Redis（按 token 索引）
价格 tick → 匹配规则 → 触发 → 发通知
```
- 规则评估：每 token 每 tick O(规则数)，要做 in-memory 索引
- 已触发的规则进入冷却期，避免抖动

---

## 10. 横切关注点

### 10.1 配置中心

- 静态配置：Helm values + ConfigMap
- 动态配置：Apollo Config / Nacos
- **特性开关**：GrowthBook 自建 proxy（前端已用），后端也接同一套，前后端共享实验
- 链相关配置（RPC 列表、合约地址）：单独 git 仓库 + CI 自动同步，**变更要 PR review**

### 10.2 可观测性

| 维度 | 工具 |
|---|---|
| Trace | OpenTelemetry → Tempo / Jaeger |
| Metric | Prometheus + Thanos（长期存储） |
| Log | Loki / ClickHouse + Grafana |
| Error | Sentry（与前端共用一个 project）|
| Uptime | Grafana synthetic + 第三方 (Better Stack) |

**关键 SLI**：
- 报价延迟 P99 < 800ms
- 订单提交成功率 > 99.5%
- WS 推送延迟 P99 < 200ms
- API 可用性 > 99.95%

### 10.3 风控引擎（独立服务）

- **规则引擎**：基于 OpenPolicyAgent（Rego）或自研 DSL
- **触发点**：每个写操作前同步调用（评估 < 50ms）
- **维度**：用户级（频次、金额）、设备级、IP 级、链级（黑名单地址）、token 级（黑名单合约）
- **降级**：风控服务挂了 → fail-closed（拒绝交易）而非 fail-open

### 10.4 反洗钱（AML）

- 集成 Chainalysis / TRM Labs API：地址打分
- 入金前查地址：来自 OFAC / 黑客地址 → 拒绝
- 大额交易（>$10k）触发人工 review
- 审计 log 保留 7 年

### 10.5 国际化与文案

- 翻译走单独服务（i18n-svc），CDN 分发 JSON（前端已实现 `VITE_TRANSLATION_VERSION`）
- 后端的错误码 → 前端按 code 查翻译，**不返回明文**给前端
- 时区：所有时间用 UTC 存，前端按用户偏好渲染

---

## 11. 安全设计（DEX 致命的一环）

### 11.1 资金安全

- **运营钱包冷热分离**：99% 冷（多签 / Fireblocks），1% 热（每日补充）
- **签名权限分级**：开发/SRE 永远拿不到 prod 私钥；签名通过工单审批 + 多人审签
- **合约升级权**：timelock + 多签，紧急暂停权限独立

### 11.2 接口安全

- **所有写操作要签名**：不仅 JWT，关键操作（提币、修改邀请关系）要钱包签消息或 2FA
- **重放保护**：客户端请求带 nonce + timestamp，5 分钟外拒绝
- **CSRF**：纯 token bearer + same-site cookie，不接受 GET 写
- **WAF**：Cloudflare + 自定义规则

### 11.3 数据安全

- 用户 PII 字段加密存（KMS envelope encryption）
- 数据库到位：行级加密 + at-rest encryption
- 备份每日 + 异地 + 季度恢复演练

### 11.4 内部安全

- 所有内部调用 mTLS
- 服务账号最小权限（IAM + DB 权限粒度到表/操作）
- 上线流程：CI 出包 → 安全扫描（Snyk / Trivy）→ Argo CD → 灰度 → 全量
- 私钥 / API key 从 Vault 拉，绝不进 git，绝不进容器镜像

### 11.5 智能合约审计

- 自营合约（红包合约、平台费合约、限价单 executor 合约）必须经过两家审计 + 公开 bug bounty
- 升级合约用 OpenZeppelin Upgradeable + timelock

---

## 12. 容灾与失败模式

| 故障 | 影响 | 应对 |
|---|---|---|
| 主 RPC 节点挂 | swap 不可用 | 自动切备用节点（5s 内） |
| Indexer 落后 | 行情/发现页延迟 | 监控 lag，超阈值告警；前端展示 "数据延迟" |
| Postgres 主库挂 | 写入中断 | Patroni 自动切主 (30s)，前端重试有兜底 |
| Kafka 集群分区 | 事件堆积 | 多 broker + min.insync.replicas=2 |
| Turnkey 不可用 | 托管钱包不能签 | 切到备用 KMS 区域；非托管钱包不受影响 |
| Hyperliquid 官方 API 挂 | 期货不可用 | 前端展示降级页；状态写入 status page |
| 价格预言机被操纵 | 限价单错误触发 | 多源中位数 + 异常熔断 |
| 单条链 reorg | 交易状态错乱 | indexer 等待 N 块确认才入库；UI 显示 "确认中" |

**Game Day 演练**：每季度模拟一次 P0 故障，强制走完应急流程。

---

## 13. 性能与扩展性目标

| 项 | 目标 |
|---|---|
| 同时在线用户 | 100k → 1M |
| 报价 QPS | 10k |
| 实时推送连接 | 500k |
| 订单提交 P99 | < 1.5s（含链上确认） |
| 存量数据 | 50TB+（行情 + 事件） |

**扩展策略**：
- 无状态服务全部水平扩
- PG 按 user_id 分库（hash 分片到 16/32 库）
- ClickHouse 按时间 + token 双键分片
- 行情推送服务挂连接独立扩，每节点 50k 连接
- Kafka 按业务 topic 拆 partition，关键业务 partition >= 64

---

## 14. 上线节奏建议（按依赖排序）

1. **基础设施**：K8s、Vault、Kafka、Postgres、Redis、监控栈
2. **identity-svc + wallet-svc + RPC 代理**（一切之基础）
3. **indexer 集群 + dex-symbol-svc + meme-svc**（数据流通）
4. **trading-svc + 报价聚合**（核心交易）
5. **Stream Gateway + K线/价格推送**（实时体验）
6. **限价单 / 跟单 / 期货代理**（高级交易）
7. **loyalty / affiliate / redpacket / notification**（增长）
8. **agent / smart money / prediction**（高级发现）
9. **admin / 风控 / AML**（运营 + 合规）

---

## 15. 与前端的契约约定

为了和已有前端无缝对接：

- **GraphQL schema 必须保留前端已用的字段**（迁移期）；新字段走 schema evolution，不破坏旧版本
- **错误格式统一**：`{ code, message, retryable, traceId }`；前端的 `GqlError` wrapper 已经在等这个
- **WS 消息格式统一**：`{ topic, payload, ts, seq }`；seq 用于客户端检测丢包
- **分页一律 cursor-based**（前端 Apollo cache 友好）
- **i18n 错误码**：后端只回 code，文案前端查（前端 i18n 已就绪）

---

## 16. 后端代码仓库建议结构

```
xbit-backend/
├── services/
│   ├── identity-svc/
│   ├── wallet-svc/
│   ├── trading-svc/
│   ├── indexer-solana/
│   ├── indexer-evm/
│   └── ...
├── libs/
│   ├── go-common/         # logger, tracing, error, config
│   ├── proto/             # gRPC schemas
│   ├── graphql-schema/    # 联邦 schema 源
│   └── chain-clients/     # 链 RPC 抽象
├── deploy/
│   ├── helm/              # 每个服务一个 chart
│   └── argocd/
└── tools/
    ├── scripts/
    └── migrations/        # SQL migrations
```
**Monorepo + Bazel/Nx 构建**，与前端保持一致心智。

---

## 总结

这套设计的核心思想：**链上是真相、链下是体验、事件流是骨架、Kafka 是大动脉**。所有看似独立的功能（swap、跟单、红包、积分、通知）其实都靠"事件 + 异步消费"串起来，这是 web3 后端区别于传统 web2 后端的关键 —— **必须接受"链是异步的、是不可控的、是会回滚的"**这个事实，整个架构围绕这个事实展开。
