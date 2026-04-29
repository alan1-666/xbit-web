type Position = {
  address: '0x9C...65D'
  side: '多头'
  leverage: '34.4X'
  value: 117235.24
  entryPrice: 117357.24
  margin: 4.6
  pnl: 8.686
  pnlPercent: 100
  holdTime: '12D 23H'
}

type TokenItem = {
  tokenName: string // 代币名
  tokenPrice: number // 当前价格
  priceChange: number // 涨跌百分比
  positions: Position[] // 地址持仓详情列表
}

type AddressEvent = {
  avatar: string // 用户头像（SVG路径或URL）
  address: string // 地址，如 0x9C...65D
  action: '开多-建仓' | '开空-加仓' | '平多-清仓' | '平空-减仓'
  symbol: string // 交易对，例如 BTC
  leverage: number // 杠杆倍数
  pnl: number // 盈亏金额
  pnlPercent: number // 盈亏百分比
  entryPrice: number // 开仓价格
  closePrice?: number // 平仓价格（可选）
  createTime: string // 事件时间
}

export const tokenList = [
  {
    tokenName: 'NOBODY',
    tokenPrice: 0.24525,
    priceChange: -2.45,
    positions: [
      {
        address: '0x9C...65D',
        side: '多头',
        leverage: '34.4X',
        value: 117235.24,
        entryPrice: 117357.24,
        margin: 4.6,
        pnl: 8.686,
        pnlPercent: 100,
        holdTime: '12D 23H',
      },
      {
        address: '0x9C...65D',
        side: '空头',
        leverage: '50X',
        value: 105000,
        entryPrice: 117000,
        margin: 3.6,
        pnl: -4.32,
        pnlPercent: -50,
        holdTime: '10D 4H',
      },
    ],
  },
  {
    tokenName: 'BTCUSDT',
    tokenPrice: 62000,
    priceChange: 3.1,
    positions: [
      {
        address: '0x9C...65D',
        side: '多头',
        leverage: '34.4X',
        value: 117235.24,
        entryPrice: 117357.24,
        margin: 4.6,
        pnl: 8.686,
        pnlPercent: 100,
        holdTime: '12D 23H',
      },
      {
        address: '0x9C...65D',
        side: '空头',
        leverage: '50X',
        value: 105000,
        entryPrice: 117000,
        margin: 3.6,
        pnl: -4.32,
        pnlPercent: -50,
        holdTime: '10D 4H',
      },
    ],
  },
]

export const addressList = [
  {
    avatar: '/avatars/1.svg',
    address: '0x9c9c...e7ad',
    action: '开多-建仓',
    position: {
      symbol: 'ETH',
      leverage: 10,
      entryPrice: 3500,
      sz: '-123.34'
    },
    symbol: 'BTC',
    leverage: 5,
    pnl: 623,
    everyPrice: 14245.23432,
    endPrice: 14245.23432,
    pnlPercent: 6.24,
    entryPrice: 101115.42,
    timestamp: '2025-11-11T12:30:00Z',
  },
  {
    avatar: '/avatars/2.svg',
    address: 'james wynn',
    action: '平空-减仓',
    position: {
      symbol: 'ETH',
      leverage: 10,
      entryPrice: 3500,
      sz: '-123.34'
    },
    symbol: 'BTC',
    leverage: 5,
    pnl: -81115.42,
    everyPrice: 14245.23432,
    endPrice: 14245.23432,
    pnlPercent: -34.52,
    entryPrice: 101115.42,
    timestamp: '2025-11-11T10:20:00Z',
  },
]


export const coinList = [
  {
    icon: '',
    symbol: 'NOBODY',
    follower: 12,
    value: 234.44,
  },
  {
    icon: '',
    symbol: 'NOBODY',
    follower: 12,
    value: 234.44,
  },
  {
    icon: '',
    symbol: 'NOBODY',
    follower: 12,
    value: 234.44,
  },
  {
    icon: '',
    symbol: 'NOBODY',
    follower: 12,
    value: 234.44,
  },
  {
    icon: '',
    symbol: 'NOBODY',
    follower: 12,
    value: 234.44,
  },
  {
    icon: '',
    symbol: 'NOBODY',
    follower: 12,
    value: 234.44,
  },
  {
    icon: '',
    symbol: 'NOBODY',
    follower: 12,
    value: 234.44,
  },
  {
    icon: '',
    symbol: 'NOBODY',
    follower: 12,
    value: 234.44,
  },
  {
    icon: '',
    symbol: 'NOBODY',
    follower: 12,
    value: 234.44,
  },
  {
    icon: '',
    symbol: 'NOBODY',
    follower: 12,
    value: 234.44,
  },
  {
    icon: '',
    symbol: 'NOBODY',
    follower: 12,
    value: 234.44,
  },
]
