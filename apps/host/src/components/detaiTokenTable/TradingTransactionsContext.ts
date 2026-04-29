import { createContext, RefObject } from 'react'
import { ModalDateTimePickerHandle } from '@components/detaiTokenTable/ModalDateTimePicker.tsx'
import { FilterTransactionAmountHandle } from '@components/detaiTokenTable/FilterTransactionAmount.tsx'
import { FilterVolumeHandle } from '@components/detaiTokenTable/FilterVolume.tsx'
import { FilterAddressHandle } from '@components/detaiTokenTable/FilterAddress.tsx'
import { WalletInfo } from '@components/detaiTokenTable/TradingTransactionsTable.tsx'
import { TypeFilterDrawerHandle } from '@components/detaiTokenTable/filters/TypeFilterDrawer.tsx'

export interface TradingTransactionsContextProps {
  datePickerRef: RefObject<ModalDateTimePickerHandle | null>
  amountRef: RefObject<FilterTransactionAmountHandle | null>
  volumeRef: RefObject<FilterVolumeHandle | null>
  addressRef: RefObject<FilterAddressHandle | null>
  typeRef: RefObject<TypeFilterDrawerHandle | null>
  symbol?: string
  totalSupply: number
  tokenAddress: string
  price: string
  walletsInfo: Record<string, WalletInfo>
  followingWallets: string[]
  showMakerDrawer: (maker: string) => void
}

export const TradingTransactionsContext = createContext<TradingTransactionsContextProps>({
  datePickerRef: { current: null },
  amountRef: { current: null },
  volumeRef: { current: null },
  addressRef: { current: null },
  typeRef: { current: null },
  totalSupply: 0,
  tokenAddress: '',
  price: '0',
  walletsInfo: {},
  followingWallets: [],
  showMakerDrawer: () => {},
})
