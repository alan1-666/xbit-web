import { OrderType, OrderSide, PositionModeValue, DelegateType } from './types'
import { MathFun, fixNumber } from '@/lib/utils';
import { useTranslation } from 'react-i18next'
import { APP_PATH } from '@/lib/constant'
export function getOrderTypeDescription(type: OrderType): string {
  const { t } = useTranslation()
  const typeMap: Record<DelegateType, string> = {
    'Limit': t('futuresDetails.common.limit'),
    'Market': t('futuresDetails.common.market'),
    'Take Profit Limit': t('futuresDetails.common.limitTakeProfit'),
    'Stop Limit': t('futuresDetails.common.limitStopLoss'),
    'Take Profit Market': t('futuresDetails.common.marketTakeProfit'),
    'Stop Market': t('futuresDetails.common.marketStopLoss'),

  };
  return `${typeMap[type]}`;
}

export function getOrderSideDescription(side: OrderSide, order: any): string {
  const { t } = useTranslation()
  const sideMap: Record<OrderSide, string> = {
    'B': t('futuresDetails.common.duo'),
    'A': t('futuresDetails.common.kong'),
  };

  const oppositeSideMap: Record<OrderSide, string> = {
    'B': t('futuresDetails.common.kong'),
    'A': t('futuresDetails.common.duo'),
  };

  if (order?.isTrigger) {
    return `${t('futuresDetails.common.ping')}${oppositeSideMap[side]}`;
  }

  return `${t('futuresDetails.common.open')}${sideMap[side]}`;
}

export function getPositionDescription(type: PositionModeValue, leverage: number): string {
  const { t } = useTranslation()
  const typeMap: Record<PositionModeValue, string> = {
    cross: t('futuresDetails.positionMode.cross'),
    isolated: t('futuresDetails.positionMode.isolated'),
  };


  return `${typeMap[type]} ${leverage}x`;
}

export function getEasyMatchRate () {
  return 0.92
}


export function getMaxDecimals(szDecimals: number, isSpot: boolean): number {
  const MAX_DECIMALS = isSpot ? 8 : 6;
  return Math.max(0, MAX_DECIMALS - szDecimals);
}


export function isHyperOrderSuccess(response: any): { ok: boolean; error?: string } {
  if (!response || response.status !== 'ok') {
    return { ok: false, error: response?.response || 'Unknown error' }
  }

  const statuses = response?.response?.data?.statuses || []
  
  if (!Array.isArray(statuses)) {
    return { ok: false, error: 'Invalid response structure: statuses missing' }
  }

  const firstError = statuses.find((s: any) => s.error)
  if (firstError) {
    return { ok: false, error: firstError.error }
  }

  return { ok: true }
}

export function validatePrice(
  coin: string,
  priceStr: string,
  szMap: Record<string, number>,
  { maxDecimals = 6, maxSigFigs = 5 } = {}
): boolean {
  const sz = szMap[coin];
  if (sz == null) return true


  if (!/^(0|[1-9][0-9]*)(\.[0-9]*)?$|^$/.test(priceStr)) return false;

  const [intPart, decPart = ""] = priceStr.split(".");

  if (decPart.length > maxDecimals - sz) return false;

  if (decPart === "") return true;

  let sig = (intPart + decPart).replace(/^0+/, "");
  if (sig === "") sig = decPart.replace(/^0+/, "");
  return sig.length <= maxSigFigs;
}



interface FormatPriceOptions {
  maxDecimals?: number; 
  maxSigFigs?: number;  
  trimTrailingZeros?: boolean;
  limitSigFigs?: boolean;
  isRound?: boolean // 是否四舍五入
}

export function formatPrice(
  priceInput: string | number,
  sz: number,
  options: FormatPriceOptions = {}
): string {

  const {
    maxDecimals = 6,
    maxSigFigs = 5,
    trimTrailingZeros = true,
    limitSigFigs = false,
    isRound = false
  } = options;

  let num = typeof priceInput === 'number' ? priceInput : Number(priceInput);
  if (isNaN(num) || num <= 0) return '0';

  const maxDec = maxDecimals - sz;
  let asDecimal
  if (limitSigFigs) {
    num = Number(num.toExponential(maxSigFigs - 1))
  } 
  asDecimal = isRound ? num.toFixed(maxDec) : fixNumber(num, maxDec).toString()

  

  if (!trimTrailingZeros) {
    return asDecimal;
  }

  // 去除多余的 0 和可能的末尾小数点
  return asDecimal
    .replace(/(\.\d*?[1-9])0+$/, '$1') // 删除小数中多余的 0
    .replace(/\.0+$/, '') // 删除形如 ".000" 的结尾
    .replace(/\.$/, '') // 删除仅保留的小数点
    .toString();
}

export function formatSize(
  sizeInput: string | number,
  sz: number
): string {
  const num = typeof sizeInput === 'number' ? sizeInput : Number(sizeInput)
  if (isNaN(num) || num <= 0) return '0'

  const fixed = fixNumber(num, sz).toString()

  // 去除多余的 0 和末尾小数点
  return fixed.replace(/(\.\d*?[1-9])0+$/, '$1').replace(/\.0+$/, '').toString()
}



