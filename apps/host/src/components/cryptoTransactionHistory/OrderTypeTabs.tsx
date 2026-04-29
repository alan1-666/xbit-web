import { useState } from 'react'

const ORDER_TYPES = [
  { label: '全部', value: 'all', total: 7 },
  { label: '市价委托', value: 'market', total: 0 },
  { label: '限价委托', value: 'limit', total: 0 },
  { label: '止盈止损', value: 'stop', total: 0 },
  { label: '分段委托', value: 'segment', total: 0 },
  { label: '分时委托', value: 'timeSplit', total: 0 },
]

export const OrderTypeTabs = () => {
  const [activeFilter, setActiveFilter] = useState(ORDER_TYPES[0].value)

  return (
    <div className="mt-2.5 flex overflow-x-auto whitespace-nowrap no-scrollbar">
      {ORDER_TYPES.map((item) => (
        <div
          className={`flex px-2.5 py-[5px] gap-[2px] text-xs rounded-[3px] cursor-pointer ${activeFilter === item.value ? 'bg-[#ECECED14] text-[#FFFFFF] ' : 'text-[#FFFFFF80]'}`}
          onClick={() => setActiveFilter(item.value)}
          key={item.value}
        >
          <span>{item.label}</span>
          {item.total > 0 && <span>{`(${item.total})`}</span>}
        </div>
      ))}
    </div>
  )
}
