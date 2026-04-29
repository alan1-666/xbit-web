
import { Database, Scale } from 'lucide-react'
import {
  ContractOverviewItem,
  ContractOverviewItemContent,
  ContractOverviewItemFooter,
  ContractOverviewItemHeader,
} from './contract-overview-item'
import './style.css'

const ContractOverview = () => {
  return (
    <div className="w-full overflow-x-auto _hidescrollbar flex gap-2 overflow-y-hidden">
      <div className="">
        <ContractOverviewItem className="w-[150px] pb-4">
          <div className="flex justify-between flex-col size-full">
            <div className="">
              <ContractOverviewItemHeader
                title="全网持仓总金额"
                className=""
                icon={<Database className="size-4 text-[#00FFB4]" />}
              />
              <ContractOverviewItemContent value="$1,168,466,262.06" subValue="159个交易所数据" />
            </div>
            <ContractOverviewItemFooter value={53} />
          </div>
        </ContractOverviewItem>
      </div>
      <div className="flex gap-2">
        <div className="flex flex-col gap-2 w-max">
          <ContractOverviewItem className="">
            <ContractOverviewItemHeader title="多头仓位" className="" />
            <ContractOverviewItemContent
              value="$60.08M"
              subValue="≈711.30 BTC"
              extraInfor
              extraInforPercent="52.8"
              extraInforTitle="占比"
              subValueClassName=""
            />
          </ContractOverviewItem>
          <ContractOverviewItem>
            <ContractOverviewItemHeader title="空头仓位" className="" />
            <ContractOverviewItemContent
              value="$446.08M"
              subValue="≈711.30 BTC"
              extraInforType="purple"
              extraInfor
              extraInforPercent="47.2"
              extraInforTitle="占比"
            />
          </ContractOverviewItem>
        </div>
        <div className="flex flex-col gap-2">
          <ContractOverviewItem className="">
            <ContractOverviewItemHeader title="清算密度" subTitle="多头" className="" />
            <ContractOverviewItemContent value="$86000-86500" valueClassName="!text-[#00FFB4]" subValue="$711.30 BTC" />
          </ContractOverviewItem>
          <ContractOverviewItem>
            <ContractOverviewItemHeader title="空头仓位" className="" subTitle='空头' />
            <ContractOverviewItemContent value="$86000-86500" valueClassName="!text-[#AB57FF]" subValue="$711.30 BTC" />
          </ContractOverviewItem>
        </div>
        <div className="flex flex-col gap-2">
          <ContractOverviewItem className="">
            <ContractOverviewItemHeader title="最大规模的清算" className="" />
            <ContractOverviewItemContent
              value="620.88 BTC"
              subValue="$5.92M"
            />
          </ContractOverviewItem>
          <ContractOverviewItem>
            <ContractOverviewItemHeader title="空头仓位" className="" />
            <ContractOverviewItemContent
              value="清算的美元价值"
            />
          </ContractOverviewItem>
        </div>
        <div className="flex flex-col gap-2">
          <ContractOverviewItem className="">
            <ContractOverviewItemHeader title="价格趋势" className="" subTitle='30d' />
            <ContractOverviewItemContent
              value="+14.35 %"
              valueClassName="!text-[#00FFB4]"
              showChart
            />
          </ContractOverviewItem>
          <ContractOverviewItem>
            <ContractOverviewItemHeader title="全球偏见" className="" subTitle='7d' icon={<Scale className="size-4 text-[#00FFB4]" />} />
            <ContractOverviewItemContent
              value="涨势"
              subValue="涨/跌:52%"
              showChart
            />
          </ContractOverviewItem>
        </div>
      </div>
    </div>
  )
}

export default ContractOverview
