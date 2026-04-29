import { CopyButton } from '@/components/common/copy-button'
import { IconEditParams } from '@/components/icon'
import { IconWarning } from '@/components/icon/stroke/IconWarning'
import { Button } from '@/components/ui/button'
import XTooltip from '@/components/ui/XTooltip'
import { APP_PATH } from '@/lib/constant'
import { futureClient } from '@/lib/gql/apollo-client'
import { cn } from '@/lib/utils'
import { _activeWallet } from '@/redux/modules/newWallet.slice'
import { aliasWallet } from '@/services/wallet.service'
import { ChainIds } from '@/types/enums.ts'
import { listCoinHelper } from '@/utils/list-coin-helper'
import { Dispatch, memo, SetStateAction, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { useActiveChainId, useActiveChainType } from '@/hooks/useActiveChain'
import { useResponsive } from '@/hooks/useResponsive'

type AliasCardProps = {
  name: string
  address: string
  //priproty to show name or address. default show name
  type?: 'address' | 'name'
  classNameAlias?: string
  classNameWrapper?: string
  classNameInput?: string
  useCopyButton?: boolean
  useEditNameButton?: boolean
  renderTX24H?: React.ReactNode
  defaultAbleToEditName?: boolean
  linkDetail?: string
  unLinkDetail?: boolean
  onChangeName?: (name: string) => void
  isLowLiquidity?: boolean

  setEditNameState?: Dispatch<
    SetStateAction<
      | {
          status: boolean
          id: string
        }
      | undefined
    >
  >
  disabled?: boolean
  walletName?: string
  twitterName?: string
  onChangeNameSuccess?: (newName: string) => void
}

const AliasCard = memo((props: AliasCardProps) => {
  const {
    name,
    address,
    type = 'name',
    classNameAlias = '',
    classNameWrapper = '',
    classNameInput = '',
    useCopyButton = false,
    useEditNameButton = true,
    onChangeName,
    renderTX24H,
    setEditNameState,
    defaultAbleToEditName,
    disabled = false,
    isLowLiquidity = false,
    linkDetail,
    unLinkDetail = false,
    walletName,
    twitterName,
    onChangeNameSuccess,
  } = props
  const { isDesktop } = useResponsive()
  const activeChainType = useActiveChainType()
  /**
   * prority to show name or address. default show name
   * alas - name - address
   */

  const activeChainId = useActiveChainId()
  const refInput = useRef<HTMLInputElement>(null)
  const [editName, setEditName] = useState<string>(name)
  const [currentName, setCurrentName] = useState(name)
  const [currentType, setCurrentType] = useState<'address' | 'name'>(type)
  const [ableToEditName, setAbleToEditName] = useState(defaultAbleToEditName ? defaultAbleToEditName : false)
  const activeWallet = useSelector(_activeWallet)
  const { t } = useTranslation()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setEditName(name)
  }, [name])

  useEffect(() => {
    setAbleToEditName(!!defaultAbleToEditName)
  }, [defaultAbleToEditName])

  useEffect(() => {
    const displayName = name || walletName || twitterName
    if (displayName) {
      setCurrentType('name')
      setCurrentName(displayName)
    } else {
      setCurrentType('address')
      setCurrentName(address)
    }
  }, [name, walletName, twitterName])

  const handleSetEditNameState = ({ id, status }: { status: boolean; id: string }) => {
    setEditNameState?.({
      id,
      status,
    })
  }

  const handleEditName = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation() // Stop event bubbling
    e.preventDefault() // Prevent default action (for extra safety)
    setAbleToEditName(true)
    // handleSetEditNameState({ id: address, status: true })

    //focus and select all text in input
    setTimeout(() => {
      refInput.current?.focus()
      refInput.current?.select()
    }, 100)
  }

  const handleSaveName = () => {
    setAbleToEditName(false)
    handleSetEditNameState({ id: address, status: false })
    if (editName === name) {
      return
    }
    const displayName = editName.trim() || walletName || twitterName || address
    const isAddressType = !editName.trim() && !walletName && !twitterName

    setCurrentType(isAddressType ? 'address' : 'name')
    setCurrentName(displayName)

    if (isLoading) {
      return
    }
    if (typeof onChangeName === 'function') {
      onChangeName?.(editName.trim())
    } else {
      setIsLoading(true)
      //default change name address
      futureClient
        .mutate({
          mutation: aliasWallet,
          variables: {
            req: {
              chainId: activeChainId ?? ChainIds.Solana,
              address,
              alias: editName.trim(),
            },
          },
        })
        .then(() => {
          onChangeNameSuccess?.(editName.trim())
        })

        .catch(() => {
          //error
          setEditName(currentName)
        })
        .finally(() => {
          //blur input
          refInput.current?.blur()
          setIsLoading(false)
        })
    }
  }

  const handleOnChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation() // Stop event bubbling
    e.preventDefault() // Prevent default action (for extra safety)
    setEditName(e.target.value)
  }

  const handleOnKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSaveName()
    }
    if (e.key === 'Escape') {
      setAbleToEditName(false)
      handleSetEditNameState({ id: address, status: false })
    }
  }

  return (
    <div className={cn('alias-card alias-card-wrapper flex items-center', classNameWrapper)}>
      <span
        className={cn('inline-block font-medium text-[14px] leading-[14px] whitespace-nowrap truncate', classNameAlias)}
      >
        {ableToEditName ? (
          <input
            className={cn(
              'border rounded-md p-1 border-[transparent] w-[95px] focus:border-gray-300 h-[25px] box-border',
              classNameInput,
            )}
            ref={refInput}
            type="text"
            value={editName}
            onChange={handleOnChangeName}
            onBlur={handleSaveName}
            maxLength={15}
            onPointerDown={(e) => {
              e.stopPropagation()
            }}
            onClick={(e) => {
              e.stopPropagation()
            }}
            onKeyDown={handleOnKeyDown}
          />
        ) : unLinkDetail ? (
          <span className="hover:opacity-60 transition-opacity duration-200">
            {currentType === 'address'
              ? listCoinHelper.formatWalletName(currentName || '', 10)
              : listCoinHelper.formatWalletNameWithEllipsis(currentName || '')}
          </span>
        ) : (
          <Link
            to={linkDetail ? linkDetail : `${APP_PATH.MEME_WALLET}/${address}`}
            className="hover:opacity-60 transition-opacity duration-200"
            target={isDesktop ? '_blank' : '_self'}
            onClick={(e) => {
              e.stopPropagation()
            }}
          >
            {currentType === 'address'
              ? listCoinHelper.formatWalletName(currentName || '', 10)
              : listCoinHelper.formatWalletNameWithEllipsis(currentName || '')}
          </Link>
        )}
      </span>
      {renderTX24H}
      {useEditNameButton && !ableToEditName && activeWallet?.isConnected && !disabled ? (
        <Button
          variant="default"
          className="flex items-center bg-[transparent] p-0 h-auto"
          onClick={handleEditName}
          disabled={disabled}
        >
          <IconEditParams className="!size-[16px] -mb-1" />
        </Button>
      ) : null}
      {useCopyButton && <CopyButton text={address} icon="/images/icons/ic-copy2.svg" containerClassName={cn('')} />}
      {isLowLiquidity && (
        <XTooltip.Details title={<IconWarning className="size-4 ml-2" />}>
          <span>{t('assets.overview.lowLiquidityTargetTokenWarning', { token: String(name).trim() })}</span>
        </XTooltip.Details>
      )}
    </div>
  )
})

AliasCard.displayName = 'AliasCard'

export default AliasCard
