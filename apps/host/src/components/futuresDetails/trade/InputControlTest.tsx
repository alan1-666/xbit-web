import React, { useState } from 'react'
import InputControl from './InputControl'

// 测试组件
const InputControlTest = () => {
  const [price, setPrice] = useState('1234.56')

  const handlePriceChange = (value: string) => {
    console.log('价格变化:', value)
    setPrice(value)
  }

  const handlePlus = () => {
    const current = parseFloat(price) || 0
    setPrice((current + 1).toFixed(2))
  }

  const handleMinus = () => {
    const current = parseFloat(price) || 0
    setPrice(Math.max(0, current - 1).toFixed(2))
  }

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      <div className="max-w-md mx-auto space-y-6">
        <h1 className="text-white text-xl font-bold">InputControl 删除测试</h1>
        
        <div className="text-white">
          <p>当前值: <span className="text-green-400">{price}</span></p>
        </div>

        {/* 带格式化的输入框 */}
        <div>
          <h3 className="text-white mb-2">带千分位格式化:</h3>
          <InputControl
            placeholder="请输入价格"
            value={price}
            onChange={handlePriceChange}
            onPlus={handlePlus}
            onMinus={handleMinus}
            formatThousands={true}
            colorBg="bg-[#232329]"
            showPercentageTooltip={true}
            percentageValue={12.34}
          />
        </div>

        {/* 不带格式化的输入框 */}
        <div>
          <h3 className="text-white mb-2">不带格式化:</h3>
          <InputControl
            placeholder="普通输入框"
            value={price}
            onChange={handlePriceChange}
            onPlus={handlePlus}
            onMinus={handleMinus}
            formatThousands={false}
            colorBg="bg-[#232329]"
            showPercentageTooltip={false}
          />
        </div>

        {/* 测试说明 */}
        <div className="text-gray-400 text-sm space-y-2">
          <h3 className="text-white font-semibold">测试步骤:</h3>
          <ol className="list-decimal list-inside space-y-1">
            <li>在输入框中输入数字，如 "12345.67"</li>
            <li>尝试删除最后一位数字</li>
            <li>检查是否能正常删除，不会卡住</li>
            <li>测试连续删除多个字符</li>
            <li>测试在中间位置删除字符</li>
          </ol>
          
          <h3 className="text-white font-semibold mt-4">修复说明:</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>使用内部状态 inputValue 管理用户输入</li>
            <li>在输入时保持原始状态，避免格式化干扰</li>
            <li>失去焦点时才应用格式化</li>
            <li>外部 value 变化时同步到内部状态</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default InputControlTest
