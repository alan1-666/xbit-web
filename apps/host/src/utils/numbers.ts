import { isInteger } from "lodash-es"
import { formatNumberShort } from "@/components/common/MoneyFormatted"


export function formatNumber(num: number | string, decimal = 2) {
  if (num === undefined || num === null) return '--'
  if (typeof num === 'string') {
    num = parseFloat(num)
  }
  if (isNaN(num)) return '--'
  if (num === 0) return '0'
  const absNum = Math.abs(num)
  if (absNum < 1e3) {
    return num.toFixed(decimal)
  } else if (absNum < 1e6) {
    return `${(num / 1e3).toFixed(decimal)}K`
  } else if (absNum < 1e9) {
    return `${(num / 1e6).toFixed(decimal)}M`
  } else if (absNum < 1e12) {
    return `${(num / 1e9).toFixed(decimal)}B`
  } else {
    return `${(num / 1e12).toFixed(decimal)}T`
  }
}

type TFormatPercentConfig = {
  defaultValue?: string;
  roundType?: 'round' | 'floor' | 'ceil'
  isShowUnit?: boolean;
  unit?: string;
  showPositive?: boolean;
  isOver100000?: boolean;
}


export function formatPercent(num: number | string | undefined, decimal = 10, config: TFormatPercentConfig = {
  isShowUnit: true,
  unit: '%',
  defaultValue: '--',
  showPositive: false,
  roundType: 'round',
  isOver100000: true
}) {
  const { isShowUnit = true, unit = '%', defaultValue = '--', showPositive = false, roundType = 'round', isOver100000 = true } = config;
  const _unit = isShowUnit ? unit : '';
  const _defaultResult = `${defaultValue}`
  if (num === undefined || num === null || num == 'Infinity' || num == '-Infinity') return _defaultResult
  if (typeof num === 'string') {
    num = parseFloat(num)
  }
  if (isNaN(num)) return `${_defaultResult}`
  const _num = Math.abs(num);
  if (_num >= 100000) {
    return `${formatPositiveNegative(num, {
      showPositive,
      isOver100000
    })}99999${_unit}`;
  }
  const numStr = num.toFixed(isInteger(num) ? 0 : decimal)
  const _result = formatNumberShort(Math.abs(Number(numStr)), {
    defaultValue,
    roundType,
    isShowUnit: false,
    unit,
    isUnitSpace: false,
    decimal: 2
  })
  return _result == defaultValue ? `${_defaultResult}` : `${formatPositiveNegative(num, {
    showPositive,
    isOver100000
  })}${_result}${_unit}`;
}



export function formatPositiveNegative(n: number | string, config?: {
  isOver100000?: boolean;
  defaultValue?: string;
  showPositive?: boolean;
}) {
  const { isOver100000 = true, defaultValue = '', showPositive = false } = config || {};
  const num = Number(n);
  const isNegative = num < 0;
  if (isNaN(num)) return defaultValue;
  if (isOver100000) {
    if (Math.abs(num) > 100000) {
      if (isNegative) return '-<';
      else if (showPositive) return '+>';
      else return '>';
    }
  }
  if (num === 0 || num == Infinity || num == -Infinity) return '';
  if (num < 0) return '-';
  if (num > 0 && showPositive) return '+';
  return '';
}

export function checkIsNumber(value: number | string): boolean {
  if (typeof value === 'number') {
    return !isNaN(value) && isFinite(value);
  }
  const parsedValue = parseFloat(value);
  return !isNaN(parsedValue) && isFinite(parsedValue);
}

export function formatPoolQuantity(num: number | string): string {
  if (num === undefined || num === null) return '--'
  if (typeof num === 'string') {
    num = parseFloat(num)
  }
  if (isNaN(num)) return '--'
  if (num === 0) return '0'
  const absNum = Math.abs(num)
  if (absNum < 1) {
    const str = absNum.toString()
    const [, decPart = ''] = str.split('.')
    let result = '0.'
    let nonZeroCount = 0
    for (let i = 0; i < decPart.length; i++) {
      const digit = decPart[i]
      result += digit
      if (digit !== '0') nonZeroCount++
      if (nonZeroCount >= 4) break
    }
    return (num < 0 ? '-' : '') + result.replace(/(\d*?[1-9])0+$/, '$1').replace(/\.$/, '')
  } else {
    return num.toFixed(4).replace(/\.0+$/, '')
  }
}

export const fmt = {
  compact(n: number | null | undefined) {
    if (n == null) return '--';
    return new Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 2 }).format(n);
  },
  pct(n: number | null | undefined) {
    if (n == null) return '--';
    return `${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}%`;
  },
  money(n: number | null | undefined, addSign = true, maximumFractionDigits = 2) {
    if (n == null) return '--';
    const sign = n >= 0 ? '+' : '';
    return `${addSign ? sign : ''}${n.toLocaleString(undefined, { maximumFractionDigits })}`;
  },
  fmtMoney(n: number | null | undefined, maximumFractionDigits = 2) {
    if (n == null) return 0;
    return n.toLocaleString(undefined, { maximumFractionDigits });
  },
  fmtPct(v?: number, maximumFractionDigits = 2) {
    if (v == null) return '--'
    const sign = v > 0 ? '+' : ''
    return `${sign}${v.toLocaleString(undefined, { maximumFractionDigits })}%`
  },
  fmtUsd(v?: number) {
    if (v == null) return '--'
    const maximumFractionDigits = v >= 1 ? 2 : 6
    return v.toLocaleString(undefined, {
      minimumFractionDigits: maximumFractionDigits,
      maximumFractionDigits,
    })
  }
};

export function toNum(v: any) {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

export function formatSizeCompact(v: any) {
  const n = toNum(v)
  const abs = Math.abs(n)

  if (abs >= 1e9) {
    return `${(n / 1e9).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}B`
  }

  if (abs >= 1e6) {
    return `${(n / 1e6).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}M`
  }

  if (abs >= 1e3) {
    return `${(n / 1e3).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}K`
  }

  return abs >= 10
    ? n.toLocaleString(undefined, { maximumFractionDigits: 2 })
    : n.toLocaleString(undefined, { maximumFractionDigits: 4 })
}


// $623K / $1.2M
export function formatUsdCompact(v: any) {
  const n = toNum(v || 0)
  const abs = Math.abs(n)
  if (abs >= 1e9) return `$${(n / 1e9).toFixed(2)}B`
  if (abs >= 1e6) return `$${(n / 1e6).toFixed(2)}M`
  if (abs >= 1e3) return `$${(n / 1e3).toFixed(2)}K`
  return `$${fmt.fmtMoney(n)}`
}

export function formatUsdCompactAdd(v: any) {
  const n = toNum(v)
  if (!Number.isFinite(n)) return '--'

  const sign = n < 0 ? '-' : ''
  const abs = Math.abs(n)

  if (abs >= 1e9) return `${sign}$${(abs / 1e9).toFixed(2)}B`
  if (abs >= 1e6) return `${sign}$${(abs / 1e6).toFixed(2)}M`
  if (abs >= 1e3) return `${sign}$${(abs / 1e3).toFixed(2)}K`
  return `${sign}$${abs.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
}


export function fmtPctWithComma(v?: number, maximumFractionDigits = 2) {
  if (!Number.isFinite(v)) return '--'
  const sign = v > 0 ? '+' : ''
  return `${sign}${v.toLocaleString(undefined, {
    maximumFractionDigits,
  })}%`
}

export function invertNumber(v: number | string | null | undefined) {
  const n = Number(v)
  if (!Number.isFinite(n)) return 0
  return -n
}


