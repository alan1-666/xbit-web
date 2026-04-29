import {RootState, useAppSelector} from "@/redux/store";
import {UserSettingsState} from "@/redux/modules/userSettings.slice.ts";
import {Button} from "@components/ui/button.tsx";
import uesDetailTokenTable from "@components/detaiTokenTable/hooks/uesDetailTokenTable.tsx";
import {useTranslation} from "react-i18next";

const VolumeHeaderTrade = () => {
  const { t } = useTranslation()
  const { dataUnit } = useAppSelector((state: RootState) => state.userSettings as UserSettingsState)
  const { handleChangeCurrency } = uesDetailTokenTable()

  return (
    <div className="flex items-center gap-[4px] min-w-[110px]">
      <div className="font-[330] text-[12px]">{t('detail.tokenDetail.columnVolume')}</div>
      <div className="items-center cursor-pointer justify-center gap-1 flex">
        <Button
          size="xs"
          className="rounded-[6px] bg-transparent text-muted-foreground py-0 px-1 flex gap-1 items-center hover:bg-[#2A2839]"
          onClick={handleChangeCurrency}
        >
          <div className="cursor-pointer font-[330] text-[12px]">{dataUnit}</div>
          <img
            src="/images/orderBook/icon-refund.svg"
            className="w-[14px] h-[14px] cursor-pointer"
            alt="icon refund"
          />
        </Button>
      </div>
    </div>
  )
};

export default VolumeHeaderTrade;
