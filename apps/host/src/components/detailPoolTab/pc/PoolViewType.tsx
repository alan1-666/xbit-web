import {cn} from "@/lib/utils.ts";
import {UITab} from "@/types/uiTabs.ts";

type Props = {
  tabs: UITab[],
  activeTab: UITab,
  setActiveTab: (tab: UITab) => void,
}

const PoolViewType = (props: Props) => {
  const { tabs, activeTab, setActiveTab } = props

  return (
    <div className="bg-[#ECECED0A] p-0.5 rounded-[4px] flex items-center w-max">
      {tabs?.map((item) => (
        <div
          className={cn(
            'px-3 py-1.5 cursor-pointer text-[14px] leading-[1] font-[380] rounded-[2px]',
            activeTab.value === item.value ? 'bg-[#ECECED14] text-white' : 'text-white/50',
          )}
          key={item.value}
          onClick={() => {
            setActiveTab(item)
          }}
        >
          {item.label}
        </div>
      ))}
    </div>
  );
};

export default PoolViewType;
