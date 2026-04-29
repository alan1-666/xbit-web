import { ConfigStatus } from '@/@generated/gql/graphql-trading'
import { APP_PATH } from '@/lib/constant'
import { tradingClient } from '@/lib/gql/apollo-client'
import { cn } from '@/lib/utils.ts'
import { updateCopyTradeConfig, updateCopyTradeConfigStatus } from '@/services/copytrade.service'
import { listCoinHelper } from '@/utils/list-coin-helper'
import { useMutation } from '@apollo/client'
import { IconChevronRight, IconEditParams, IconPause, IconPlay } from '@components/icon'
import { Button } from '@components/ui/button.tsx'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import ChainCurrencyIcon from '../common/ChainCurrencyIcon'
import { CopyButton } from '../common/copy-button'
import IconBtn from '../common/IconBtn'
import AliasCard from '../listCoin/card/AliasCard'
import DrawerCopyTrade from '../listCoin/drawer/DrawerCopyTrade'
import { WalletCopyTradeStatus } from '../listCoin/WalletCopyTrade'
import DeleteCopyButton from './DeleteCopyButton'
import ModifyWalletName from './ModifyWalletName'
import { loadFirstPageFromStorage, saveFirstPageToStorage } from '@/utils/storage'
import { useFeatureIsOn } from '@growthbook/growthbook-react'
import RestrictRegiongDialog from '../RestrictRegiongDialog'

import { getStatusColor } from '@/utils/copy-trade-helper'

type IProps = {
  tradeConfig: Record<string, any>
  address?: string
  isDisabledDelete?: boolean
  isPC?: boolean
}

