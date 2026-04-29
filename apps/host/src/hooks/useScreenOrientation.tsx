import { useEffect, useState } from 'react'
import { isMobile } from 'react-device-detect'

const useScreenOrientation = () => {
  const [orientation, setOrientation] = useState<string>('portrait')
  const [isLandscape, setIsLandscape] = useState<boolean>(false)

  useEffect(() => {
    const updateOrientation = () => {
      if (!isMobile) {
        setOrientation('portrait')
        setIsLandscape(false)
        return
      }

      if (screen.orientation) {
        const currentOrientation = screen.orientation.type
        setOrientation(currentOrientation)
        setIsLandscape(currentOrientation.includes('landscape'))
      } else if ('orientation' in window) {
        // Fallback cho iOS Safari sử dụng window.orientation
        const angle = Math.abs(window.orientation || 0)
        const isLandscapeMode = angle === 90
        setIsLandscape(isLandscapeMode)
        setOrientation(isLandscapeMode ? 'landscape' : 'portrait')
      } else {
        // Fallback cuối cùng: chỉ áp dụng cho mobile devices
        const win = window as Window
        const isLandscapeMode = win.innerWidth > win.innerHeight
        setIsLandscape(isLandscapeMode)
        setOrientation(isLandscapeMode ? 'landscape' : 'portrait')
      }
    }

    // Check initial orientation
    updateOrientation()

    // Listen for orientation changes
    if (screen.orientation) {
      screen.orientation.addEventListener('change', updateOrientation)
    } else {
      // Fallback event listener
      window.addEventListener('resize', updateOrientation)
      window.addEventListener('orientationchange', updateOrientation)
    }

    return () => {
      if (screen.orientation) {
        screen.orientation.removeEventListener('change', updateOrientation)
      } else {
        window.removeEventListener('resize', updateOrientation)
        window.removeEventListener('orientationchange', updateOrientation)
      }
    }
  }, [])

  return { orientation, isLandscape, isMobile }
}

export default useScreenOrientation
