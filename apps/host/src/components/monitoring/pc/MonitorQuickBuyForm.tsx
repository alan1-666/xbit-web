import {useState} from "react";
import TradeSettingsBottomSheet from "@components/common/TradeSettingsBottomSheet.tsx";
import {RootState, useAppDispatch} from "@/redux/store";
import {useActiveChain} from "@hooks/useActiveChain.ts";
import {useSelector} from "react-redux";
import {setQuickBuyAmount} from "@/redux/modules/quickBuy.slice.ts";
import {getIconChain} from "@/lib/blockchain";
import {useTradeConfig} from "@hooks/useTradeConfig.ts";
import {TransactionType} from "@/@generated/gql/graphql-trading.ts";

const MonitorQuickBuyForm = () => {
  const amount = useSelector((state: RootState) => state.quickBuy.amount)
  const dispatch = useAppDispatch();
  const [openTradeSettings, setOpenTradeSettings] = useState(false)
  const activeChain = useActiveChain()
  const {selectedPresetKey} = useTradeConfig({
    transactionType: TransactionType.Buy
  })
  return (
    <div className="flex items-center justify-end gap-2.5 pr-4">
      <div className="flex-1 rounded-full border border-[#ECECED2E] px-3 py-1.5 gap-2 flex items-center h-9">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="0.4" y="0.4" width="15.2" height="15.2" rx="7.6" stroke="#44403C" strokeWidth="0.8" />
          <path
            d="M4.17431 9.08776L7.96879 3.61926C8.05816 3.49045 8.26024 3.5537 8.26024 3.71047V7.17416C8.26024 7.26252 8.33188 7.33416 8.42024 7.33416H11.5816C11.712 7.33416 11.7877 7.48181 11.7115 7.58765L7.67298 13.1967C7.58221 13.3227 7.38313 13.2585 7.38313 13.1032V9.49898C7.38313 9.41061 7.3115 9.33898 7.22313 9.33898H4.30577C4.17662 9.33898 4.10069 9.19387 4.17431 9.08776Z"
            fill="#44403C"
          />
        </svg>
        <div className="flex-1 flex items-center justify-end">
          <input
            className="text-[calc(13rem/16)] w-full text-right ml-auto"
            value={amount}
            inputMode='decimal'
            onChange={(e) => {
              let newValue = e.target.value.replace(/[^0-9.,]/g, '')
              newValue = newValue.replace(/,/g, '.')
              if (newValue.includes('.')) {
                const parts = newValue.split('.')
                newValue = parts[0] + '.' + parts[1]
              }
              dispatch(setQuickBuyAmount(newValue))
            }}
          />
        </div>
        <img src={getIconChain(activeChain)} alt="chain-logo" className="w-[16px] h-[16px] rounded-full" />
      </div>
      <div
        className="border border-[#ECECED14] rounded-full bg-[#ECECED14] flex items-center justify-center h-9 px-3 gap-2 cursor-pointer"
        onClick={() => setOpenTradeSettings(true)}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M2 6.07292V9.91958C2 11.3329 2 11.3329 3.33333 12.2329L7 14.3529C7.55333 14.6729 8.45333 14.6729 9 14.3529L12.6667 12.2329C14 11.3329 14 11.3329 14 9.92625V6.07292C14 4.66625 14 4.66625 12.6667 3.76625L9 1.64625C8.45333 1.32625 7.55333 1.32625 7 1.64625L3.33333 3.76625C2 4.66625 2 4.66625 2 6.07292Z"
            stroke="#B9B9B9"
            strokeWidth="1.14286"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M8 10C9.10457 10 10 9.10457 10 8C10 6.89543 9.10457 6 8 6C6.89543 6 6 6.89543 6 8C6 9.10457 6.89543 10 8 10Z"
            stroke="#B9B9B9"
            strokeWidth="1.14286"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="text-white text-[calc(14rem/16)] font-medium leading-3.5">P{selectedPresetKey ?? 1}</span>
      </div>
      <div className="hidden">
        <TradeSettingsBottomSheet open={openTradeSettings} setOpen={setOpenTradeSettings} />
      </div>
    </div>
  );
};

export default MonitorQuickBuyForm;
