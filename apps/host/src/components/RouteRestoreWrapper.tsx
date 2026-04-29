import { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import ls from '@/lib/local-storage'
import { APP_PATH } from '@/lib/constant'
import { HeaderTab, routerActions } from '@/redux/modules/router.slice.ts'

/**
 * 路由恢复组件
 * 在根路径("/")时检查是否有缓存的路由，如果有就恢复，没有就重定向到默认页面
 */
export const RouteRestoreWrapper = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    const cachedRoute = ls.get('cached_route')
    
    if (cachedRoute && cachedRoute.path && cachedRoute.timestamp) {
      // 检查缓存是否在有效期内（7天）
      const isValid = Date.now() - cachedRoute.timestamp < 7 * 24 * 60 * 60 * 1000
      if (isValid) {
        // 设置正确的标签状态
        dispatch(routerActions.setHeaderTab(cachedRoute.tab as HeaderTab))
        // 由于我们不能在 useEffect 中使用 navigate，我们将在渲染中返回 Navigate 组件
        return
      } else {
        // 缓存过期，清除它
        ls.remove('cached_route')
      }
    }
  }, [dispatch])

  const cachedRoute = ls.get('cached_route')
  
  // 如果有有效的缓存路由，重定向到缓存的路径
  if (cachedRoute && cachedRoute.path && cachedRoute.timestamp) {
    const isValid = Date.now() - cachedRoute.timestamp < 7 * 24 * 60 * 60 * 1000
    if (isValid) {
      return <Navigate to={cachedRoute.path} replace />
    }
  }

  // 没有有效缓存，重定向到默认页面
  return <Navigate to={APP_PATH.MEME_DISCOVER} replace />
}
