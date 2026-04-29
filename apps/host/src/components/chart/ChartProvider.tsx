import { Datafeeds } from '@/datafeeds/index'
import { createContext, useContext, useRef, ReactNode } from 'react'
import { IChartingLibraryWidget } from '../../../public/charting_library'

interface ChartContextValue {
  datafeed: Datafeeds | null
  widget: IChartingLibraryWidget | null
  setDatafeed: (datafeed: Datafeeds) => void
  setWidget: (widget: IChartingLibraryWidget) => void
  isInitialized: boolean
  setIsInitialized: (value: boolean) => void
}

const ChartContext = createContext<ChartContextValue | null>(null)

export const useChartContext = () => {
  const context = useContext(ChartContext)
  if (!context) {
    throw new Error('useChartContext must be used within ChartProvider')
  }
  return context
}

interface ChartProviderProps {
  children: ReactNode
}

export const ChartProvider = ({ children }: ChartProviderProps) => {
  const datafeedRef = useRef<Datafeeds | null>(null)
  const widgetRef = useRef<IChartingLibraryWidget | null>(null)
  const isInitializedRef = useRef(false)

  const setDatafeed = (datafeed: Datafeeds) => {
    datafeedRef.current = datafeed
  }

  const setWidget = (widget: IChartingLibraryWidget) => {
    widgetRef.current = widget
  }

  const setIsInitialized = (value: boolean) => {
    isInitializedRef.current = value
  }

  return (
    <ChartContext.Provider
      value={{
        datafeed: datafeedRef.current,
        widget: widgetRef.current,
        setDatafeed,
        setWidget,
        isInitialized: isInitializedRef.current,
        setIsInitialized,
      }}
    >
      {children}
    </ChartContext.Provider>
  )
}

