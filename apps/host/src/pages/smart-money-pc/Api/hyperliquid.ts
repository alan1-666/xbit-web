import { toast } from 'sonner'

export type ApiResult<T> = { ok: true; data: T } | { ok: false; status: number; message: string }

export async function fetchHyperliquidDataResult<T = any>(
  userAddress: string,
  type: string,
  extra?: Record<string, any>,
): Promise<ApiResult<T>> {
  try {
    const response = await fetch('https://api-ui.hyperliquid.xyz/info', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, user: userAddress, ...(extra ?? {}) }),
    })

    if (!response.ok) {
      const message = `Request failed: ${response.status} ${response.statusText || ''}`
      return { ok: false, status: response.status, message }
    }

    const data = (await response.json()) as T
    return { ok: true, data }
  } catch (e: any) {
    return { ok: false, status: -1, message: e?.message ?? 'Network issues or other errors' }
  }
}

/** 处理 失败 toast + 返回 null */
export async function fetchHyperliquidData<T = any>(
  userAddress: string,
  type: string,
  extra?: Record<string, any>,
  opts?: { toastOnError?: boolean },
): Promise<T | null> {
  const res = await fetchHyperliquidDataResult<T>(userAddress, type, extra)

  if (!res.ok) {
    if (opts?.toastOnError ?? true) toast.error(res.message)
    return null
  }

  return res.data
}