export function getTpOrSlChild(order: any, type: 'tp' | 'sl') {
  if (!order.children.length) return false
  return order.children.filter((child: any) => {
    if (type === 'tp') {
      return /take\s*profit/i.test(child.orderType)
    }
    if (type === 'sl') {
      return /stop/i.test(child.orderType)
    }
    return false
  })
}




/**
 * 获取反方向：'buy' -> 'sell', 'sell' -> 'buy'
 */
const reverseSide = (side: 'buy' | 'sell') => (side === 'buy' ? 'sell' : 'buy')

/**
 * 计算触发价格（止盈止损），根据方向和是否为平仓单决定换算方式。
 * 返回值保留与原始价格相同的小数位数。
 */
export const getAdjustedTriggerPrice = (
  orderSide: 'buy' | 'sell' | 'B' | 'A',
  orderPrice: string | number,
  isClose: boolean,
  szDecimals: number
): string => {
  const normalizedSide = orderSide === 'buy' || orderSide === 'B' ? 'buy' : 'sell'
  const effectiveSide = isClose ? reverseSide(normalizedSide) : normalizedSide

  const price = typeof orderPrice === 'string' ? parseFloat(orderPrice) : orderPrice
  const rate = getEasyMatchRate()

  const isBuyLike = effectiveSide === 'buy'

  const raw = isBuyLike
    ? MathFun.div(price, rate)
    : MathFun.mul(price, rate)
  return formatPrice(raw, szDecimals, { limitSigFigs: true})

}

export const handlePriceChange = (
  val: string,
  onChange: (value: string) => void,
  coin: string,
  szMap: any
) => {
  const priceStr = val.trim()
  const isIntermediate = priceStr === '' || priceStr === '.' || priceStr === '0.'

  if (isIntermediate) {
    onChange(priceStr)
    return
  }

  const priceNum = parseFloat(priceStr)
  if (isNaN(priceNum)) return

  const isValid = validatePrice(coin, priceStr, szMap)
  if (!isValid) return

  onChange(priceStr)
}


export const handleSizeChange = (
  val: string,
  onChange: (value: string) => void,
  coin: string,
  szMap: any
) => {
  const isTypingIntermediate = val === '' || val === '.' || val === '0.'

  const maxDecimalPlaces = szMap[coin] ?? 0
  const decimalLimitRegex = new RegExp(`^\\d*(\\.\\d{0,${maxDecimalPlaces}})?$`)

  if (!isTypingIntermediate && !decimalLimitRegex.test(val)) {
    return // 非法格式，不触发更新
  }

  onChange(val)
}

export const convertSizeToBase = (size: number, currency: string, price: number): number => {
  if (currency === 'USDC') {
    return MathFun.div(size, price)
  }
  return size
}

type TickTier = {
  tick: number;
  nSigFigs: number | null;
  mantissa: number | null;
};

function nativeTickDynamic(price: number, sigfigs: number = 5): number {
  const digits = Math.floor(Math.log10(price)) + 1;
  return Math.pow(10, digits - sigfigs);
}

function decimalMinTick(szDecimals: number, maxDecimals: number = 6): number {
  return Math.pow(10, -(maxDecimals - szDecimals));
}


export function generateL2BookTiers(coin: string, price: number, szDecimals: number): TickTier[] {
  const uc = coin;
  let nativeTick: number;
  let nativeNSigFigs: number | null;

  if (uc === "BTC") {
    nativeTick = 1.0;
    nativeNSigFigs = null;
  } else {
    const dyn = nativeTickDynamic(price);
    const dec = decimalMinTick(szDecimals);
    nativeTick = Math.max(dyn, dec);
    nativeTick = Number(nativeTick.toFixed(10));
    nativeNSigFigs = uc === "DYDX" ? null : 5;
  }
  let isHasScientific: boolean = false
  const tiers: TickTier[] = [];

  // helper: 判断是否为科学计数法
  const isScientific = (num: number) => num.toString().includes("e");
  // 原始 tick，确保不是科学计数法
  if (!isScientific(nativeTick)) {
    tiers.push({ tick: nativeTick, nSigFigs: nativeNSigFigs, mantissa: null });
  } else {
    isHasScientific = true
  }

  // 5-sigfig aggregation
  const exp5 = Math.floor(Math.log10(price)) + 1 - 5;
  const base5 = Math.pow(10, exp5);
  [1, 2, 5].forEach(m => {
    let tick = base5 * m;
    tick = Number(tick.toFixed(10));
    if (Math.abs(tick - nativeTick) < 1e-10) return;
    if (isScientific(tick)) {
      isHasScientific = true
      return
    };
    const mantissa = m === 1 ? null : m;
    tiers.push({ tick, nSigFigs: 5, mantissa });
  });

  // Coarser aggregation
  [4, 3, 2].forEach(n => {
    const expn = Math.floor(Math.log10(price)) + 1 - n;
    let tick = Math.pow(10, expn);
    tick = Number(tick.toFixed(10));
    if (isScientific(tick)) {
        isHasScientific = true
        return;
    }
    tiers.push({
      tick,
      nSigFigs: n,
      mantissa: null,
    });
  });
  if (isHasScientific) {
    tiers.shift();
  }

  return tiers.sort((a, b) => a.tick - b.tick);
}


export function getFuturesTradePath () {
  const recentSymbol = sessionStorage.getItem('recentFuturesSymbol') || 'BTC'
  return `${APP_PATH.FUTURES}/${recentSymbol}`
}
