import { useAppDispatch, useAppSelector } from '@/redux/store'
import { useEffect } from 'react'
import { quoteSymbolsActions, resolveTokenSymbols, selectUnknownTokens } from '@/redux/modules/quoteSymbols.slice.ts'
import { useActiveChainId } from '@hooks/useActiveChain.ts'
import { ChainIds } from '@/types/enums.ts'

export const useTokenSymbolsResolver = (tokens: string[]) => {
  const dispatch = useAppDispatch()
  const chainId = useActiveChainId() ?? ChainIds.Solana
  const unknownTokens = useAppSelector(selectUnknownTokens())
  // useEffect(() => {
  //   dispatch(quoteSymbolsActions.addTokens(tokens))
  // }, [tokens])

  useEffect(() => {
    dispatch(resolveTokenSymbols({ chainId: chainId, addresses: unknownTokens }))
  }, [unknownTokens, chainId])
}