export default function Information(props: IProps) {
  const { tradeConfig, address = '', isDisabledDelete = false, isPC = false } = props
  const { status = 'Active', leaderNickname, leaderAddress } = tradeConfig
  const enabled = useFeatureIsOn('trading_block_zone')
  const [openRestrictRegiongDialog, setOpenRestrictRegiongDialog] = useState(false)
  const [open, setOpen] = useState(false)
  const walletCopyTradeRef = useRef<(() => void) | null>(null)
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [openEditTokenName, setOpenEditTokenName] = useState(false)
  const [currentStatus, setcurrentStatus] = useState<ConfigStatus>(status)
  useEffect(() => {
    setcurrentStatus(status)
  }, [status])
  const [displayWalletName, setDisplayWalletName] = useState<string>(leaderNickname || leaderAddress)
  const [mutate] = useMutation(updateCopyTradeConfig, {
    client: tradingClient,
  })

  const onEditParamsSetting = () => {
    if (isPC) {
      setOpen(true)
    } else {
      navigate(APP_PATH.COPY_TRADING_WALLET_SETTINGS + `/${address}`)
    }
  }

  function getStatus(status: ConfigStatus | 'restart') {
    switch (status) {
      case ConfigStatus.Active:
        // return t('listCoin.copyTrade.copyTradeRestart')
        return t('walletCopy.running')
      case ConfigStatus.Paused:
        return t('walletCopy.paused')
      case ConfigStatus.Canceled:
        return t('walletCopy.canceled')
      case 'restart':
        return t('listCoin.copyTrade.copyTradeRestart')
      default:
        return null
    }
  }

  function ButtonLabel(status: ConfigStatus) {
    switch (status) {
      case ConfigStatus.Active:
        return t('listCoin.copyTrade.copyTradePaused')
      case ConfigStatus.Canceled:
        return t('listCoin.copyTrade.copyTradeRestart')
      case ConfigStatus.Paused:
        return t('listCoin.copyTrade.copyTradeRestart')
      default:
        return
    }
  }

  function getStatusIcon(status: ConfigStatus) {
    switch (status) {
      case ConfigStatus.Active:
        return <IconPause className="!size-3" />
      case ConfigStatus.Canceled:
        return <IconPlay className="!size-3" />
      case ConfigStatus.Paused:
        return <IconPlay className="!size-3" />
      default:
        return
    }
  }

  const toggle = async () => {
    if (enabled && currentStatus !== ConfigStatus.Active) {
      setOpenRestrictRegiongDialog(true)
    } else {
      try {
        await tradingClient.mutate({
          mutation: updateCopyTradeConfigStatus,
          variables: {
            input: {
              id: address || '',
              status: currentStatus === ConfigStatus.Active ? ConfigStatus.Paused : ConfigStatus.Active,
            },
          },
        })
        toast.success(
          `${getStatus(currentStatus === ConfigStatus.Active ? ConfigStatus.Paused : 'restart')} ${t('walletCopy.success')}`,
        )
        setcurrentStatus(currentStatus === ConfigStatus.Active ? ConfigStatus.Paused : ConfigStatus.Active)
      } catch (error) {
        toast.error(t('walletCopy.errorUpdatingStatus'))
      }
    }
  }

  const handleOnChangeName = async (name: string) => {
    try {
      const response = await mutate({
        variables: {
          input: {
            id: address || '',
            leaderNickname: name,
          },
        },
      })
      toast.success(t('walletCopy.toast.modifyNameSuccess'))
      setDisplayWalletName(name || leaderAddress)
      return response.data
    } catch (err) {
      toast.error(t('walletCopy.toast.modifyNameError'))
      throw err
    }
  }

  const handleOnSuccessDelete = () => {
    //update status to store
    const _walletCopyTrade = loadFirstPageFromStorage('smartMoneyList.walletCopyTrade')
    const _walletCopyTradeUpdated = _walletCopyTrade.map((item: any) => {
      if (item.id === address) {
        return { ...item, status: ConfigStatus.Canceled }
      }
      return item
    })
    saveFirstPageToStorage('smartMoneyList.walletCopyTrade', _walletCopyTradeUpdated)
  }

  return (
    <div className="flex items-top pt-4 pb-3">
      <ChainCurrencyIcon
        currencyIcon={''}
        avatarClassName={cn(
          'flex items-center justify-center rounded-[12px] mt-0',
          isPC ? 'w-[48px] h-[48px]' : 'w-[44px] h-[44px]',
        )}
        avatarImageClassName="w-full h-full"
        fallbackImageEnable
        fallbackNFT={leaderAddress}
      />
      {isPC ? (
        <div className="flex-1 ml-2 5">
          <div className="flex items-center">
            <AliasCard
              address={leaderAddress}
              name={leaderNickname}
              classNameWrapper="flex items-center h-[28px]"
              classNameInput="h-[28px] w-[252px] focus:border-[#3E2761] bg-[#1F1E25]"
              classNameAlias={'text-[18px]'}
              onChangeName={handleOnChangeName}
            />
            <WalletCopyTradeStatus status={status} useDot className="text-[14px]" />
          </div>
          <div className="flex items-center px-1 my-[4px]">
            <span className="text-[14px] text-white/50 leading-[20px]">{leaderAddress}</span>
            <CopyButton
              className="w-4 h-4 cursor-pointer hover:scale-[1.1] ml-[4px]"
              text={leaderAddress}
              icon={'/images/icons/icon-copy.svg'}
            />
          </div>
        </div>
      ) : (
        <div className="flex-1 ml-2.5">
          <div className="text-[calc(13rem/16)] app-font-medium leading-[calc(13rem/16)] text-white flex items-center gap-1 mt-0">
            <span>
              {displayWalletName.length <= 15
                ? displayWalletName
                : listCoinHelper.formatWalletNameWithEllipsis(leaderNickname) ||
                  listCoinHelper.formatWalletNameCustom(displayWalletName)}
            </span>
            {/* <IconChevronRight className="size-3 text-[#B9B9B9]" /> */}
            <IconBtn
              icon={<IconChevronRight className="size-3 text-[#B9B9B9]" />}
              onClick={() => navigate(`${APP_PATH.MEME_WALLET}/${leaderAddress}`)}
              className="size-[14px] flex ml-[6px] hover:bg-none"
            />
          </div>
          <div className="flex gap-2 mt-1.5 items-center">
            <ModifyWalletName
              walletName={leaderNickname}
              walletAddress={leaderAddress}
              open={openEditTokenName}
              toggle={() => setOpenEditTokenName(!openEditTokenName)}
              onChangeName={handleOnChangeName}
            />
            <CopyButton
              icon="/images/tokenDetail/icon-copy.webp"
              className="w-[12px] min-w-[12px] h-[12px]"
              text={leaderAddress}
            />
            <div className={cn('flex gap-1 text-[12px] text-white/80', getStatusColor(currentStatus))}>
              {getStatus(currentStatus)}
            </div>
            {/* <div className="flex items-center gap-1 ml-1">
            <div className="flex gap-[calc(1rem*(4/16))] mt-[1px]">
              <WalletTypeBadge type={leaderTags} className='w-[12px] h-[12px]' />
            </div>
            <img src="/images/icons/pump-icon.svg" className="w-[14px] h-[14px]" alt="" />
          </div> */}
          </div>
        </div>
      )}
      {currentStatus === ConfigStatus.Canceled ? null : (
        <div className="flex pt-1">
          <Button
            variant="secondary"
            className={cn(
              'flex items-center gap-1 bg-[#232329] text-[#FFFFFFB2] px-[10px] rounded-full mr-[6px]',
              isPC ? 'h-[32px] text-[14px]' : 'h-[28px] text-[11px] pl-1.5 pr-2',
              isDisabledDelete && 'opacity-50',
            )}
            onClick={toggle}
            disabled={isDisabledDelete}
          >
            {getStatusIcon(currentStatus)}
            <span className="flex-1">{ButtonLabel(currentStatus)}</span>
          </Button>
          {/* <Button
              variant="secondary"
              className={cn("flex items-center gap-1 bg-[#232329] text-[#FFFFFFB2] px-[10px] rounded-full min-w-[80px] mr-[6px]", isPC ? 'h-[32px] text-[14px]' : 'h-[28px] text-[11px]', isDisabledDelete && 'opacity-50')}
              onClick={toggle}
              disabled={isDisabledDelete}
            >
              {getStatusIcon(currentStatus)}
              <span className="flex-1">{ButtonLabel(currentStatus)}</span>
            </Button> */}
          {isPC && (
            <DeleteCopyButton
              id={address || ''}
              adr={leaderAddress}
              onSuccess={handleOnSuccessDelete}
              isPC
              isDisabled={isDisabledDelete}
            />
          )}
          <Button
            variant="default"
            className={cn(
              'flex items-center gap-1 bg-[#232329] text-[#FFFFFFB2] rounded-full px-[10px] leading-[14px]',
              isPC ? 'h-[32px] text-[14px]' : 'h-[28px] text-[11px]',
              isDisabledDelete && 'opacity-50',
            )}
            onClick={onEditParamsSetting}
            disabled={isDisabledDelete}
          >
            <IconEditParams className="!size-3" />
            <span className="block flex-1">{t('listCoin.copyTrade.copyTradeEditParams')}</span>
          </Button>
        </div>
      )}
      {isPC ? (
        <DrawerCopyTrade
          open={open}
          setOpen={setOpen}
          currentId={address}
          onSuccess={() => {
            // Trigger reload of WalletCopyTrade when copy trade is created
            if (walletCopyTradeRef.current) {
              walletCopyTradeRef.current()
            }
          }}
        />
      ) : null}
      <RestrictRegiongDialog open={openRestrictRegiongDialog} setOpen={setOpenRestrictRegiongDialog} />
    </div>
  )
}
