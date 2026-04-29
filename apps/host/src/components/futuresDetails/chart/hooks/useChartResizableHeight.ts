import { useCallback, useEffect } from "react"

export const useResizableHeight = ({
  height,
  setHeight,
  dispatch,
  minHeight = 150,
}: {
  height: number
  setHeight: (h: number) => void
  dispatch?: (action: any) => void
  minHeight?: number
}) => {

  const handleMouseDown = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault()
      const startY = 'clientY' in e ? e.clientY : e.touches[0].clientY

      const handleMouseMove = (moveEvent: MouseEvent | TouchEvent) => {
        moveEvent.preventDefault()
        const currentY =
          'clientY' in moveEvent
            ? moveEvent.clientY
            : (moveEvent as TouchEvent).touches[0].clientY

        const newHeight = height + (currentY - startY)
        const heightCalc = Math.max(minHeight, newHeight)
        setHeight(heightCalc)
        dispatch?.({ type: 'chart/updateHeight', payload: heightCalc })
      }

      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
        document.removeEventListener('touchmove', handleMouseMove)
        document.removeEventListener('touchend', handleMouseUp)
      }

      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.addEventListener('touchmove', handleMouseMove, { passive: false })
      document.addEventListener('touchend', handleMouseUp)
    },
    [height, setHeight, dispatch, minHeight]
  )

  
  return {
    handleMouseDown,
  }
}
