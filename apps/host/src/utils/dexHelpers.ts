// Map tên DEX với icon tương ứng
const DEX_ICON_MAP: Record<string, string> = {
  // Raydium
  raydium: '/images/icons/raydium.svg',
  
  // Jupiter
  jupiter: '/images/icons/jupiter.svg',
  
  // PumpFun
  pumpfun: '/images/icons/pumpfun.svg',
  'pump.fun': '/images/icons/pumpfun.svg',
  
  // Orca
  orca: '/images/icons/orca.svg',
  
  // Meteora
  meteora: '/images/icons/meteora.svg',
  
  // Moonshot
  moonshot: '/images/icons/moonshot.svg',
  
  // Default whale icon
  default: '/images/tokenDetail/whale.png',
}

/**
 * Lấy icon dựa trên tên DEX
 * @param dexName - Tên của DEX
 * @returns Đường dẫn đến icon
 */
export const getDexIcon = (dexName: string): string => {
  if (!dexName) return DEX_ICON_MAP.default

  const normalizedDexName = dexName.toLowerCase().trim()
  
  // Tìm icon dựa trên tên DEX
  for (const [key, iconPath] of Object.entries(DEX_ICON_MAP)) {
    if (key !== 'default' && normalizedDexName.includes(key)) {
      return iconPath
    }
  }
  
  return DEX_ICON_MAP.default
}

/**
 * Lấy icon DEX đầu tiên từ danh sách DEX
 * @param dexList - Mảng các đối tượng DEX
 * @returns Đường dẫn đến icon của DEX đầu tiên hoặc icon mặc định
 */
export const getFirstDexIcon = (dexList: Array<{ dex: string; factory: string }> | undefined): string => {
  if (!dexList || dexList.length === 0) {
    return DEX_ICON_MAP.default
  }
  
  return getDexIcon(dexList[0].dex)
}
