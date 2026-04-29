import { ColorWheel, HexColor } from '@/utils/xbitAvatar/ColorWheel'
import { hsl2hex, incLight } from '@/utils/xbitAvatar/ColorUtil'

import gradientMask from '/images/wallets/avatars/gradient_avatar.png?inline'

// ----------------------
// Assets (public paths)
// ----------------------
export const AVATAR_MAP: Record<string, string> = {
  avatar_01: '/images/wallets/avatars/avatar_01.png',
  avatar_02: '/images/wallets/avatars/avatar_02.png',
  avatar_03: '/images/wallets/avatars/avatar_03.png',
  avatar_04: '/images/wallets/avatars/avatar_04.png',
  avatar_05: '/images/wallets/avatars/avatar_05.png',
  avatar_06: '/images/wallets/avatars/avatar_06.png',
  avatar_07: '/images/wallets/avatars/avatar_07.png',
  avatar_08: '/images/wallets/avatars/avatar_08.png',
  avatar_09: '/images/wallets/avatars/avatar_09.png',
  avatar_10: '/images/wallets/avatars/avatar_10.png',
  avatar_11: '/images/wallets/avatars/avatar_11.png',
  avatar_12: '/images/wallets/avatars/avatar_12.png',
  avatar_13: '/images/wallets/avatars/avatar_13.png',
  avatar_14: '/images/wallets/avatars/avatar_14.png',
  avatar_15: '/images/wallets/avatars/avatar_15.png',
  avatar_16: '/images/wallets/avatars/avatar_16.png',
  avatar_17: '/images/wallets/avatars/avatar_17.png',
  avatar_18: '/images/wallets/avatars/avatar_18.png',
  avatar_19: '/images/wallets/avatars/avatar_19.png',
}

export const GRADIENT_AVATAR = gradientMask

export const GRADIENT_MAP: Record<string, HexColor> = {
  avatar_B1: '#747474',
  avatar_B2: '#6D00FF',
  avatar_B3: '#A38B00',
  avatar_B4: '#009391',
  avatar_B5: '#00358F',
  avatar_B6: '#438200',
  avatar_B7: '#963900',
  avatar_B8: '#964D00',
  avatar_B9: '#74008E',
  avatar_B10: '#23008B',
} as const

export const BACKGROUND_MAP: Record<string, HexColor> = {
  avatar_A: '#FFFFFF',
  avatar_B: '#FFBA92',
  avatar_C: '#FFD17D',
  avatar_D: '#A2F7FF',
  avatar_E: '#5C98FF',
  avatar_F: '#B8FF6D',
  avatar_G: '#FFA56D',
  avatar_H: '#FFAAAA',
  avatar_I: '#EEA1FF',
  avatar_K: '#9C9FFF',
} as const

export const AVATAR_COUNT = 19 as const
export const GRADIENT_COUNT = 10 as const
export const BACKGROUND_KEYS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'K'] as const

// -------------------------
// Dart hash port (bit-exact)
// -------------------------
export function hashDart(input: string): number {
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    hash = (hash + input.charCodeAt(i)) & 0x1fffffff
    hash = (hash + ((hash & 0x0007ffff) << 10)) & 0x1fffffff
    hash ^= hash >>> 6
  }
  hash = (hash + ((hash & 0x03ffffff) << 3)) & 0x1fffffff
  hash ^= hash >>> 11
  hash = (hash + ((hash & 0x00003fff) << 15)) & 0x1fffffff
  return hash >>> 0
}

// ---------------------
// V2/V3 key + resolver
// ---------------------
export function genAvatarKeyV2(walletAddress: string): string {
  const hash = hashDart(walletAddress)
  const avatarIndex = (hash % AVATAR_COUNT) + 1
  const gradientIndex = ((hash >>> 8) % GRADIENT_COUNT) + 1
  const backgroundIndex = (hash >>> 16) % BACKGROUND_KEYS.length

  const avatarKey = `avatar_${String(avatarIndex).padStart(2, '0')}`
  const gradientKey = `avatar_B${gradientIndex}`
  const backgroundKey = `avatar_${BACKGROUND_KEYS[backgroundIndex]}`
  return `${avatarKey}/${gradientKey}/${backgroundKey}`
}

