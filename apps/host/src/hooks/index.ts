export * from './useCopyToClipboard'
export * from './createFastContext'
export * from './useNetworkFee'
export * from './rpc/useRPC'
export * from './useStateSearchParam'

export const useNoMemo = <const T>(factory: () => T): T => {
  'use no memo'
  return factory()
}
