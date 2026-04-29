import { HTMLAttributeReferrerPolicy, useEffect, useMemo, useRef, useState } from 'react'
import { generateAvatar } from '@/utils/xbitAvatar/XbitAvatarGenerator'

function safeWalletKey(addr?: string) {
  return (addr || '').toLowerCase()
}

type WalletAvatarProps = {
  source?: string
  address?: string
  size?: number
  rounded?: boolean
  className?: string
  referrerPolicy?: HTMLAttributeReferrerPolicy
  persistCache?: boolean
  blankUntilReady?: boolean
  onError?: (error: unknown) => void
}

const memCache = new Map<string, string>()

function cacheKey(wallet: string, rounded: boolean) {
  return `wallet-avatar:${wallet}:${rounded ? 1 : 0}`
}

function readSession(key: string): string | null {
  try {
    return sessionStorage.getItem(key)
  } catch {
    return null
  }
}

function writeSession(key: string, value: string) {
  try {
    sessionStorage.setItem(key, value)
  } catch (error) {
    console.error(error)
  }
}

export function WalletAvatar({
  source,
  address,
  size = 36,
  rounded = true,
  className = '',
  referrerPolicy = 'no-referrer',
  persistCache = false,
  blankUntilReady = false,
  onError,
}: WalletAvatarProps) {
  const wallet = useMemo(() => safeWalletKey(address), [address])
  const key = useMemo(() => (wallet ? cacheKey(wallet, rounded) : ''), [wallet, rounded])

  const [generatedSrc, setGeneratedSrc] = useState<string>('')

  const lastGoodRef = useRef<string>('')
  const seqRef = useRef(0)
  const triedFallbackRef = useRef(false)

  // Initialize from caches without causing a re-render loop
  useEffect(() => {
    if (!key) {
      triedFallbackRef.current = false
      if (blankUntilReady) {
        setGeneratedSrc('')
        lastGoodRef.current = ''
      }
      return
    }

    const mem = memCache.get(key)
    if (mem) {
      setGeneratedSrc(mem)
      lastGoodRef.current = mem
      return
    }

    if (persistCache) {
      const sess = readSession(key)
      if (sess) {
        memCache.set(key, sess)
        setGeneratedSrc(sess)
        lastGoodRef.current = sess
      }
    }
  }, [key, persistCache, blankUntilReady])

  useEffect(() => {
    if (!wallet) return

    let cancelled = false
    const seq = ++seqRef.current

    const run = async () => {
      try {
        const s = await generateAvatar(wallet, rounded)

        if (cancelled || seq !== seqRef.current) return
        if (s) {
          memCache.set(key, s)
          if (persistCache) writeSession(key, s)
          if (s !== generatedSrc) {
            setGeneratedSrc(s)
          }
          lastGoodRef.current = s
        }
      } catch (err) {
        if (cancelled || seq !== seqRef.current) return
        onError?.(err)

        if (blankUntilReady && !lastGoodRef.current) {
          setGeneratedSrc('')
        }
      }
    }

    run().catch((err) => onError?.(err))

    return () => {
      cancelled = true
    }
  }, [wallet, rounded, key, persistCache, blankUntilReady, onError])

  const primarySrc = source || generatedSrc || (blankUntilReady ? '' : lastGoodRef.current)

  return (
    <img
      data-avatar-type="wallet"
      src={primarySrc}
      alt="Wallet"
      width={size}
      height={size}
      className={className}
      decoding="async"
      referrerPolicy={referrerPolicy}
      onError={(e) => {
        if (!triedFallbackRef.current) {
          triedFallbackRef.current = true
          const fallback = generatedSrc || lastGoodRef.current
          if (fallback && e.currentTarget.src !== fallback) {
            e.currentTarget.src = fallback
            return
          }
        }

        e.currentTarget.onerror = null
      }}
      onLoad={() => {
        triedFallbackRef.current = false
      }}
    />
  )
}
