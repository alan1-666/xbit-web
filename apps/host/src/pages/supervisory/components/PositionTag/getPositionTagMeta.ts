import { ReactComponent as LongPositionIcon } from '@/components/icon/supervisory/long_position.svg'
import { ReactComponent as ShortPositionIcon } from '@/components/icon/supervisory/short_position.svg'

export type TradeAction =
  | 'LONG_OPEN'
  | 'LONG_INCREASE'
  | 'LONG_REDUCE'
  | 'LONG_CLOSE'
  | 'SHORT_OPEN'
  | 'SHORT_INCREASE'
  | 'SHORT_REDUCE'
  | 'SHORT_CLOSE'
  | 'LONG_TO_SHORT'
  | 'SHORT_TO_LONG'

type ArrowDir = 'up' | 'down' | null

function toNum(v: any) {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

function normalizeDir(dir: any) {
  return String(dir ?? '').trim().replace(/\s+/g, ' ')
}

function eqZero(n: number, eps = 1e-9) {
  return Math.abs(n) <= eps
}

function eqAbs(a: number, b: number, eps = 1e-9) {
  return Math.abs(Math.abs(a) - Math.abs(b)) <= eps
}


export function getTradeMeta(dir: any, startPosition: any, szi: any): { action: TradeAction | null; arrow: ArrowDir } {
  const d = normalizeDir(dir)
  const sp = toNum(startPosition)
  const sz = toNum(szi)

  if (!d) return { action: null, arrow: null }

  // 1) Open Short
  if (d === 'Open Short') {
    return {
      action: eqZero(sp) ? 'SHORT_OPEN' : 'SHORT_INCREASE',
      arrow: 'down',
    }
  }

  // 2) Open Long
  if (d === 'Open Long') {
    return {
      action: eqZero(sp) ? 'LONG_OPEN' : 'LONG_INCREASE',
      arrow: 'up',
    }
  }

  // 3) Close Short
  if (d === 'Close Short') {
    const isCloseAll = eqAbs(sp, sz)
    return {
      action: isCloseAll ? 'SHORT_CLOSE' : 'SHORT_REDUCE',
      arrow: 'up',
    }
  }

  // 4) Close Long
  if (d === 'Close Long') {
    const isCloseAll = eqAbs(sp, sz)
    return {
      action: isCloseAll ? 'LONG_CLOSE' : 'LONG_REDUCE',
      arrow: 'down',
    }
  }

  // 5) 兜底转换
  if (d === 'Long > Short') {
    return { action: 'LONG_TO_SHORT', arrow: 'down' }
  }

  if (d === 'Short > Long') {
    return { action: 'SHORT_TO_LONG', arrow: 'up' }
  }

  return { action: null, arrow: null }
}

function getIconByArrow(arrow: ArrowDir) {
  if (arrow === 'up') return LongPositionIcon
  if (arrow === 'down') return ShortPositionIcon
  return null
}

export function getPositionTagMeta(params: {
  dir: any
  startPosition: any
  szi: any
  t: (key: string) => string
}) {
  const { dir, startPosition, szi, t } = params

  const { action, arrow } = getTradeMeta(dir, startPosition, szi)
  const Icon = getIconByArrow(arrow)

  return {
    action,
    arrow,
    tagText: action ? t(`smartMoney.supervisory.tradeAction.${action}`) : '--',
    Icon,
    className: 'text-[#FFF]',
  }
}
