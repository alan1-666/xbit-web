import React from 'react'
import MemeList from './meme-list'
import '@/components/watchlistTab/favorite-xstock-wrapper.css'

interface MarketMemeWrapperProps {
  className?: string
  type: string
}

/**
 * Meme 列表的包装组件
 * 用于在 market 页面的一级 tab 中显示，调整样式以匹配设计
 */
const MarketMemeWrapper: React.FC<MarketMemeWrapperProps> = ({ className, type }) => {
  return (
    <div className={className}>
      <MemeList type={type} />
    </div>
  )
}

export default MarketMemeWrapper
