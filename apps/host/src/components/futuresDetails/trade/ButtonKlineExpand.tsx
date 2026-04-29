
import {
  selectFuturesTradePreferences,
  futuresTradePreferencesActions,
} from '@/redux/modules/futuresTradePreferences.slice'
import { useAppSelector, useAppDispatch } from '@/redux/store'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'


const ButtonKlineExpand = () => {
  const dispatch = useAppDispatch()
  const { isExpandKline } = useAppSelector(selectFuturesTradePreferences)

  const handleClickCandle = () => {
    dispatch(
      futuresTradePreferencesActions.updateTradePreferences({
        isExpandKline: !isExpandKline,
      }),
    )
  }


  return (

    <div className="h-[calc(1rem*(28/16))] flex items-center justify-between py-1.5 px-2 rounded-[6px] border border-[#302E38] text-[#908E98] 
          text-[calc(1rem*(12/16))] cursor-pointer"
      onClick={() => {
        handleClickCandle()
      }}
    >
      <div className='flex items-center'>
        <img
          src="/images/futuresDetail/kline-expand-icon.svg"
          alt="kline-expand-icon"
          className='mr-0.5'
        />
        K线图表
      </div>

      <img className={cn(
        'transition-transform duration-300',
        isExpandKline ? 'rotate-180 text-white' : 'text-[#878787]',
      )}
        src="/images/futuresDetail/select-down-icon.svg"
        alt="select-down-icon"
      />

    </div>
  )
}
export default ButtonKlineExpand
