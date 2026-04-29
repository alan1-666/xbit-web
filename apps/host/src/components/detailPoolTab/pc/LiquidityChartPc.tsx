import {useState} from "react";
import ChartLP from "@components/detailPoolTab/pc/ChartLP.tsx";
import {useTranslation} from "react-i18next";
import {ChainIds} from "@/types/enums.ts";

type LiquidityChartPcProps = {
  token?: string
  chainId?: number
}

const LiquidityChartPc = ({
  token,
  chainId,
}: LiquidityChartPcProps) => {
  const { t } = useTranslation()
  const [openLiquidityChart, setOpenLiquidityChart] = useState(false)

  return (
    <>
      <button
        className="bg-[#ECECED14] rounded-[4px] px-2.5 py-[9px] inline-flex items-center gap-1 hover:text-white/80 transition-colors cursor-pointer leading-[1] text-[13px]"
        onClick={() => setOpenLiquidityChart(true)}
      >
        <img src="/images/icons/icon-lpchart-pc.svg" alt="icon activity" />
        {t('detail.pool.chart')}
      </button>
      <ChartLP
        isOpen={openLiquidityChart}
        onOpenChange={setOpenLiquidityChart}
        token={token ?? ""}
        chainId={chainId ?? ChainIds.Solana}
      />
    </>
  );
};

export default LiquidityChartPc;
