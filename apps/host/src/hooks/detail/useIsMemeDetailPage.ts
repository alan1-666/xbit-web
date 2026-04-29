import { useLocation } from 'react-router-dom'

const useIsMemeDetailPage = () => {
  const { pathname } = useLocation()
  return pathname.includes('/meme/') && pathname.includes('/token')
}

export default useIsMemeDetailPage
