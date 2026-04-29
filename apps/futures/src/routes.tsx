import { lazy } from 'react';
import {
  RouteObject,
  createBrowserRouter,
  RouterProvider,
  type Router
} from 'react-router-dom';
import { APP_PATH } from './lib/constant'

const FuturesPage = lazy(() => import('./pages/futures'));
const FuturesDiscover = lazy(() => import('./pages/futures-discover'));
const FuturesMarket = lazy(() => import('./pages/futures-market'));

export const routes: RouteObject[] = [
  {
    path: APP_PATH.FUTURES,
    element: <FuturesPage />
  },
  {
    path: APP_PATH.FUTURES_DISCOVER,
    element: <FuturesDiscover />
  },
  {
    path: APP_PATH.MARKET,
    element: <FuturesMarket />
  }
];


// 导出供主应用使用的路由实例
export const router: Router = createBrowserRouter(routes);

// 默认导出联邦模块需要的组件
export default function FuturesRoutes() {
  return (
    <RouterProvider 
      router={router}
      fallbackElement={<div>Loading Futures...</div>}
    />
  );
}