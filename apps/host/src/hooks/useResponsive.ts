import { useState, useEffect } from 'react'

export interface BreakpointConfig {
  mobile: number
  tablet: number
  desktop: number
}

const defaultBreakpoints: BreakpointConfig = {
  mobile: 768,
  tablet: 1024,
  desktop: 1280,
}

export const useResponsive = (breakpoints: BreakpointConfig = defaultBreakpoints) => {
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  })

  useEffect(() => {
    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const isMobile = screenSize.width < breakpoints.mobile
  const isTablet = screenSize.width >= breakpoints.mobile && screenSize.width < breakpoints.desktop
  const isDesktop = screenSize.width >= breakpoints.desktop

  return {
    screenSize,
    isMobile,
    isTablet,
    isDesktop,
    breakpoints,
  }
}
