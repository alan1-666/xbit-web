import React, { useState } from 'react'
import InputControl from './InputControl'

// 使用示例组件
const InputControlExample = () => {
  const [currentPrice, setCurrentPrice] = useState('100.00')
  const [targetPrice, setTargetPrice] = useState('105.00')
  const [showTooltip, setShowTooltip] = useState(true) // 父组件控制是否显示

  // 计算百分比变化
  const calculatePercentageChange = () => {
    const current = parseFloat(currentPrice)
    const target = parseFloat(targetPrice)
    if (current && target) {
      return ((target - current) / current) * 100
    }
    return 0
  }

  const handlePriceChange = (value: string) => {
    setTargetPrice(value)
  }

  const handlePercentageClick = () => {
    console.log('百分比被点击了！', calculatePercentageChange())
  }

  const handlePlus = () => {
    const current = parseFloat(targetPrice) || 0
    setTargetPrice((current + 1).toFixed(2))
  }

  const handleMinus = () => {
    const current = parseFloat(targetPrice) || 0
    setTargetPrice(Math.max(0, current - 1).toFixed(2))
  }

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      <div className="max-w-md mx-auto space-y-6">
        <h1 className="text-white text-xl font-bold">InputControl 组件示例</h1>
        
        {/* 控制开关 */}
        <div className="flex items-center gap-4">
          <label className="text-white">显示百分比提示:</label>
          <button
            onClick={() => setShowTooltip(!showTooltip)}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              showTooltip 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-600 text-gray-300'
            }`}
          >
            {showTooltip ? '开启' : '关闭'}
          </button>
        </div>

        {/* 当前价格显示 */}
        <div className="text-white">
          <p>当前价格: <span className="text-blue-400">${currentPrice}</span></p>
          <p>目标价格: <span className="text-green-400">${targetPrice}</span></p>
          <p>价格变化: <span className={calculatePercentageChange() >= 0 ? 'text-green-400' : 'text-red-400'}>
            {calculatePercentageChange().toFixed(2)}%
          </span></p>
        </div>

        {/* InputControl 组件 */}
        <InputControl
          placeholder="请输入价格"
          value={targetPrice}
          onChange={handlePriceChange}
          onPlus={handlePlus}
          onMinus={handleMinus}
          formatThousands={true}
          colorBg="bg-[#232329]"
          showPercentageTooltip={showTooltip} // 父组件控制
          percentageValue={calculatePercentageChange()}
          onPercentageClick={handlePercentageClick}
        />

        {/* 不显示百分比的示例 */}
        <div className="border-t border-gray-700 pt-4">
          <h3 className="text-white mb-2">不显示百分比的示例:</h3>
          <InputControl
            placeholder="普通输入框"
            value="1000"
            onChange={() => {}}
            onPlus={() => {}}
            onMinus={() => {}}
            colorBg="bg-[#232329]"
            showPercentageTooltip={false} // 不显示百分比
          />
        </div>

        {/* 说明文档 */}
        <div className="text-gray-400 text-sm space-y-2">
          <h3 className="text-white font-semibold">功能说明:</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>当 showPercentageTooltip=true 时在输入框上方显示百分比标签</li>
            <li>点击百分比标签显示悬浮提示（3秒后自动消失）</li>
            <li>正数显示绿色，负数显示红色</li>
            <li>父组件可以通过 showPercentageTooltip=false 禁用功能</li>
            <li>支持自定义 onPercentageClick 回调</li>
            <li>百分比显示位置在输入框上方，不影响原有布局</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default InputControlExample
