import { KlineStickerDto, KlineStickerTxType, KlineStickerUserType } from '@/@generated/gql/graphql-meme2'
import { formatAmount, formatPrice, formatVolume } from '@/lib/format'
import { BLOCKCHAIN_SHORTNAME, timeFromNow } from '@/utils/helpers'
import { Mark as TvMark } from '../../public/charting_library/datafeed-api'
import { getAvatarFromAddress } from './list-coin-helper'
import i18n from '@/i18n'

/**
 * If input is raw SVG (<svg ...>), convert to data:image/svg+xml;base64,...
 * If input is already a data URL, return as-is.
 * If input is a plain URL (http(s) / /path), return as-is.
 */
function normalizeToImageUrl(src: string): string {
  if (!src) return ''

  // already a data URL
  if (src.startsWith('data:image/')) return src

  // plain URL/path
  if (
    src.startsWith('http://') ||
    src.startsWith('https://') ||
    src.startsWith('/') ||
    src.startsWith('./') ||
    src.startsWith('../')
  ) {
    return src
  }

  // raw SVG markup
  const trimmed = src.trim()
  if (trimmed.startsWith('<svg') || trimmed.startsWith('<?xml')) {
    // btoa expects latin1; for unicode-safe base64:
    const utf8 = encodeURIComponent(trimmed).replace(/%([0-9A-F]{2})/g, (_, p1) =>
      String.fromCharCode(parseInt(p1, 16)),
    )
    return `data:image/svg+xml;base64,${btoa(utf8)}`
  }

  // If it looks like base64 content without prefix, you can choose to prefix it.
  // But only do that if you KNOW it is base64 png/svg. Here we leave as-is.
  return src
}

/**
 * Small in-module cache to avoid generating the same avatar multiple times
 * when many marks share the same wallet address.
 */
const avatarUrlCache = new Map<string, Promise<string>>()

function getAvatarImageUrlCached(address: string, isRounded: boolean): Promise<string> {
  const key = `${address.toLowerCase()}|${isRounded ? 1 : 0}`
  const hit = avatarUrlCache.get(key)
  if (hit) return hit

  const task = getAvatarFromAddress(address, isRounded)
    .then((raw) => normalizeToImageUrl(raw))
    .catch(() => '') // fail-safe: no image
  avatarUrlCache.set(key, task)
  return task
}

export async function stickersToTvMarks(
  stickers: KlineStickerDto[],
  activeChainId?: string | number | null,
): Promise<TvMark[]> {
  const t = (key: string) => {
    if (!i18n.isInitialized) return key
    return i18n.t(key)
  }

  if (!stickers?.length) return []

  const toSafeNumber = (value: unknown) => {
    const numericValue = Number(value ?? 0)
    return Number.isFinite(numericValue) ? numericValue : 0
  }

  const shortenAddress = (value: string | null | undefined) => {
    if (!value) return ''
    if (value.length <= 10) return value
    return `${value.slice(0, 5)}...${value.slice(-5)}`
  }

  const marks: TvMark[] = []
  const pendingAvatarJobs: Promise<void>[] = []

  stickers.forEach((sticker) => {
    const timestamp = Number(sticker.ts)
    if (!timestamp) return

    const filteredStickers = sticker.data

    filteredStickers.forEach((walletStat, index) => {
      const side = walletStat.type
      const isBuy = side === KlineStickerTxType.Buy

      const usdAmount = toSafeNumber(walletStat.usdAmount)
      const tokenAmount = toSafeNumber(walletStat.tokenAmount)
      const price = tokenAmount > 0 ? usdAmount / tokenAmount : 0

      const markId = timestamp * 100 + (index % 100)
      const isDevSticker = walletStat.userType === KlineStickerUserType.Dev

      function getLabel(userType: KlineStickerUserType, s: KlineStickerTxType) {
        if (userType === KlineStickerUserType.Dev) return s === KlineStickerTxType.Buy ? 'DB' : 'DS'
        return s === KlineStickerTxType.Buy ? 'B' : 'S'
      }

      const label = getLabel(walletStat.userType, walletStat.type)
      const color = isBuy ? { border: '#21E09D', background: '#21E09D' } : { border: '#EA3B4F', background: '#EA3B4F' }

      const walletLabel = shortenAddress(walletStat.walletAddress)
      const nativeUnit = activeChainId != null ? ((BLOCKCHAIN_SHORTNAME as any)[Number(activeChainId)] ?? '') : ''
      const txsCount = Number(walletStat.txs ?? 0)

      const tooltipText = [
        walletLabel || '',
        `${timeFromNow(timestamp)} ${t('tvMarks.within')}`,
        txsCount > 0
          ? `${isBuy ? t('tvMarks.buyTxs') : t('tvMarks.sellTxs')}: ${txsCount.toLocaleString('en-US')}`
          : '',
        `${isBuy ? t('tvMarks.buyTotal') : t('tvMarks.sellTotal')}: ${formatVolume(usdAmount, {
          showCurrency: true,
        })} (${formatAmount(walletStat.nativeAmount, { unit: nativeUnit })})`,
        `${isBuy ? t('tvMarks.buyAmount') : t('tvMarks.sellAmount')}: ${formatAmount(walletStat.tokenAmount)}`,
        `${t('tvMarks.avgPrice')}: ${formatPrice(price, { showCurrency: true })}`,
      ]
        .filter(Boolean)
        .join('\n')

      // create mark first (imageUrl filled later for non-dev)
      const mark: TvMark = {
        id: markId,
        time: timestamp,
        color,
        text: tooltipText,
        label,
        labelFontColor: '#FFFFFF',
        minSize: 24,
        imageUrl: undefined,
      }

      marks.push(mark)

      // async avatar fill
      if (!isDevSticker && walletStat.walletAddress) {
        const job = getAvatarImageUrlCached(walletStat.walletAddress, false).then((url) => {
          // TradingView expects a URL string; if empty, keep undefined
          if (url) mark.imageUrl = url
        })
        pendingAvatarJobs.push(job)
      }
    })
  })

  // Wait all avatar jobs before returning marks
  if (pendingAvatarJobs.length) {
    await Promise.all(pendingAvatarJobs)
  }

  marks.sort((a, b) => a.time - b.time)
  return marks
}

export type { TvMark }
