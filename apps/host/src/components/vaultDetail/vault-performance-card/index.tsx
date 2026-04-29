import VaultMetricItem from './vault-metric-item'

const VaultPerformanceCard = () => {
  return (
    <div className="size-full rounded-[8px] bg-[url('/images/vaultDetail/bg_chart.png')] bg-no-repeat bg-cover py-3 rounded-[20px]">
      <div className="flex gap-3 items-center mb-4">
        <div className="rounded-r-[2px] bg-[#00FFB4] w-[2px] h-[12px]" />
        <div className="text-[calc(1rem*(16/16))] app-font-medium">金库业绩</div>
      </div>
      <div className="grid grid-cols-2 px-3">
        <div className="flex flex-col gap-2 border-r border-[#ECECED14]">
          <VaultMetricItem title="夏普比率" value="3.23" isShowInfo isRegularColor />
          <VaultMetricItem title="近3天收益率" value="-8.78%" />
          <VaultMetricItem title="近7天收益率" value="+4.08%" />
          <VaultMetricItem title="近30天收益率" value="+33.92%" />
          <VaultMetricItem title="7日最大回撤" value="-9.66%" />
        </div>
        <div className="flex flex-col gap-2 pl-3">
          <VaultMetricItem title="历史胜率" value="33.21%" isRegularColor />
          <VaultMetricItem
            title="盈亏比"
            value="12.36%"
            // isShowGradient
            customRenderValue={() => (
              <div className="flex gap-1.5 items-center">
                <div className="text-[#00FFB4] text-[calc(1rem*(14/16))] app-font-medium">4</div>
                <div className="text-[calc(1rem*(16/16))] app-font-medium text-white align-middle -mt-0.5">:</div>
                <div className="text-[#00FFB4] text-[calc(1rem*(14/16))] app-font-medium">1</div>
              </div>
            )}
          />
          <VaultMetricItem title="运行时长" value="59d/12h/33m" isRegularColor />
          <VaultMetricItem
            title="盈亏笔数"
            value="12.36%"
            isShowGradient
            customRenderValue={() => (
              <div className="flex justify-between">
                <div className="text-[#00FFB4] text-[calc(1rem*(11/16))] app-font-medium">盈 1123</div>
                <div className="text-[#AB57FF] text-[calc(1rem*(11/16))] app-font-medium">亏 1123</div>
              </div>
            )}
          />
        </div>
      </div>
    </div>
  )
}

export default VaultPerformanceCard
