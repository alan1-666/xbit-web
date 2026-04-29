import AppDrawer from '@components/common/AppDrawer.tsx'
import { useState } from 'react'
import ContractMonitoringChart from '@components/detailInfo/contractMonitoring/ContractMonitoringChart.tsx'
import { Button } from '@components/ui/button.tsx'
import CopyBtn from '@components/common/CopyBtn.tsx'
import ContractInformation, {
  ContractInformationProps,
} from '@components/detailInfo/contractMonitoring/ContractInformation.tsx'
import { useTranslation } from 'react-i18next'
import { TokenDetail } from '@/@generated/gql/graphql-future'
import { formatPercentage } from '@/utils/helpers.ts'

type ContractMonitoringProps = {
  open?: boolean
  setOpen?: (open: boolean) => void
  showTrigger?: boolean
  tokenData?: TokenDetail
}

const ContractMonitoring = ({
  open: externalOpen,
  setOpen: externalSetOpen,
  showTrigger = true,
  tokenData,
}: ContractMonitoringProps = {}) => {
  const { t } = useTranslation()
  const [internalOpen, setInternalOpen] = useState<boolean>(false)

  const isOpen = externalOpen !== undefined ? externalOpen : internalOpen
  const setIsOpen = externalSetOpen || setInternalOpen

  const chainId = tokenData?.chainId ? Number(tokenData.chainId) : undefined
  const isSolana = chainId === 501424
  const burnRatio = tokenData?.burnRatio ?? 0

  const checkCriteria = isSolana
    ? {
        canMint: tokenData?.health?.notMint ? 'ok' : 'danger',
        blacklist: tokenData?.health?.noBlackListWhiteListFunction ? 'ok' : 'danger',
        burnt: tokenData?.health?.burnt ? 'ok' : 'danger',
        top10: tokenData?.health?.top10 ? (Number(tokenData.health.top10) * 100 < 20 ? 'ok' : 'danger') : 'danger',
      }
    : {
        honeypot: tokenData?.isHoneypot ? 'danger' : 'ok',
        renounced: tokenData?.mintDisable !== undefined ? (tokenData.mintDisable ? 'ok' : 'danger') : 'ok',
        openSource:
          tokenData?.health?.verifiedSourceCode !== undefined
            ? tokenData.health.verifiedSourceCode
              ? 'ok'
              : 'danger'
            : 'ok',
        liquidityLocked:
          tokenData?.liquidity !== undefined
            ? tokenData.liquidity && Number(tokenData.liquidity) > 0
              ? 'ok'
              : 'danger'
            : 'ok',
      }

  const riskCounts = Object.values(checkCriteria).reduce(
    (acc, status) => {
      if (status === 'ok') acc.lowRisk++
      else if (status === 'danger') acc.highRisk++
      else if (status === 'attention') acc.attention++
      return acc
    },
    { lowRisk: 0, highRisk: 0, attention: 0, total: 4 },
  )

  const lowRiskPercentage = (riskCounts.lowRisk / riskCounts.total) * 100

  const getRiskLevel = () => {
    if (lowRiskPercentage >= 80) return { level: 'lowRisk', text: t('contractMonitoring.lowRisk') }
    if (lowRiskPercentage > 20) return { level: 'mediumRisk', text: t('contractMonitoring.mediumRisk') }
    return { level: 'highRisk', text: t('contractMonitoring.highRisk') }
  }

  const riskLevel = getRiskLevel()

  const contractInformationList: ContractInformationProps[] = isSolana
    ? [
        {
          type: checkCriteria.canMint === 'ok' ? 'ok' : 'danger',
          title: t('contractMonitoring.noMintFunction'),
          content: t('contractMonitoring.noMintFunctionDesc'),
          className: 'mb-[24px] last:mb-0',
          icon: 'ic-add-money',
        },
        {
          type: checkCriteria.burnt === 'ok' ? 'ok' : 'danger',
          title: `${t('contractMonitoring.burnPool')} (${formatPercentage(burnRatio)})`,
          content: t('contractMonitoring.burnDesc'),
          className: 'mb-[24px] last:mb-0',
          icon: 'ic-burn',
        },
        {
          type: checkCriteria.blacklist === 'ok' ? 'ok' : 'danger',
          title: t('contractMonitoring.blacklist'),
          content: t('contractMonitoring.blacklistEnabledDesc'),
          className: 'mb-[24px] last:mb-0',
          icon: 'ic-devil',
        },
        {
          type: checkCriteria.top10 === 'ok' ? 'ok' : 'danger',
          title: `${t('contractMonitoring.top10')} (${tokenData?.health?.top10 != null ? formatPercentage(+tokenData.health.top10 * 100) : '0%'})`,
          content: t('contractMonitoring.whaleProtectionDesc'),
          className: 'mb-[24px] last:mb-0',
        },
      ]
    : [
        {
          type: checkCriteria.honeypot === 'ok' ? 'ok' : 'danger',
          title: t('contractMonitoring.honeypot'),
          content: t('contractMonitoring.honeypotDesc'),
          className: 'mb-[24px] last:mb-0',
        },
        {
          type: checkCriteria.renounced === 'ok' ? 'ok' : 'danger',
          title: t('contractMonitoring.ownershipRenounced'),
          content: t('contractMonitoring.ownershipRenouncedDesc'),
          className: 'mb-[24px] last:mb-0',
        },
        {
          type: checkCriteria.openSource === 'ok' ? 'ok' : 'danger',
          title: t('contractMonitoring.openSource'),
          content: t('contractMonitoring.openSourceDesc'),
          className: 'mb-[24px] last:mb-0',
        },
        {
          type: checkCriteria.liquidityLocked === 'ok' ? 'ok' : 'danger',
          title: t('contractMonitoring.liquidityLocked'),
          content: t('contractMonitoring.liquidityLockedDesc'),
          className: 'mb-[24px] last:mb-0',
        },
      ]

  const gaugeValue = lowRiskPercentage

  const formatAddress = (address?: string | null) => {
    if (!address) return '--'
    if (address.length <= 10) return address
    return `${address.slice(0, 5)}...${address.slice(-5)}`
  }

  return (
    <>
      {showTrigger && (
        <div className="flex items-center gap-[2px] cursor-pointer" onClick={() => setIsOpen(true)}>
          <img src="/images/tokenDetail/icon-meter-clock.svg" className="w-[16px] min-w-[16px]" alt="" />
          <div className="text-[calc(1rem*(11/16))] text-[#FFFFFF99] leading-[1] relative top-[-1px]">0.5%</div>
        </div>
      )}
      <AppDrawer
        isShowBgImg={false}
        open={isOpen}
        setOpen={(open) => setIsOpen(typeof open === 'function' ? open(isOpen) : open)}
        drawerHeaderClassName="pb-[12px]"
        title={t('contractMonitoring.title')}
        drawerContent={
          <div className="relative">
            {/* <div className="aspect-[375/317] absolute top-0 left-[-12px] right-[-12px] z-[-1] bg-[url(/images/tokenDetail/contract-monitoring-bg.svg)] bg-no-repeat bg-cover bg-top" /> */}
            <div className="pb-[12px]">
              <div className="flex items-center bg-[#2b2b33] rounded-[6px]">
                <img
                  src="/images/tokenDetail/icon-security.svg"
                  alt="icon security"
                  className="pointer-events-none min-w-[50px] min-h-[49px]"
                  loading="lazy"
                />
                <p className="text-[calc(1rem*(12/16))] text-white leading-[calc(18/12)] py-2">
                  {t('contractMonitoring.disclaimer')}
                </p>
              </div>

              <ContractMonitoringChart
                isOpen={isOpen}
                gaugeValue={100 - gaugeValue}
                riskText={riskLevel.text}
                contractInfo={contractInformationList}
                riskCounts={{
                  highRisk: riskCounts.highRisk,
                  attention: riskCounts.attention,
                  lowRisk: riskCounts.lowRisk,
                }}
                sellTax={`${tokenData?.security?.sellTax ? Number(tokenData?.security?.sellTax) : '0'}`}
                buyTax={`${tokenData?.security?.buyTax ? Number(tokenData?.security?.buyTax) : '0'}`}
                top10Percentage={tokenData?.health?.top10 ? formatPercentage(+tokenData.health.top10 * 100) : undefined}
              />

              {/* {tokenData?.security?.buyTax !== null && tokenData?.security?.sellTax !== null && (
                <div className="relative z-0 mt-[-5%] mb-[24px]">
                  <img src="/images/tokenDetail/contract-monitoring-buttons-bg.svg" className="w-full" alt="" />
                  <div className="flex items-center justify-center gap-[10px] px-[12px] absolute left-0 right-0 bottom-0 top-[19%]">
                    <Button className="rounded-full green-gradient w-[158.5px] h-[40px] p-[12px] app-font-medium text-[calc(1rem*(16/16))] text-white leading-[1] !cursor-default">
                      {t('contractMonitoring.buyTax')}{' '}
                      {tokenData?.security?.buyTax ? Number(tokenData?.security?.buyTax) : '0'}%
                    </Button>
                    <Button className="rounded-full red-gradient w-[158.5px] h-[40px] p-[12px] app-font-medium text-[calc(1rem*(16/16))] text-white leading-[1] !cursor-default">
                      {t('contractMonitoring.sellTax')}{' '}
                      {tokenData?.security?.sellTax ? Number(tokenData?.security?.sellTax) : '0'}%
                    </Button>
                  </div>
                </div>
              )} */}

              <div className="my-4.5">
                <div className="text-[calc(1rem*(15/16))] text-white leading-none font-[330] mb-[4px]">
                  {t('contractMonitoring.tokenInfo')}
                </div>
                <div className="py-[16px] flex items-center justify-between gap-[10px] border-b-[1px] border-b-[#ECECED14]">
                  <div className="text-[calc(1rem*(14/16))] text-[#908e98] font-[330] leading-none]">
                    {t('contractMonitoring.tokenSymbol')}
                  </div>
                  <div className="text-[calc(1rem*(14/16))] text-white font-[330] leading-none]">
                    {tokenData?.symbol || '--'}
                  </div>
                </div>
                <div className="py-[16px] flex items-center justify-between gap-[10px] border-b-[1px] border-b-[#ECECED14]">
                  <div className="text-[calc(1rem*(14/16))] text-[#908e98] font-[330] leading-none]">
                    {t('contractMonitoring.tokenName')}
                  </div>
                  <div className="text-[calc(1rem*(14/16))] text-white font-[330] leading-none]">
                    {tokenData?.name || '--'}
                  </div>
                </div>
                <div className="py-[16px] flex items-center justify-between gap-[10px] border-b-[1px] border-b-[#ECECED14]">
                  <div className="text-[calc(1rem*(14/16))] text-[#908e98] font-[330] leading-none]">
                    {t('contractMonitoring.contractAddress')}
                  </div>
                  <div className="text-[calc(1rem*(14/16))] text-white font-[330] leading-none] flex items-center gap-[4px]">
                    <div>{formatAddress(tokenData?.address)}</div>
                    <CopyBtn text={tokenData?.address ?? ''} />
                  </div>
                </div>
                <div className="py-[16px] flex items-center justify-between gap-[10px] border-b-[1px] border-b-[#ECECED14]">
                  <div className="text-[calc(1rem*(14/16))] text-[#908e98] font-[330] leading-none]">
                    {t('contractMonitoring.contractCreator')}
                  </div>
                  <div className="text-[calc(1rem*(14/16))] text-white font-[330] leading-none] flex items-center gap-[4px]">
                    <div>{formatAddress(tokenData?.contractCreator ?? tokenData?.creator ?? '--')}</div>
                    <CopyBtn text={tokenData?.contractCreator ?? tokenData?.creator ?? ''} />
                  </div>
                </div>
                <div className="py-[16px] flex items-center justify-between gap-[10px] border-b-[1px] border-b-[#ECECED14]">
                  <div className="text-[calc(1rem*(14/16))] text-[#908e98] font-[330] leading-none]">
                    {t('contractMonitoring.contractOwner')}
                  </div>
                  <div className="text-[calc(1rem*(14/16))] text-white font-[330] leading-none] flex items-center gap-[4px]">
                    <div>{formatAddress(tokenData?.contractOwner ?? tokenData?.creator ?? '--')}</div>
                    <CopyBtn text={tokenData?.contractOwner ?? tokenData?.creator ?? ''} />
                  </div>
                </div>
              </div>

              <div>
                <div className="text-[calc(1rem*(14/16))] text-white leading-none mb-[24px]">
                  {t('contractMonitoring.contractInfo')}
                </div>
                {contractInformationList.map((item, index) => (
                  <ContractInformation {...item} key={index} />
                ))}
              </div>
            </div>
          </div>
        }
      />
    </>
  )
}

export default ContractMonitoring
