export const isEvmAddress = (addr: string) => /^0x[a-fA-F0-9]{40}$/.test(addr)

export const isSolanaAddress = (addr: string) => /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(addr)

export const toSmallestUnit = (amount: number | string, decimals: number) => {
  if (typeof amount === 'string') {
    amount = parseFloat(amount)
  }

  if (isNaN(amount)) {
    throw new Error('Invalid amount provided')
  }

  return BigInt(Math.floor(amount * 10 ** decimals))
}

export const rsvToSignature = ({ r, s, v }: { r: string; s: string; v: number }) => {
  const vNormalized = v === 27 || v === 28 ? v - 27 : v // ✅ 0 or 1

  return '0x' + r.replace(/^0x/, '') + s.replace(/^0x/, '') + vNormalized.toString(16).padStart(2, '0')
}
