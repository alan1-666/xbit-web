import { useEffect, useRef } from 'react'

export const usePageTitle = (title: string) => {
  const titleRef = useRef(document.title)
  useEffect(() => {
    document.title = title
    return () => {
      document.title = titleRef.current
    }
  }, [title])
}
