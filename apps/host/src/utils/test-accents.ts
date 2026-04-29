const removeAccents = (str: string) => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
}

// 1. Text Search (Vietnamese)
const vietnameseText = 'Tô Lâm'
const search = 'to lam'

const normalizedText = removeAccents(vietnameseText)
console.log(`Original: "${vietnameseText}" (len: ${vietnameseText.length})`)
console.log(`Normalized: "${normalizedText}" (len: ${normalizedText.length})`)
console.log(`Match "to lam"? ${normalizedText.toLowerCase().includes(search)}`)
console.log(`Length Preserved? ${vietnameseText.length === normalizedText.length}`)

if (vietnameseText.length !== normalizedText.length) {
  console.warn('WARNING: Length check failed for Vietnamese text!')
}

// 2. Meme Address (Base58/Solana) -> strictly ASCII
// Base58 alphabet: 123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz
const address = 'Gu7Ew8qZ3q' // Random sample
const normalizedAddr = removeAccents(address)

console.log(`\nAddress: "${address}"`)
console.log(`Normalized: "${normalizedAddr}"`)
console.log(`Untouched? ${address === normalizedAddr}`)

if (address !== normalizedAddr) {
  console.error('CRITICAL: Address was modified by removeAccents!')
}

// 3. Edge Case: Check for accidental chars
const allAscii = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
if (removeAccents(allAscii) !== allAscii) {
  console.error('CRITICAL: ASCII modified!')
} else {
  console.log('ASCII safe.')
}
