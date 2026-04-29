import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { UITab } from '@/types/uiTabs.ts'
import MovingChangeBgTabs from '@components/common/MovingChangeBgTabs.tsx'

// 模拟 typeList
const typeList: UITab[] = [
  {
    value: 'trend',
    label: '走势图',
  },
  {
    value: 'trade',
    label: '交易',
  },
]

// 模拟趋势页面组件
const MockTrendPage = ({ onNavigateToTrade }: { onNavigateToTrade?: () => void }) => {
  return (
    <div className="p-6 bg-gray-800 min-h-[400px]">
      <h2 className="text-white text-xl mb-4">走势图页面</h2>
      <p className="text-gray-300 mb-6">这是走势图页面的内容</p>
      
      {/* 模拟底部按钮区域 */}
      <div className="fixed bottom-[70px] left-0 right-0 z-5 w-full pb-6 px-3 rounded-t-[8px] bg-black border-t border-[#ECECED14] pt-2.5 max-w-[768px] mx-auto">
        <div className="flex flex-row justify-center max-w-md mx-auto gap-2">
          <div className="flex justify-center flex-col items-center mr-1 cursor-pointer">
            <img src="/images/futuresDetail/early-warning.svg" className="size-[18px]" alt="icon early-warning" />
            <div className="text-[#00FFB4] text-[calc(1rem*(14/16))] w-[28px]">预警</div>
          </div>
          <Button 
            variant={'greenDefault'} 
            className={'w-full rounded-[50px] h-[calc(1rem*(32/16))]'} 
            onClick={() => {
              if (onNavigateToTrade) {
                onNavigateToTrade()
              } else {
                console.log('没有回调函数')
              }
            }}
          >
            做多
          </Button>
          <Button variant={'purpleDefault'} className={'w-full rounded-[50px] h-[calc(1rem*(32/16))]'}>
            做空
          </Button>
        </div>
      </div>
    </div>
  )
}

// 模拟交易页面组件
const MockTradePage = () => {
  return (
    <div className="p-6 bg-gray-700 min-h-[400px]">
      <h2 className="text-white text-xl mb-4">交易页面</h2>
      <p className="text-gray-300 mb-6">这是交易页面的内容</p>
      <div className="space-y-4">
        <div className="bg-gray-600 p-4 rounded">
          <p className="text-white">买入/卖出表单</p>
        </div>
        <div className="bg-gray-600 p-4 rounded">
          <p className="text-white">订单列表</p>
        </div>
      </div>
    </div>
  )
}

// 测试组件
const NavigationTest = () => {
  const [currentTypeTab, setCurrentTypeTab] = useState<string>(typeList[0].value) // 默认是走势图

  const handleNavigateToTrade = () => {
    console.log('点击做多按钮，切换到交易tab')
    setCurrentTypeTab(typeList[1].value) // 切换到交易tab
  }

  const renderContent = (type: string) => {
    switch (type) {
      case typeList[1].value:
        return <MockTradePage />
      default:
        return <MockTrendPage onNavigateToTrade={handleNavigateToTrade} />
    }
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="sticky top-0 bg-black z-10 pt-4">
        <div className="px-4">
          <MovingChangeBgTabs
            containerId="test-type-tabs"
            tabs={typeList}
            defaultTab={currentTypeTab}
            onTabChange={(tab: string) => {
              console.log('手动切换tab:', tab)
              setCurrentTypeTab(tab)
            }}
            tabBgClassName="!bg-[rgba(0,255,180,0.2)] rounded-[12px] h-[28px]"
            tabsListClassName="w-full mb-2"
            containerClassName=""
            tabsTriggerClassName="flex-1"
          />
        </div>
      </div>

      <div className="pb-[100px]">
        {renderContent(currentTypeTab)}
      </div>

      {/* 测试说明 */}
      <div className="fixed top-4 right-4 bg-gray-900 p-4 rounded-lg text-white text-sm max-w-xs z-20">
        <h3 className="font-bold mb-2">功能测试:</h3>
        <ul className="list-disc list-inside space-y-1 text-xs">
          <li>当前tab: <span className="text-green-400">{currentTypeTab === typeList[0].value ? '走势图' : '交易'}</span></li>
          <li>在走势图页面点击"做多"按钮</li>
          <li>应该自动切换到交易tab</li>
          <li>也可以手动点击tab切换</li>
        </ul>
        
        <div className="mt-3 pt-2 border-t border-gray-700">
          <p className="text-xs text-gray-400">
            实现逻辑: 趋势页面接收 onNavigateToTrade 回调，点击做多时调用回调切换到交易tab
          </p>
        </div>
      </div>
    </div>
  )
}

export default NavigationTest
