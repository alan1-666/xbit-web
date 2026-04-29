export const formatPriceByTickSize = (price: number, tickSize: number): string => {
  const roundedPrice = Math.round(price / tickSize) * tickSize
  const priceInCents = roundedPrice * 100
  return priceInCents.toLocaleString('en-US')
}
