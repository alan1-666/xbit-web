import { Middleware } from '@reduxjs/toolkit'

export const authMiddleware: Middleware = (storeAPI) => (next) => (action: any) => {
  const result = next(action)
  return result
}
