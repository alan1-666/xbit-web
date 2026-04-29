import { useState, useCallback, useRef } from 'react'
import { Layout } from 'react-grid-layout'
import eventBus from '@/lib/eventBus.ts'
import ls from '@/lib/local-storage'

export interface GridItem {
  i: string
  x: number
  y: number
  w: number
  h: number
  minW?: number
  minH?: number
  maxW?: number
  maxH?: number
  static?: boolean
}

export interface LayoutConfig {
  layouts: Layout[]
  breakpoint: string
}

const NEW_DEFAULT_LAYOUTS = {
  lg: [
    { i: 'header', x: 0, y: 0, w: 19, h: 2.5, minW: 19, maxW: 19, minH: 2.5, maxH: 2.5 },
    { i: 'trading-core', x: 0, y: 2.5, w: 19, h: 20, minW: 19, maxW: 19, minH: 20, maxH: 20 },
    { i: 'trading-panel', x: 19, y: 0, w: 5, h: 23, minW: 5, maxW: 5, minH: 23, maxH: 23 },
    // { i: 'chart', x: 0, y: 3, w: 14, h: 20, minW: 12, minH: 10 },
    // { i: 'orderbook', x: 14, y: 3, w: 4, h: 20, minW: 4, maxW: 12, minH: 10 },
    // { i: 'positions', x: 0, y: 18, w: 18, h: 20, minW: 18, minH: 10 },
  ],
  md: [
    { i: 'header', x: 0, y: 0, w: 17, h: 2.5, minW: 17, maxW: 17, minH: 2.5, maxH: 2.5 },
    { i: 'trading-core', x: 0, y: 2.5, w: 17, h: 20, minW: 17, maxW: 17, minH: 20, maxH: 20 },
    { i: 'trading-panel', x: 23, y: 0, w: 7, h: 23, minW: 7, maxW: 7, minH: 23, maxH: 23 },
    // { i: 'chart', x: 0, y: 3, w: 12, h: 20, minW: 12, minH: 10 },
    // { i: 'orderbook', x: 12, y: 3, w: 5, h: 20, minW: 4, maxW: 12, minH: 10 },
    // { i: 'positions', x: 0, y: 17, w: 17, h: 20, minW: 18, minH: 10 },
  ],
}

export const useGridLayout = (storageKey: string = 'meme-grid-layout') => {
  const screen = window.innerWidth >= 1440 ? 'lg' : 'md'
  const getInitial = () => {
    try {
      if (typeof window === 'undefined') return NEW_DEFAULT_LAYOUTS
      const raw = ls.get(storageKey)
      if (!raw) return NEW_DEFAULT_LAYOUTS
      return raw
    } catch (e) {
      return NEW_DEFAULT_LAYOUTS
    }
  }

  const [fullLayouts, setFullLayouts] = useState(() => getInitial())
  const [isDragging, setIsDragging] = useState(false)
  // useEffect(() => {
  //   try {
  //     const savedLayout = localStorage.getItem(storageKey)
  //     if (savedLayout) {
  //       console.log("savedLayout", savedLayout)
  //       const parsed = JSON.parse(savedLayout)
  //       setFullLayouts(parsed)
  //     }
  //   } catch (error) {
  //     console.warn('Failed to load grid layout from storage:', error)
  //   }
  // }, [storageKey])

  // const firstRender = useRef(0)

  // useEffect(() => {
  //   if (firstRender.current < 2 && ls.get('tradesPanelPosition') === tradesPanelPosition) {
  //     firstRender.current += 1
  //     return
  //   }
  //   const savedLayout = localStorage.getItem(storageKey)
  //   if (savedLayout) {
  //     const parsed = JSON.parse(savedLayout)
  //     const object = parsed?.[screen]
  //     const orderbookLS = object?.find((item: Layout) => item.i === 'orderbook')
  //     const chartLS = object?.find((item: Layout) => item.i === 'chart')
  //     if (tradesPanelPosition === 'bottom') {
  //       const orderbook =
  //         screen === 'lg'
  //           ? { i: 'orderbook', x: 17, y: 6, w: 0, h: 0, minW: 0, maxW: 0, minH: 0 }
  //           : { i: 'orderbook', x: 15, y: 6, w: 0, h: 0, minW: 0, maxW: 0, minH: 0 }
  //       const chart = { ...chartLS, w: chartLS?.w + orderbookLS?.w }
  //       const newLayout = object.map((item: Layout) =>
  //         item.i === 'orderbook' ? orderbook : item.i === 'chart' ? chart : item,
  //       )
  //       setFullLayouts({
  //         ...object,
  //         [screen]: newLayout,
  //       })
  //     } else {
  //       const orderbook =
  //         screen === 'lg'
  //           ? { i: 'orderbook', x: 14, y: 3, w: 4, h: 20, minW: 4, maxW: 12, minH: 10 }
  //           : { i: 'orderbook', x: 12, y: 3, w: 5, h: 20, minW: 4, maxW: 12, minH: 10 }
  //       const chart =
  //         screen === 'lg'
  //           ? { i: 'chart', x: 0, y: 3, w: 14, h: 20, minW: 12, minH: 10 }
  //           : { i: 'chart', x: 0, y: 3, w: 12, h: 20, minW: 12, minH: 10 }
  //       const newLayout = object.map((item: Layout) =>
  //         item.i === 'orderbook' ? orderbook : item.i === 'chart' ? chart : item,
  //       )
  //       setFullLayouts({
  //         ...object,
  //         [screen]: newLayout,
  //       })
  //     }
  //   }
  // }, [tradesPanelPosition])

  const saveLayout = (newLayouts: Layout[]) => {
    try {
      const savedLayout = {
        ...fullLayouts,
        [screen]: newLayouts,
      }
      setFullLayouts(savedLayout)
      ls.set(storageKey, savedLayout)
    } catch (error) {
      console.warn('Failed to save grid layout to storage:', error)
    }
  }

  const ref = useRef(0)

  const onLayoutChange = (newLayouts: Layout[]) => {
    if (ref.current < 3) {
      ref.current += 1
      return
    }
    saveLayout(newLayouts)
    eventBus.dispatch('gridLayoutChange', { data: newLayouts })
  }

  const resetLayout = () => {
    saveLayout(NEW_DEFAULT_LAYOUTS?.[screen])
  }

  const onDragStart = useCallback(() => {
    setIsDragging(true)
  }, [])

  const onDragStop = useCallback(() => {
    setIsDragging(false)
  }, [])

  return {
    fullLayouts,
    isDragging,
    onLayoutChange,
    resetLayout,
    onDragStart,
    onDragStop,
  }
}
