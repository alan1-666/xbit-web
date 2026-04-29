import React, { useEffect, useRef, memo } from 'react'

function TradingViewWidget() {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current

    // Clear previous widget if any
    container.innerHTML = ''

    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js'
    script.type = 'text/javascript'
    script.async = true
    script.textContent = JSON.stringify({
      height: '250',
      autosize: true,
      symbol: 'BITSTAMP:BTCUSD',
      interval: 'D',
      timezone: 'Etc/UTC',
      theme: 'dark',
      style: '1',
      locale: 'en',
      hide_legend: false,
      allow_symbol_change: false,
      save_image: false,
      support_host: 'https://www.tradingview.com',
    })

    container.appendChild(script)

    return () => {
      // Cleanup on unmount
      container.innerHTML = ''
    }
  }, [])

  return (
    <div
      className="tradingview-widget-container px-[10px]"
      ref={containerRef}
      style={{ height: '100%', width: '100%' }}
    />
  )
}

export default memo(TradingViewWidget)
