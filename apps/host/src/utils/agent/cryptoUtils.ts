
async function deriveKeyFromAddress(address: string): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(address),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  )
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode('hyper-agent-wallet'),
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

export async function encryptPrivateKey(privateKey: string, address: string): Promise<{ cipher: ArrayBuffer, iv: Uint8Array }> {
  const key = await deriveKeyFromAddress(address)
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encoder = new TextEncoder()
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(privateKey)
  )
  return { cipher: encrypted, iv }
}

export async function decryptPrivateKey(cipher: ArrayBuffer, iv: Uint8Array, address: string): Promise<string> {
  const key = await deriveKeyFromAddress(address)
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    cipher
  )
  return new TextDecoder().decode(decrypted)
}
