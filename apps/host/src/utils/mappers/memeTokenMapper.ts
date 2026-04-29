import { MqttNewMemeToken } from '@/types/mqtt.ts'
import { MemeDto } from '@/@generated/gql/graphql-meme2.ts'

const calculateDevHold = (item: MqttNewMemeToken) => {
  if (item.dhp) return +item.dhp * 100
  if (item.dhb && item.totalSupply) {
    return (+item.dhb / +item.totalSupply) * 100
  }
  return 0
}

const calculateInsiderTrading = (item: MqttNewMemeToken) => {
  if (item.insiderTradingPercentage) {
    return +item.insiderTradingPercentage * 100
  }
  return 0
}

const calculateSniperHold = (item: MqttNewMemeToken) => {
  if (item.sniperPercentage) {
    return +item.sniperPercentage * 100
  }
  if (item.sniperHoldAmount && item.totalSupply && item.decimals) {
    return (+item.sniperHoldAmount / +item.totalSupply) * 100 * Math.pow(10, item.decimals)
  }
}

export const memeTokenMapper = {
  fromMqttNewMemeToken: (item: MqttNewMemeToken) => {
    return {
      ...item,
      token: item.token || item.address,
      buyTxs1h: item.txb ? +item.txb : 0,
      buyTxs1m: item.txb ? +item.txb : 0,
      buyTxs5m: item.txb ? +item.txb : 0,
      buyTxs6h: item.txb ? +item.txb : 0,
      buyTxs24h: item.txb ? +item.txb : 0,
      isFavorite: false,
      ohlc: [],
      sellTxs1h: item.txs ? +item.txs : 0,
      sellTxs1m: item.txs ? +item.txs : 0,
      sellTxs5m: item.txs ? +item.txs : 0,
      sellTxs6h: item.txs ? +item.txs : 0,
      sellTxs24h: item.txs ? +item.txs : 0,
      txs1h: (item.txb ? +item.txb : 0) + (item.txs ? +item.txs : 0),
      txs1m: (item.txb ? +item.txb : 0) + (item.txs ? +item.txs : 0),
      txs5m: (item.txb ? +item.txb : 0) + (item.txs ? +item.txs : 0),
      txs6h: (item.txb ? +item.txb : 0) + (item.txs ? +item.txs : 0),
      txs24h: (item.txb ? +item.txb : 0) + (item.txs ? +item.txs : 0),
      isHotToken: false,
      internalMarketProgress: item.internalMarketProgress || '0',
      volume1h: item.vl,
      volume1m: item.vl,
      volume5m: item.vl,
      volume6h: item.vl,
      volume24h: item.vl,
      marketcap: item.marketcap,
      numberOfHolder: item.hc ? +item.hc : 0,
      devHold: calculateDevHold(item),
      sameSourceWallet: item.sameSourceTradingPercentage ? `${+item.sameSourceTradingPercentage * 100}` : '0',
      devLaunched: item.dt ? +item.dt : 0,
      insider: calculateInsiderTrading(item),
      top10Holder: item.top10HolderPercentage ? +item.top10HolderPercentage * 100 : 0,
      txBySniperPct: calculateSniperHold(item) || 0,
      isMigrated: false,
      decimals: item.decimals.toString(),
      source: 'new',
      athPrice: '0',
      atlPrice: '0',
      blacklist: false,
      bundlerHoldingPercent: item.sameSourceTradingPercentage ? `${+item.sameSourceTradingPercentage * 100}` : '0',
      burnt: false,
    } as Partial<MemeDto> as MemeDto
  },
}
