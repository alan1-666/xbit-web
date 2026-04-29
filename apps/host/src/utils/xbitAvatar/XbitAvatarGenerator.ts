import { AvatarFactory } from '@/utils/xbitAvatar/AvatarFactory.ts'
import { ColorWheel } from '@/utils/xbitAvatar/ColorWheel.ts'

type Cfg = [number, number, number[]]
// please use this in production
const defaultXbitConfig: { deco: Cfg; logo: Cfg; bgrd: Cfg } = {
  // el: [hueCount, satLevels, lightLevels]
  deco: [42, 0.6, [0.6, 0.52, 0.45]],
  logo: [42, 0.6, [0.95, 0.85, 0.75]],
  bgrd: [42, 0.6, [0.3, 0.2, 0.1]],
}

const avatarFactory = new AvatarFactory({
  decoColorWheel: new ColorWheel(...defaultXbitConfig.deco),
  logoColorWheel: new ColorWheel(...defaultXbitConfig.logo),
  bgColorWheel: new ColorWheel(...defaultXbitConfig.bgrd),
})

/**
 * return svg image as string
 */
export async function generateAvatar(walletAddress: string, isRounded: boolean = false): Promise<string> {
  const [svg] = await avatarFactory.generateAvatarV3(walletAddress, 128, isRounded)
  return svg
}

/**
 * generate svg base64 base on wallet address
 *
 * please use with <img src="data:image/svg+xml;base64,${generateAvatarSvgImgSrc(...)}">
 *
 * @param walletAddress
 * @param isRounded
 */
export async function generateAvatarSvgImgSrc(walletAddress: string, isRounded: boolean = false): Promise<string> {
  return `data:image/svg+xml;base64,${btoa(await generateAvatar(walletAddress, isRounded))}`
}
