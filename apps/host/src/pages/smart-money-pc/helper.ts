export const formatPercent = (value: number): string => {
  const abs = Math.abs(value)

  if (abs <= 999.99) {
    return `${value.toFixed(2)}%`
  }

  if (abs < 1_000_000) {
    return `${(value / 1_000).toFixed(2)}K%`
  }

  if (abs < 1_000_000_000) {
    return `${(value / 1_000_000).toFixed(2)}M%`
  }

  return `${(value / 1_000_000_000).toFixed(2)}B%`
}