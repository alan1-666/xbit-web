import { isAndroid, isIOS } from 'react-device-detect'
import { APP_STORE_URL, GOOGLE_PLAY_URL } from '@/lib/constant.ts'

export const GoToStore = () => {
  if (isAndroid) {
    window.location.href = GOOGLE_PLAY_URL
    return null
  }
  if (isIOS) {
    window.location.href = APP_STORE_URL
    return null
  }
  window.location.href = '/app'
  return null
}