export function getAvatarByKeyV2(key: string): { avatar?: string; gradient?: HexColor; background?: HexColor } {
  const parts = key.split('/')
  if (parts.length !== 3) return {}
  const avatar = AVATAR_MAP[parts[0]]
  const gradient = GRADIENT_MAP[parts[1]]
  const background = BACKGROUND_MAP[parts[2]]
  return { avatar, gradient, background }
}

// ------------------------------------
// SVG data URL helpers (sync)
// ------------------------------------
// For SVG data URL, you want URL-encoding, not base64.
// Many browsers accept `data:image/svg+xml;utf8,${encodeURIComponent(svg)}` more reliably.
function svgToDataUrl(svg: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

function buildV2Svg(opts: {
  size: number
  isRounded: boolean
  uniqueId: string
  avatarSrc: string
  maskSrc: string
  gradient: HexColor
  background: HexColor
}): string {
  const { size, uniqueId, avatarSrc, maskSrc, gradient, background } = opts

  return `<svg
  width="${size}"
  height="${size}"
  viewBox="0 0 32 32"
  xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink"
>
  <defs>
    <filter id="tint_${uniqueId}" color-interpolation-filters="sRGB">
      <feFlood flood-color="${gradient}" result="flood"/>
      <feComposite in="flood" in2="SourceAlpha" operator="in" result="tinted"/>
      <feComposite in="tinted" in2="SourceGraphic" operator="over"/>
    </filter>
  </defs>
    <rect x="0" y="0" width="32" height="32" fill="${background}"/>
    <g>
      <image
        href="${maskSrc}"
        xlink:href="${maskSrc}"
        x="0" y="0" width="32" height="32"
        preserveAspectRatio="xMidYMid slice"
        filter="url(#tint_${uniqueId})"
      />
      <image
        href="${avatarSrc}"
        xlink:href="${avatarSrc}"
        x="0" y="0" width="32" height="32"
        preserveAspectRatio="xMidYMid slice"
      />
    </g>
</svg>`
}

// -------------------------
// Canvas helpers (V3)
// -------------------------
type LoadImageOptions = {
  crossOrigin?: '' | 'anonymous' | 'use-credentials'
}

function loadImage(src: string, opts: LoadImageOptions = {}): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    if (opts.crossOrigin != null) img.crossOrigin = opts.crossOrigin
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`))
    img.src = src
  })
}

function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.max(0, Math.min(r, w / 2, h / 2))
  ctx.beginPath()
  ctx.moveTo(x + rr, y)
  ctx.arcTo(x + w, y, x + w, y + h, rr)
  ctx.arcTo(x + w, y + h, x, y + h, rr)
  ctx.arcTo(x, y + h, x, y, rr)
  ctx.arcTo(x, y, x + w, y, rr)
  ctx.closePath()
}

type DataUrlMode = 'dataUrl' | 'base64' // return full data url or only base64 content

function stripPngDataUrlPrefix(pngDataUrl: string): string {
  const prefix = 'data:image/png;base64,'
  return pngDataUrl.startsWith(prefix) ? pngDataUrl.slice(prefix.length) : pngDataUrl
}

// -------------------------
// V3 cache (PNG)
// -------------------------
type V3CacheEntry = {
  pngDataUrl?: string
  inflight?: Promise<string>
}

const V3_CACHE = new Map<string, V3CacheEntry>()

function v3CacheKey(opts: { wallet: string; size: number; rounded: boolean; v2key: string }): string {
  return `${opts.wallet}|${opts.size}|${opts.rounded ? 1 : 0}|${opts.v2key}`
}

// ===========================
// AvatarFactory (V1 + V2 + V3)
// ===========================
export class AvatarFactory {
  // config
  decoColorWheel: ColorWheel
  logoColorWheel: ColorWheel
  bgColorWheel: ColorWheel

  // pre-calc & cache
  LOGO_COLOR_PALLET_HEX: HexColor[]
  BG_COLOR_PALETTE_HEX: HexColor[]
  BG_COLOR_PALETTE_HEX_LIGHTER: HexColor[]

  constructor({ decoColorWheel, logoColorWheel, bgColorWheel }: AvatarFactoryOptions) {
    this.decoColorWheel = decoColorWheel
    this.logoColorWheel = logoColorWheel
    this.bgColorWheel = bgColorWheel

    this.LOGO_COLOR_PALLET_HEX = logoColorWheel.getHexColors()
    this.BG_COLOR_PALETTE_HEX = bgColorWheel.getHexColors()
    this.BG_COLOR_PALETTE_HEX_LIGHTER = bgColorWheel.getColors().map((i) => {
      const [h, s, l] = incLight(1.4, i.data.h, i.data.s, i.data.l)
      return hsl2hex(h, s, l)
    })
  }

  // -----------------------
  // V1 (your original SVG)
  // -----------------------
  generateAvatarConfig(walletAddress: string): AvatarConfig {
    const {
      decoColorWheel,
      logoColorWheel,
      bgColorWheel,
      LOGO_COLOR_PALLET_HEX,
      BG_COLOR_PALETTE_HEX,
      BG_COLOR_PALETTE_HEX_LIGHTER,
    } = this

    const hash = AvatarFactory.hashCode(walletAddress)

    const bytes: number[] = []
    for (let i = 0; i < 10; i++) bytes.push((hash >> (i * 3)) & 0xff)

    const bgTypeIndex = bytes[0] % BACKGROUND_TYPES.length
    const bgColorIndex1 = bytes[1] % BG_COLOR_PALETTE_HEX.length

    const bgColor1 = BG_COLOR_PALETTE_HEX[bgColorIndex1]
    const bgColor2 = BG_COLOR_PALETTE_HEX_LIGHTER[bgColorIndex1]

    const logoColorIndex = logoColorWheel.getContrastColorOf(bgColorIndex1, bgColorWheel, bytes[3])?.data.i ?? 0
    const logoColor = LOGO_COLOR_PALLET_HEX[logoColorIndex]

    const decoColorEl = decoColorWheel.getContrastColorOf(bgColorIndex1, bgColorWheel, bytes[5])
    const decoColor = decoColorEl?.hex ?? '#000000'

    const eyeIndex = bytes[5] % EYE_SHAPES.length
    const mouthIndex = bytes[6] % MOUTH_SHAPES.length

    return {
      bgTypeIndex,
      bgColor1,
      bgColor2,
      logoColor,
      eyeIndex,
      eyeColor: decoColor,
      mouthIndex,
      mouthColor: decoColor,
      data: { decoColorIdx: decoColorEl.data.i },
    }
  }

  generateAvatar(walletAddress: string, size: number = 128, isRounded: boolean = false): [string, AvatarConfig] {
    const wlc = walletAddress.toLowerCase()
    const config = this.generateAvatarConfig(wlc)
    const uniqueId = 'grad_' + AvatarFactory.hashCode(wlc)

    const transformAttr = isRounded ? 'transform="translate(3.2, 3.2) scale(0.8)"' : ''
    const rectRadius = isRounded ? 'rx="16"' : 'rx="0"'

    const svgContent = `
      <svg width="${size}" height="${size}" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <defs>
          ${BACKGROUND_TYPES[config.bgTypeIndex](uniqueId, config.bgColor1, config.bgColor2)}
        </defs>
        <rect width="32" height="32" ${rectRadius} fill="url(#${uniqueId})"/>
        <g ${transformAttr}>
          <g transform="translate(2,2)">
            <path fill="${config.logoColor}" d="M27.6599 4.61799C27.4023 3.67884 26.9867 2.66489 26.2637 2C26.2387 2 26.2637 2.04987 26.2637 2.06649C26.3551 2.68151 26.4299 3.13862 26.4382 3.77026C26.4798 6.8038 25.2746 9.06441 22.2744 9.97032C16.8971 11.591 11.1791 11.6076 5.7935 9.97863C2.40258 8.96468 1.28889 6.23034 1.60471 2.87266L1.746 2.01662C1.43849 2.24102 1.18916 2.61502 1.00632 2.93915C0.0837887 4.56812 -0.173855 6.93678 0.108722 8.7569C0.956451 14.1674 6.101 15.9294 10.9297 16.3034C11.1292 16.32 11.337 16.3698 11.5448 16.3449C11.6029 16.187 11.6112 16.0125 11.6611 15.8379C12.0517 14.5248 13.4646 13.7934 14.7778 14.1923C15.7169 14.4749 16.44 15.3642 16.5148 16.3449C16.7059 16.3698 16.8805 16.32 17.0633 16.3034C20.288 16.0374 24.2025 15.1149 26.2969 12.4553C28.009 10.2861 28.3664 7.24429 27.6516 4.60968L27.6599 4.61799Z"/>
            <path fill="${config.logoColor}" d="M23.022 16.5278H18.1684C18.1102 16.6276 18.1517 16.7772 18.1351 16.8935C17.8775 19.8689 14.5281 21.5976 11.9517 20.06C10.7383 19.337 10.0651 18.1568 9.94039 16.7522C9.94039 16.7024 9.95701 16.5362 9.90715 16.5195H5.05348C5.00362 16.5943 5.02024 16.7522 5.02024 16.852C5.19477 22.0963 9.8739 26.0856 15.0849 25.4955C19.3735 25.0134 22.8558 21.3649 23.0553 17.0348C23.0553 16.9268 23.0719 16.6691 23.0553 16.5777C23.0553 16.5528 23.047 16.5445 23.022 16.5278Z"/>
          </g>
          ${MOUTH_SHAPES[config.mouthIndex](config.mouthColor)}
          ${EYE_SHAPES[config.eyeIndex](config.eyeColor)}
        </g>
      </svg>
    `.trim()

    return [svgContent, config]
  }

  static hashCode(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0
    return hash
  }

  // -----------------------
  // V2 (sync SVG data URL)
  // -----------------------
  generateAvatarV2(walletAddress: string, size: number = 128, isRounded: boolean = false): [string, AvatarConfig] {
    const wlc = walletAddress.toLowerCase()
    const key = genAvatarKeyV2(wlc)
    const v2 = getAvatarByKeyV2(key)

    // fallback to V1 if missing
    if (!v2.avatar || !v2.gradient || !v2.background) {
      const [svg, cfg] = this.generateAvatar(wlc, size, isRounded)
      return [svgToDataUrl(svg), cfg]
    }

    const uniqueId = `v2_${hashDart(wlc)}`
    const svg = buildV2Svg({
      size,
      isRounded,
      uniqueId,
      avatarSrc: v2.avatar,
      maskSrc: GRADIENT_AVATAR,
      gradient: v2.gradient,
      background: v2.background,
    })

    const cfg: AvatarConfig = {
      bgTypeIndex: 0,
      bgColor1: v2.background,
      bgColor2: v2.background,
      logoColor: v2.gradient,
      eyeIndex: 0,
      eyeColor: v2.gradient,
      mouthIndex: 0,
      mouthColor: v2.gradient,
      data: { decoColorIdx: -1 },
    }

    return [svgToDataUrl(svg), cfg]
  }

  // -----------------------
  // V3 (Promise PNG data URL)
  // -----------------------
  /**
   * Render to PNG via canvas and return:
   * - mode="dataUrl": "data:image/png;base64,...."
   * - mode="base64":  only the base64 content (no prefix)
   */
  async generateAvatarV3(
    walletAddress: string,
    size: number = 128,
    isRounded: boolean = false,
    mode: DataUrlMode = 'dataUrl',
  ): Promise<[string, AvatarConfig]> {
    const wlc = walletAddress.toLowerCase()
    const v2key = genAvatarKeyV2(wlc)
    const v2 = getAvatarByKeyV2(v2key)

    // fallback to V2 SVG data url
    if (!v2.avatar || !v2.gradient || !v2.background) {
      const [svg, cfg] = this.generateAvatar(wlc, size, isRounded)
      return [svgToDataUrl(svg), cfg]
    }

    const cacheKey = v3CacheKey({ wallet: wlc, size, rounded: isRounded, v2key })
    const cached = V3_CACHE.get(cacheKey)

    // return cached png if exists
    if (cached?.pngDataUrl) {
      const out = mode === 'base64' ? stripPngDataUrlPrefix(cached.pngDataUrl) : cached.pngDataUrl
      return [out, v3Cfg(v2.gradient, v2.background)]
    }

    // dedupe inflight renders
    if (cached?.inflight) {
      const pngDataUrl = await cached.inflight
      const out = mode === 'base64' ? stripPngDataUrlPrefix(pngDataUrl) : pngDataUrl
      return [out, v3Cfg(v2.gradient, v2.background)]
    }

    const inflight = this.renderV3PngDataUrl({
      size,
      isRounded,
      avatarSrc: v2.avatar,
      maskSrc: GRADIENT_AVATAR,
      gradient: v2.gradient,
      background: v2.background,
    })

    V3_CACHE.set(cacheKey, { ...(cached || {}), inflight })

    try {
      const pngDataUrl = await inflight
      V3_CACHE.set(cacheKey, { pngDataUrl })
      const out = mode === 'base64' ? stripPngDataUrlPrefix(pngDataUrl) : pngDataUrl
      return [out, v3Cfg(v2.gradient, v2.background)]
    } catch (e) {
      // cleanup inflight if failed
      V3_CACHE.delete(cacheKey)
      // fallback to V2 SVG (sync content but returned as Promise here)
      const [src, cfg] = this.generateAvatarV2(wlc, size, isRounded)
      return [src, cfg]
    }
  }

  private async renderV3PngDataUrl(args: {
    size: number
    isRounded: boolean
    avatarSrc: string
    maskSrc: string
    gradient: HexColor
    background: HexColor
  }): Promise<string> {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      throw new Error('V3 canvas rendering requires browser environment')
    }

    // Load images (async)
    // - maskSrc is likely data:... from ?inline and always safe
    // - avatarSrc is a public URL, safe to load
    const [maskImg, avatarImg] = await Promise.all([
      loadImage(args.maskSrc, { crossOrigin: 'anonymous' }),
      loadImage(args.avatarSrc, { crossOrigin: 'anonymous' }),
    ])

    const { size, isRounded, gradient, background } = args

    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size

    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('CanvasRenderingContext2D not available')

    // Clear + optional rounded clip
    ctx.clearRect(0, 0, size, size)
    if (isRounded) {
      roundRectPath(ctx, 0, 0, size, size, (16 / 32) * size)
      ctx.clip()
    }

    // 1) background
    ctx.fillStyle = background as string
    ctx.fillRect(0, 0, size, size)

    // 2) tinted mask using offscreen canvas
    const tmp = document.createElement('canvas')
    tmp.width = size
    tmp.height = size
    const tctx = tmp.getContext('2d')
    if (!tctx) throw new Error('CanvasRenderingContext2D (tmp) not available')

    tctx.clearRect(0, 0, size, size)
    tctx.drawImage(maskImg, 0, 0, size, size)
    tctx.globalCompositeOperation = 'source-in'
    tctx.fillStyle = gradient as string
    tctx.fillRect(0, 0, size, size)
    tctx.globalCompositeOperation = 'source-over'

    ctx.drawImage(tmp, 0, 0)

    // 3) avatar overlay
    ctx.drawImage(avatarImg, 0, 0, size, size)

    // Export
    return canvas.toDataURL('image/png')
  }
}

// -------------------------
// Types
// -------------------------
export interface AvatarConfig {
  bgTypeIndex: number
  bgColor1: HexColor
  bgColor2: HexColor
  logoColor: HexColor
  eyeIndex: number
  eyeColor: HexColor
  mouthIndex: number
  mouthColor: HexColor
  data?: {
    decoColorIdx: number
  }
}

export interface AvatarFactoryOptions {
  /**
   * all color wheels use a same HueLevels config at this time
   * It easier for review
   * We can still use different hue levels foreach ColorWheel
   *
   * @deprecated no usage anymore
   */
  universalHueLevels?: number
  decoColorWheel: ColorWheel
  logoColorWheel: ColorWheel
  bgColorWheel: ColorWheel
}

// -------------------------
// V3 config helper
// -------------------------
function v3Cfg(gradient: HexColor, background: HexColor): AvatarConfig {
  return {
    bgTypeIndex: 0,
    bgColor1: background,
    bgColor2: background,
    logoColor: gradient,
    eyeIndex: 0,
    eyeColor: gradient,
    mouthIndex: 0,
    mouthColor: gradient,
    data: { decoColorIdx: -1 },
  }
}

// -------------------------
// Background gradient types (V1)
// -------------------------
const BACKGROUND_TYPES: ((id: string, bgCenter: HexColor, bgOut: HexColor) => string)[] = [
  // 0: Solid color
  // @ts-expect-error bgOut is redundant but should keep universal type
  (id, bgCenter, bgOut) => `
    <radialGradient id="${id}" cx="50%" cy="50%" r="80%">
      <stop offset="0%" stop-color="${bgCenter}"/>
      <stop offset="100%" stop-color="${bgCenter}"/>
    </radialGradient>
  `,
  // 1: Radial Gradient
  (id, bgCenter, bgOut) => `
    <radialGradient id="${id}" cx="50%" cy="50%" r="80%">
      <stop offset="0%" stop-color="${bgCenter}"/>
      <stop offset="100%" stop-color="${bgOut}"/>
    </radialGradient>
  `,
]

// -------------------------
// Eye/Mouth shapes (V1)
// NOTE: keep full arrays from your original file.
// I include only the portion you pasted; you should paste the rest unchanged.
// -------------------------
const EYE_SHAPES: ((c: HexColor) => string)[] = [
  (c) => `<ellipse cx="10" cy="13" rx="3" ry="6" fill="${c}"/><ellipse cx="22" cy="13" rx="3" ry="6" fill="${c}"/>`,
  (c) => `<circle cx="10" cy="13" r="4.8" fill="${c}"/><circle cx="22" cy="13" r="3.6" fill="${c}"/>`,
  (c) =>
    `<ellipse cx="10" cy="13" rx="4.5" ry="1.5" fill="${c}"/><ellipse cx="22" cy="13" rx="4.5" ry="1.5" fill="${c}"/>`,
  (c) => `<circle cx="10" cy="13" r="4.2" fill="${c}"/><circle cx="22" cy="13" r="4.2" fill="${c}"/>`,
  (c) => `<circle cx="10" cy="13" r="2.4" fill="${c}"/><circle cx="22" cy="13" r="2.4" fill="${c}"/>`,
  (c) =>
    `<line x1="8" y1="13" x2="12" y2="13" stroke="${c}" stroke-width="5.4" stroke-linecap="round"/><line x1="20" y1="13" x2="24" y2="13" stroke="${c}" stroke-width="5.4" stroke-linecap="round"/>`,
  (c) =>
    `<rect x="7" y="11.5" width="6" height="4.5" rx="0.75" fill="${c}" transform="rotate(-20 10 12.5)"/><rect x="19" y="11.5" width="6" height="4.5" rx="0.75" fill="${c}" transform="rotate(20 22 12.5)"/>`,
  (c) =>
    `<ellipse cx="10" cy="16" rx="2.55" ry="3" fill="#fff"/><ellipse cx="22" cy="16" rx="2.55" ry="3" fill="#fff"/><ellipse cx="10" cy="16" rx="1.05" ry="1.35" fill="${c}"/><ellipse cx="22" cy="16" rx="1.05" ry="1.35" fill="${c}"/>`,
  (c) => `<rect x="4" y="11" width="24" height="7.5" rx="3" fill="${c}"/>`,
  (c) => `
    <path d="M13 20 Q16 23 19 20" stroke="${c}" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    <path d="M6.9 9.9 L13.1 16.1 M13.1 9.9 L6.9 16.1" stroke="${c}" stroke-width="1.8" stroke-linecap="round"/>
    <path d="M18.9 9.9 L25.1 16.1 M25.1 9.9 L18.9 16.1" stroke="${c}" stroke-width="1.8" stroke-linecap="round"/>`,
  (c) => `<path d="M13 20 Q16 23 19 20" stroke="${c}" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    <path d="M10 9 L10.9 12.9 L14.5 13.5 L10.9 14.1 L10 18 L9.1 14.1 L5.5 13.5 L9.1 12.9 Z" fill="${c}"/>
    <path d="M22 9 L22.9 12.9 L26.5 13.5 L22.9 14.1 L22 18 L21.1 14.1 L17.5 13.5 L21.1 12.9 Z" fill="${c}"/>`,
  () => `
    <path d="M6.75 10.25 C6.75 9 8.25 8.5 9 9.25 C9.75 8.5 11.25 9 11.25 10.25 C11.25 12.5 8.75 14.75 8.75 14.75 C8.75 14.75 6.25 12.5 6.25 10.25 C6.25 9 7.75 8.5 8.5 9.25 C9.25 8.5 6.75 9 6.75 10.25 Z" fill="#d63384"/>
    <path d="M18.75 10.25 C18.75 9 20.25 8.5 21 9.25 C21.75 8.5 23.25 9 23.25 10.25 C23.25 12.5 20.75 14.75 20.75 14.75 C20.75 14.75 18.25 12.5 18.25 10.25 C18.25 9 19.75 8.5 20.5 9.25 C21.25 8.5 18.75 9 18.75 10.25 Z" fill="#d63384"/>`,
  (c) => `<path d="M13 20 Q16 23 19 20" stroke="${c}" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    <ellipse cx="10" cy="13" rx="3.3" ry="4.2" fill="${c}"/>
    <path d="M19.75 13 Q22 16.5 25.25 13" stroke="${c}" stroke-width="1.8" fill="none" stroke-linecap="round"/>`,
  (c) => `<path d="M13 20 Q16 23 19 20" stroke="${c}" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    <path d="M6.75 13 Q10 16.5 13.25 13" stroke="${c}" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    <path d="M18.75 13 Q22 16.5 25.25 13" stroke="${c}" stroke-width="1.8" fill="none" stroke-linecap="round"/>`,
]

const MOUTH_SHAPES: ((c: HexColor) => string)[] = [
  (c) => `<path d="M10.5 22 Q16 26.5 21.5 22" stroke="${c}" stroke-width="1.8" fill="none" stroke-linecap="round"/>`,
  (c) => `<path d="M9 22 Q16 28 23 22" stroke="${c}" stroke-width="1.8" fill="none" stroke-linecap="round"/>`,
  (c) => `<line x1="10.5" y1="23.5" x2="21.5" y2="23.5" stroke="${c}" stroke-width="1.8" stroke-linecap="round"/>`,
  (c) => `<path d="M10.5 25 Q16 20.5 21.5 25" stroke="${c}" stroke-width="1.8" fill="none" stroke-linecap="round"/>`,
  (c) => `<circle cx="16" cy="23.5" r="2.25" stroke="${c}" stroke-width="1.8" fill="none"/>`,
  (c) =>
    `<path d="M10.5 23.5 Q13.5 25 21.5 23.5" stroke="${c}" stroke-width="1.8" fill="none" stroke-linecap="round"/>`,
  (c) => `<path d="M7.5 25 Q16 17.5 24.5 25" stroke="${c}" stroke-width="1.8" fill="none" stroke-linecap="round"/>`,
  (c) => `<ellipse cx="16" cy="23.5" rx="3.75" ry="2.25" fill="${c}"/>`,
  (c) =>
    `<ellipse cx="16" cy="23.5" rx="1.8" ry="2.4" fill="#fff"/><ellipse cx="16" cy="23.5" rx="1.05" ry="1.35" fill="${c}"/>`,
  // paste the rest of your mouth shapes here unchanged
]

// -------------------------
// Convenience export: <img src="..."> usage
// -------------------------
export async function generateAvatarV3ImgSrc(
  avatarFactory: AvatarFactory,
  walletAddress: string,
  size: number = 128,
  isRounded: boolean = false,
): Promise<string> {
  const [src] = await avatarFactory.generateAvatarV3(walletAddress, size, isRounded, 'dataUrl')
  return src
}

export async function generateAvatarV3Base64(
  avatarFactory: AvatarFactory,
  walletAddress: string,
  size: number = 128,
  isRounded: boolean = false,
): Promise<string> {
  const [b64] = await avatarFactory.generateAvatarV3(walletAddress, size, isRounded, 'base64')
  return b64
}
