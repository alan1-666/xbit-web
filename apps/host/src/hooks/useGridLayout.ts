// hooks/useGridLayout.ts
import { useCallback, useState, useEffect } from 'react'
import type { Layout, Layouts } from 'react-grid-layout'

// 请按需调整默认布局（lg 布局为主）
const DEFAULT_LG_LAYOUT: Layout[] = [
  { i: 'header', x: 0,  y: 0,  w: 24, h: 2.5, minW: 23, minH: 2.5, maxH: 2.5 },
  { i: 'chart',  x: 0,  y: 3,  w: 19, h: 22, minW: 19, minH: 22 },
  // 提高订单簿默认高度和最小高度，保证 10/20 行时不被遮挡
  { i: 'orderbook', x: 19, y: 3,  w: 4.99,  h: 22, minW: 4.99, maxW: 8, minH: 22 },
  { i: 'trading-panel', x: 24, y: 0,  w: 6,  h: 24.5, minW: 6, maxW: 9, minH: 24.5 },
  // 底部模块整体下移与订单簿对齐，避免初始重叠
  { i: 'positions', x: 0,  y: 25, w: 24, h: 22, minW: 18, minH: 11 },
  { i: 'account-info', x: 24, y: 25, w: 6,  h: 22, minW: 6, minH: 11 },
]

export const idPrefix = 'PC_FUTURES'


const DEFAULT_LAYOUTS: Layouts = {
  lg: DEFAULT_LG_LAYOUT,
  md: DEFAULT_LG_LAYOUT,
  sm: DEFAULT_LG_LAYOUT,
  xs: DEFAULT_LG_LAYOUT,
  xxs: DEFAULT_LG_LAYOUT,
}

function normalizeSavedToLayouts(parsed: any): Layouts {
  // 旧数据是 Layout[]，把它扩展为所有断点相同
  if (Array.isArray(parsed)) {
    return {
      lg: parsed,
      md: parsed,
      sm: parsed,
      xs: parsed,
      xxs: parsed,
    }
  }

  // 如果是对象（可能只含某些断点），填充缺省断点
  if (parsed && typeof parsed === 'object') {
    return {
      lg: parsed.lg ?? DEFAULT_LAYOUTS.lg,
      md: parsed.md ?? parsed.lg ?? DEFAULT_LAYOUTS.md,
      sm: parsed.sm ?? parsed.lg ?? DEFAULT_LAYOUTS.sm,
      xs: parsed.xs ?? parsed.lg ?? DEFAULT_LAYOUTS.xs,
      xxs: parsed.xxs ?? parsed.lg ?? DEFAULT_LAYOUTS.xxs,
    }
  }

  return DEFAULT_LAYOUTS
}

export const useGridLayout = (storageKey: string = 'futures-grid-layout') => {
  // SSR safe 初始读取：仅在 client 读取 localStorage
  const getInitial = (): Layouts => {
    try {
      if (typeof window === 'undefined') return DEFAULT_LAYOUTS
      const raw = localStorage.getItem(storageKey)
      if (!raw) return DEFAULT_LAYOUTS
      const parsed = JSON.parse(raw)
      return normalizeSavedToLayouts(parsed)
    } catch (e) {
      return DEFAULT_LAYOUTS
    }
  }

  const [layouts, setLayouts] = useState<Layouts>(() => getInitial())
  const [isDragging, setIsDragging] = useState(false)
  const [resetKey, setResetKey] = useState(0)

  // 监听布局重置事件
  useEffect(() => {
    const handleReset = (event: CustomEvent) => {
      if (event.detail.storageKey === storageKey) {
        setLayouts(DEFAULT_LAYOUTS)
        setResetKey(prev => prev + 1)
      }
    }

    window.addEventListener('grid-layout-reset', handleReset as EventListener)
    return () => {
      window.removeEventListener('grid-layout-reset', handleReset as EventListener)
    }
  }, [storageKey])
  // onLayoutChange 的第二个参数 allLayouts 为所有断点布局（Object）
  const onLayoutChange = useCallback(
    (_currentLayout: Layout[], allLayouts: Layouts) => {
      try {
        setLayouts(allLayouts)
        localStorage.setItem(storageKey, JSON.stringify(allLayouts))
      } catch (e) {
        
      }
    },
    [storageKey]
  )

  const resetLayout = useCallback(() => {
    console.log('resetLayout')
    try {
      localStorage.removeItem(storageKey)
      setLayouts(DEFAULT_LAYOUTS)
      setResetKey(prev => prev + 1)
      for (let i = 0; i < DEFAULT_LG_LAYOUT.length; i++){
        const element = document.getElementById(`${idPrefix}_${DEFAULT_LG_LAYOUT[i].i}`);

        if (element && element?.parentNode) {
            element.style.display = 'block';

        }
      }
    } catch (e) {
      // ignore
    }

    // 派发重置事件，通知所有使用该存储键的组件
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('grid-layout-reset', {
        detail: { storageKey }
      })
      window.dispatchEvent(event)
    }
  }, [storageKey])

  // 拖拽状态管理
const onDragStart = useCallback(() => { setIsDragging(true) }, []) 
const onDragStop = useCallback(() => { setIsDragging(false) }, [])
  return {
    layouts,
    onLayoutChange,
    resetLayout,
    onDragStart,
    onDragStop,
    isDragging,
    resetKey,
  }
}
export default useGridLayout
