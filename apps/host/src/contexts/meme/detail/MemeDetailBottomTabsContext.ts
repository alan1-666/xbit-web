import { createContext } from 'react'
import { TokenDetail } from '@/@generated/gql/graphql-meme2.ts'

export interface MemeDetailBottomTabsContextProps {
  tokenDetail: TokenDetail | undefined
}

export const MemeDetailBottomTabsContext = createContext<MemeDetailBottomTabsContextProps>({
  tokenDetail: undefined,
})

export const MemeDetailBottomTabsProvider = MemeDetailBottomTabsContext.Provider
