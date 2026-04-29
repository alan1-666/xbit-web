import { ChevronDown } from 'lucide-react'
import Text from '../common/Text'
import { useState } from 'react'

const TimeframeSelector = () => {
  const timeframes = ['15m', '30m', '1h', '4h']
  const [timeframe, setTimeframe] = useState('1h')

  return (
    <div className=" py-2 flex items-center border-t border-[#333333]">
      <div className="flex items-center gap-2 justify-center">
        <img src="/images/futuresDiscover/group-menu.svg" className="" alt="icon menu"/>
        <Text text="BTC合约交易数据概览" fontSize={16} fontWeight="medium" className="mb-0.5" />
      </div>

      <div className="ml-auto flex items-center gap-3">
        {timeframes.map((tf) => (
          <button key={tf} className='py-1' onClick={() => setTimeframe(tf)}>
            <Text
              text={tf}
              fontSize={11}
              fontWeight="regular"
              color={timeframe === tf ? '#fff' : '#FFFFFF80'}
            />
          </button>
        ))}

        <div className="relative">
          <button className="py-1 text-gray-500 flex items-center">
            <Text text="更多" fontSize={11} fontWeight="regular" color='#FFFFFF80' />
            <ChevronDown className="ml-1 w-4 h-4" />
          </button>

          {/* {isTimeframeOpen && (
            <div className="absolute right-0 mt-2 bg-[#1e1e1e] border border-[#333333] rounded-md py-2 shadow-lg z-10">
              <button className="block w-full text-left px-4 py-2 hover:bg-[#2a2a2a] text-gray-300">8h</button>
              <button className="block w-full text-left px-4 py-2 hover:bg-[#2a2a2a] text-gray-300">12h</button>
              <button className="block w-full text-left px-4 py-2 hover:bg-[#2a2a2a] text-gray-300">1d</button>
              <button className="block w-full text-left px-4 py-2 hover:bg-[#2a2a2a] text-gray-300">1w</button>
            </div>
          )} */}
        </div>
      </div>
    </div>
  )
}

export default TimeframeSelector
