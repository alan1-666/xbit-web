import SelectNetworkPopup from '@/components/assets/overview/SelectNetworkPopup'
import SelectTokenPopup from '@/components/assets/overview/SelectTokenPopup'
import { APP_PATH } from '@/lib/constant.ts'
import { useAppSelector } from '@/redux/store'
import { ChainIds } from '@/types/enums'
import PriceImpactNote from '@components/assets/overview/PriceImpactNote.tsx'
import { CopyButton } from '@components/common/copy-button.tsx'
import { QRCodeCanvas } from 'qrcode.react'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Button } from '@components/ui/button.tsx'
import { IconInfo2, LeftIcon } from '@components/icon'
import { _walletDex } from '@/redux/modules/newWallet.slice'
import PrefetchPerpsDepositAddress from '@pages/assets/overview/components/PrefetchPerpsDepositAddress.tsx'
import { _activeWallet } from '@/redux/modules/newWallet.slice'
import { Loading } from '@components/common/Loading.tsx'
import { PERPS_TUTORIAL_URL_ZH, PERPS_TUTORIAL_URL, PERPS_BRIDGE_URL } from '@pages/assets/overview/constants'


const PerpsDeposit = () => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const tokensChains = useAppSelector((state) => state.tokensChains)
  const EVMAddress = useSelector(_walletDex)?.walletAddress
  const perpsDepositAddresses = useAppSelector((state) => state.exchange.perpsDepositAddresses)
  const perpsDepositLoading = useAppSelector((state) => state.exchange.perpsDepositLoading)
  const MIN_DEPOSIT_AMOUNT = 3 // 3 USDC
  const activeWallet = useSelector(_activeWallet)
  const tutorialUrl = i18n.language === 'zh' || i18n.language === 'hk' ? PERPS_TUTORIAL_URL_ZH : PERPS_TUTORIAL_URL
  

  const supportedTokens = useMemo(() => {
    if (tokensChains?.tokens && tokensChains.tokens.length > 0) {
      return tokensChains.tokens.filter((token: any) => token.symbol !== 'BNB') // Exclude BNB token for now
    }
    return []
  }, [tokensChains?.tokens])

  const [openSelectToken, setOpenSelectToken] = useState(false)
  const [openSelectNetwork, setOpenSelectNetwork] = useState(false)
  const [tokenSelected, setTokenSelected] = useState<string>('')
  const [networkSelected, setNetworkSelected] = useState<number>(0)

  // Get selected token object
  const selectedToken = useMemo(() => {
    if (tokenSelected && supportedTokens.length > 0) {
      return supportedTokens.find((token: any) => token.symbol === tokenSelected)
    }
    return null
  }, [tokenSelected, supportedTokens])

  // supportedNetworks is chainList of the selected token
  const supportedNetworks = useMemo(() => {
    if (selectedToken?.chainList && selectedToken.chainList.length > 0) {
      return selectedToken.chainList.map((network: any) => ({
        ...network,
        chainName: +network.chainId === ChainIds.Bsc ? 'BNB Chain' : network.chainName,
      }))
    }
    return []
  }, [selectedToken])

  // Update tokenSelected when supportedTokens changes
  useEffect(() => {
    if (supportedTokens.length > 0) {
      const isTokenValid = supportedTokens.some((token: any) => token.symbol === tokenSelected)
      if (!tokenSelected || !isTokenValid) {
        const lang = i18n.language
        if (lang === 'zh' || lang === 'hk') {
          const usdtToken = supportedTokens.find((token: any) => token.symbol === 'USDT')
          setTokenSelected(usdtToken ? usdtToken.symbol : supportedTokens[0].symbol)
        } else {
          const usdcToken = supportedTokens.find((token: any) => token.symbol === 'USDC')
          setTokenSelected(usdcToken ? usdcToken.symbol : supportedTokens[0].symbol)
        }
      }
    }
  }, [supportedTokens, tokenSelected])

  // Update networkSelected when supportedNetworks changes (when tokenSelected changes)
  useEffect(() => {
    if (supportedNetworks.length > 0) {
      const isNetworkValid = supportedNetworks.some((network: any) => network.chainId === networkSelected)
      // Reset network selection if current selection is invalid or when networks change
      if (networkSelected === 0 || !isNetworkValid) {
        // If token is USDC, try to select chain 42161 (Arbitrum) first
        if (tokenSelected === 'USDC') {
          const arbitrumChain = supportedNetworks.find((network: any) => network.chainId == 42161)
          if (arbitrumChain) {
            setNetworkSelected(42161)
          } else {
            setNetworkSelected(supportedNetworks[0].chainId)
          }
        } else if (tokenSelected === 'USDT') {
          // If token is USDT, try to select chain 728126428 (Tron) first
          const tronChain = supportedNetworks.find((network: any) => network.chainId == 728126428)
          const ethereumChain = supportedNetworks.find((network: any) => network.chainId == 1)
          const lang = i18n.language
          if (tronChain && (lang === 'zh' || lang === 'hk')) {
            setNetworkSelected(728126428)
          } else if (ethereumChain) {
            setNetworkSelected(1)
          } else {
            setNetworkSelected(supportedNetworks[0].chainId)
          }
        } else {
          setNetworkSelected(supportedNetworks[0].chainId)
        }
      }
    } else {
      // Reset networkSelected if no networks available
      setNetworkSelected(0)
    }
  }, [supportedNetworks, networkSelected, tokenSelected])

  const tokenSelectedObj = useMemo(() => {
    return supportedTokens.find((token: any) => token.symbol === tokenSelected)
  }, [tokenSelected, supportedTokens])

  const networkSelectedObj = useMemo(() => {
    return tokenSelectedObj?.chainList?.find((network: any) => network.chainId == networkSelected)
  }, [networkSelected, tokenSelectedObj])

  const depositAddress = useMemo(() => {
    const vmType = networkSelectedObj?.vmType
    switch (vmType) {
      case 'svm':
        return perpsDepositAddresses?.depositSolAddress
      case 'bvm':
        return perpsDepositAddresses?.depositBtcAddress
      case 'hypevm':
        return perpsDepositAddresses?.depositAddress
      case 'tvm':
        return perpsDepositAddresses?.depositTvmAddress
      case 'evm':
        return perpsDepositAddresses?.depositAddress
      default:
        return perpsDepositAddresses?.depositAddress
    }
  }, [networkSelectedObj, perpsDepositAddresses])

  const onClickBack = () => {
    let previousPath = APP_PATH.ASSETS
    if (location.state?.from) {
      const from = (location.state as any).from
      previousPath += `/${from}`
    }
    navigate(previousPath)
  }

  return (
    <>
      {activeWallet.isConnected && <PrefetchPerpsDepositAddress />}
      {perpsDepositLoading && 
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-[#0A0A0A] z-10">
          <Loading />
        </div>
      }
      {!perpsDepositLoading && <div className="flex h-screen max-h-screen flex-col overflow-hidden bg-[#0A0A0A] pt-16 text-white">
        <div className="fixed top-0 left-0 z-10 flex w-full items-center justify-between bg-[#0A0A0A]">
          <div className="mx-auto flex w-full max-w-3xl items-center justify-between p-4">
            <div className="w-24">
              <img
                src="/images/icons/arrow-left.svg"
                className="h-6 w-6 cursor-pointer"
                alt="arrow-left"
                onClick={onClickBack}
              />
            </div>
            <div className="flex cursor-pointer items-center gap-1">
              <div className="text-[calc(18rem/16)] leading-6 font-medium">{t('exchange.perpsDeposit')}</div>
            </div>
            <div className="flex w-24 items-center justify-end">
              {/* <img
                src="/images/icons/fundsRecords.svg"
                className="w-4 h-4 cursor-pointer"
                alt="fundsRecords"
                onClick={() => {
                  navigate(APP_PATH.ASSETS + `?page=overview?tab=funds`)
                }}
              /> */}
            </div>
          </div>
        </div>
        <div className="p-4">
          {depositAddress ? (
            <>
              <div className="text-xs font-medium text-[#908E98]">{t('exchange.selectTokenNetwork')}</div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <SelectTokenPopup
                  open={openSelectToken}
                  setOpen={setOpenSelectToken}
                  tokens={supportedTokens}
                  tokenSelected={tokenSelected}
                  onTokenSelected={(token) => setTokenSelected(token)}
                />
                <SelectNetworkPopup
                  networks={supportedNetworks}
                  open={openSelectNetwork}
                  setOpen={setOpenSelectNetwork}
                  networkSelected={networkSelected}
                  onNetworkSelected={(network) => setNetworkSelected(network)}
                />
              </div>

              <div className="mt-6 text-xs font-medium text-[#908E98]">{t('exchange.yourDepositAddress')}</div>
              <div className="mt-3 flex items-center justify-between rounded-[10px] bg-[#18181D] px-4 py-3.5">
                <div className="text-base leading-6 break-all text-white">{depositAddress}</div>
                <CopyButton text={depositAddress} />
              </div>
              <div className="mt-3 text-[12px] leading-4 font-light text-[#71717A]">
                {t('exchange.minPerpsDeposit', {
                  value: MIN_DEPOSIT_AMOUNT,
                })}
              </div>
              <div className="mt-6 flex justify-center">
                <div className="relative inline-block rounded-[23px] bg-white p-4">
                  <QRCodeCanvas
                    value={depositAddress || ''}
                    size={142}
                    level="H"
                    marginSize={0}
                    // imageSettings={{
                    //   src: networkSelectedObj?.chainImage,
                    //   height: 30,
                    //   width: 30,
                    //   excavate: true,
                    // }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <img
                      src={networkSelectedObj?.chainImage || ''}
                      alt="logo"
                      className="border-[3px] size-9 rounded-xl border-white bg-[#202024] object-contain p-1"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 text-[12px] leading-5 font-light text-[#52526E]">{t('exchange.perpsDepositNote')}</div>
              <div className="mt-4 flex items-center justify-between rounded-[10px] bg-[#18181D] px-4 py-2">
                <div className="flex items-center gap-1 text-sm leading-4 text-[#908E98]">
                  {t('exchange.priceImpact')} <PriceImpactNote />
                </div>
                <div className="text-sm leading-4 text-white">~0.25%</div>
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <div className="text-[#908E98] text-[14px]">XBIT {t('exchange.perpsAddress')}</div>
              <div className="bg-[#2B2B33] rounded-[8px] p-2">
                <div className="flex items-center gap-2 justify-between text-[#FBFBFB] text-[12px]">
                  <div>{EVMAddress}</div>
                  <CopyButton text={EVMAddress} className="cursor-pointer size-4" />
                </div>
              </div>
              <div className="mt-5.5 text-[#D97706] bg-[#D977061A] border border-[#D97706] rounded-lg px-4 py-3">
                <div className="flex items-start gap-3">
                  <IconInfo2 className="w-4 h-4 min-h-4 min-w-4" />
                  <div>
                    <div className="text-[16px] font-medium leading-none">{t('exchange.perpsDepositBeingUpgrade')}</div>
                    <div className="mt-2 text-[14px] leading-[1.3]">{t('exchange.perpsDepositBeingUpgradeDesc')}</div>
                  </div>
                </div>
              </div>
              <div className="mt-5.5 flex items-center justify-between gap-3">
                <Button
                  variant="outline"
                  className="rounded-lg text-white w-[calc(50%-6px)] justify-center border-[#843BEA]"
                  onClick={() => window.open(tutorialUrl)}
                >
                  {t('exchange.perpsDepositViewTutorial')} <LeftIcon className="size-4 inline-block" />
                </Button>
                <Button
                  variant="gradient"
                  className="rounded-lg text-white w-[calc(50%-6px)] justify-center"
                  onClick={() => window.open(PERPS_BRIDGE_URL)}
                >
                  {t('exchange.perpsDepositNow')} <LeftIcon className="size-4 inline-block" />
                </Button>
              </div>
            </div> 
          )}
        </div>
      </div>}
    </>
  )
}

export default PerpsDeposit
