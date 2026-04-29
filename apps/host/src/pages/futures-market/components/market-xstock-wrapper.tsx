import React from 'react'
import XStockList from './xstock-list'
import '@/components/watchlistTab/favorite-xstock-wrapper.css'

interface MarketXStockWrapperProps {
  className?: string
}

/**
 * 美股列表的包装组件
 * 用于在 market 页面的一级 tab 中显示，调整样式以匹配设计
 */
const MarketXStockWrapper: React.FC<MarketXStockWrapperProps> = ({ className }) => {
  return (
    <div className={className}>
      <XStockList />
    </div>
  )
}

export default MarketXStockWrapper
