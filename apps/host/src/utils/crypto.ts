export async function deriveEncryptionKeyFromWallet(walletAddress: string): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  const data = encoder.encode(walletAddress.toLowerCase())
  const hash = await crypto.subtle.digest('SHA-256', data)
  return crypto.subtle.importKey(
    'raw',
    hash,
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt']
  )
}

//加密私钥
export async function encryptPrivateKey(privateKeyHex: string, key: CryptoKey): Promise<Uint8Array> {
  const iv = crypto.getRandomValues(new Uint8Array(12)) // 12 字节的 IV 是 AES-GCM 推荐长度
  const encoder = new TextEncoder()
  const data = encoder.encode(privateKeyHex)

  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data)
  const result = new Uint8Array(iv.byteLength + encrypted.byteLength)
  result.set(iv, 0)
  result.set(new Uint8Array(encrypted), iv.byteLength)
  return result
}

// 解密私钥
export async function decryptPrivateKey(encryptedData: Uint8Array, key: CryptoKey): Promise<string> {
  const iv = encryptedData.slice(0, 12)
  const ciphertext = encryptedData.slice(12)

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext
  )

  const decoder = new TextDecoder()
  return decoder.decode(decrypted) // 返回 hex string
}
