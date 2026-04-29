/** Check if string contains a wallet address (EVM 0x+40 hex or Solana base58) */
export const containsWalletAddress = (str?: string): boolean => {
  if (!str || typeof str !== 'string') return false
  if (/0x[a-fA-F0-9]{40}/.test(str)) return true // EVM
  if (/[1-9A-HJ-NP-Za-km-z]{32,44}/.test(str)) return true // Solana base58
  return false
}

export const formatAddressWallet = (address?: string, startLength = 5, endLength = 5) => {
  if (!address) return ''
  const formatOrderIdRegex = new RegExp(`^(.{${startLength}}).*(.{${endLength}})$`)
  return address.replace(formatOrderIdRegex, '$1...$2')
}

export const formatEmail = (email?: string, maxLength = 5) => {
  if (!email) return ''
  const [name, domain] = email.split('@')
  if (name.length <= maxLength) {
    return email
  }
  const formatEmailRegex = new RegExp(`^(.{${maxLength}}).*$`)
  const formattedName = name.replace(formatEmailRegex, '$1...')
  return `${formattedName}@${domain}`
}