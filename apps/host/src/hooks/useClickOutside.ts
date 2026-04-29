import { RefObject, useEffect } from 'react'

export const useClickOutside = <T extends HTMLElement | null>(refs: RefObject<T>[], handler: Function) => {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (refs.some((ref) => ref.current && ref.current.contains(target))) {
        return
      }
      handler()
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [handler])
}
