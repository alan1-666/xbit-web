import React, { createContext, ReactNode, useContext, useMemo, useRef, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { setCurrentTradingTransactionType } from '@/redux/modules/tradeTab.slice'
import { UITab } from '@/types/uiTabs'
import { useTranslation } from 'react-i18next'
import { useResponsive } from '@/hooks/hyperliquid/useResponsive'
import { useGetTotalFollowings } from '@/hooks/useGetTotalFollowings'
import { FollowingWalletInfo, EventType } from '@/@generated/gql/graphql-meme2'

interface DetailTokenTableContextType {
  currentType: string
  listTabs: UITab[]
  editName: string

  refInput: React.RefObject<HTMLInputElement | null>
  setCurrentType: (type: string) => void
  updateCurrentType: (type: string) => void
  setEditName: (type: string) => void
  aliasTotalFollowings: readonly FollowingWalletInfo[]
  editNameState:
    | {
        status: boolean
        id: string
      }
    | undefined
  setEditNameState: React.Dispatch<
    React.SetStateAction<
      | {
          status: boolean
          id: string
        }
      | undefined
    >
  >
}

const DetailTokenTableContext = createContext<DetailTokenTableContextType | undefined>(undefined)

interface FilterTypeProviderProps {
  children: ReactNode
}

export const DetailTokenTableProvider: React.FC<FilterTypeProviderProps> = ({ children }) => {
  const dispatch = useAppDispatch()
  const currentTradingTransactionType = useAppSelector((state) => state.tradeTab.currentTradingTransactionType)
  const { t } = useTranslation()
  const { isDesktop } = useResponsive()
  const { data } = useGetTotalFollowings()
  const refInput = useRef<HTMLInputElement>(null)

  const listTabs: UITab[] = useMemo(() => {
    let tabs = [
      {
        value: 'all',
        label: t('detail.tabs.all'),
      },
      {
        value: EventType.Buy,
        label: t('detail.tabs.payOrder'),
      },
      {
        value: EventType.Sell,
        label: t('detail.tabs.sellOrder'),
      },
    ]

    if (isDesktop) {
      tabs = [
        ...tabs,
        // {
        //   value: 'AddLiquidity',
        //   label: t('activityTable.filters.addpood'),
        // },
        // {
        //   value: 'RemoveLiquidity',
        //   label: t('activityTable.filters.reduce'),
        // },
      ]
    }

    return tabs
  }, [isDesktop])

  const [currentType, setCurrentType] = useState<string>(currentTradingTransactionType ?? listTabs[0]?.value ?? 'all')
  const [editNameState, setEditNameState] = useState<{ status: boolean; id: string } | undefined>(undefined)
  const [editName, setEditName] = useState<string>('')

  const updateCurrentType = (type: string) => {
    setCurrentType(type)
    dispatch(setCurrentTradingTransactionType(type))
  }

  const value: DetailTokenTableContextType = {
    editName,
    listTabs,
    refInput,
    currentType,
    editNameState,
    aliasTotalFollowings: data,
    setEditName,
    setCurrentType,
    setEditNameState,
    updateCurrentType,
  }

  return <DetailTokenTableContext.Provider value={value}>{children}</DetailTokenTableContext.Provider>
}

export const useDetailTokenTableContext = () => {
  const context = useContext(DetailTokenTableContext)
  if (context === undefined) {
    throw new Error('useFilterType must be used within a FilterTypeProvider')
  }
  return context
}
