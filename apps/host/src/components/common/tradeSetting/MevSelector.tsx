import { MevProtectionType, TransactionType } from '@/@generated/gql/graphql-trading'
import { IconShield } from '@/components/icon/stroke/IconShield'
import IconShield2 from '@/components/icon/stroke/IconShield2'
import { IconShield3 } from '@/components/icon/stroke/IconShield3'
import { TYPE_CHAIN } from '@/lib/blockchain'
import { cn } from '@/lib/utils'
import { TradeSetting, updateTradeSettings } from '@/redux/modules/tradeSettings.slice'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

const MevSelector = ({
  isForm = false,
  presetSelected,
  sideSelected,
  tradeSettingsByChain,
  setTradeSettingsByChain,
}: {
  isForm?: boolean
  presetSelected: TradeSetting
  sideSelected: TransactionType
  tradeSettingsByChain: TradeSetting[]
  setTradeSettingsByChain: Dispatch<SetStateAction<TradeSetting[]>>
}) => {
  const { t } = useTranslation()
  const [mevProtectionType, setMevProtectionType] = useState<MevProtectionType | undefined>(MevProtectionType.Normal)
  const [mevProtect, setMevProtect] = useState<boolean | undefined>(false)

  useEffect(() => {
    if (presetSelected && sideSelected) {
      setMevProtectionType(presetSelected?.[sideSelected]?.mevProtectionType)
      setMevProtect(presetSelected?.[sideSelected]?.mevProtect)
    }
  }, [presetSelected, sideSelected])

  const dispatch = useAppDispatch()
  const activeChain = useAppSelector((state) => state.newWallet.activeChain)

  const handleChangeMevProtectType = useCallback(
    (value: MevProtectionType) => {
      const updatedSettings = tradeSettingsByChain.map((item) => {
        if (item.key === presetSelected.key) {
          return {
            ...item,
            [sideSelected]: {
              ...item[sideSelected],
              mevProtectionType: value,
            },
          }
        }
        return item
      })
      setMevProtectionType(value)
      setTradeSettingsByChain(updatedSettings)
      if (isForm) {
        dispatch(
          updateTradeSettings({
            chain: activeChain,
            settings: updatedSettings,
          }),
        )
      }
    },
    [isForm, tradeSettingsByChain, presetSelected.key, sideSelected, activeChain, dispatch],
  )

  const handleChangeMevProtect = useCallback(
    (value: boolean) => {
      const updatedSettings = tradeSettingsByChain.map((item) => {
        if (item.key === presetSelected.key) {
          return {
            ...item,
            [sideSelected]: {
              ...item[sideSelected],
              mevProtect: value,
            },
          }
        }
        return item
      })
      setMevProtect(value)
      setTradeSettingsByChain(updatedSettings)
      if (isForm) {
        dispatch(
          updateTradeSettings({
            chain: activeChain,
            settings: updatedSettings,
          }),
        )
      }
    },
    [isForm, tradeSettingsByChain, presetSelected.key, sideSelected, activeChain, dispatch],
  )

  if (isForm) {
    if (activeChain === TYPE_CHAIN.BSC || activeChain === TYPE_CHAIN.MON)
      return (
        <div className="flex items-center mt-2.5 gap-1">
          <p className="font-[400] text-[12px] text-[#605e68] w-24">{t('tradeSettings.Mev')}</p>
          <div
            className={`flex items-center w-11 h-[24px] px-[3px] rounded-full cursor-pointer ${
              mevProtect ? 'justify-end bg-[#843BEA]' : 'justify-start bg-[#ECECED1F]'
            }`}
            onClick={() => handleChangeMevProtect(!mevProtect)}
          >
            <div className=" w-[18px] h-[18px] bg-white rounded-full transition-all duration-500 ease-in-out"></div>
          </div>
        </div>
      )
    return (
      <div className="flex items-center mt-2.5 gap-1">
        <p className="font-[400] text-[12px] text-[#605e68] w-24">{t('tradeSettings.Mev')}</p>
        <div className="p-0.5 border-[1px] border-[#1f1e25] flex-1 flex items-center bg-[#18181b] rounded-[6px]">
          <div
            className={cn(
              'group flex items-center justify-center gap-0.5 flex-1 cursor-pointer h-[26px] rounded-[6px]',
              {
                'bg-[#302e38]': mevProtectionType === MevProtectionType.Off,
              },
            )}
            onClick={() => handleChangeMevProtectType(MevProtectionType.Off)}
          >
            <IconShield2
              className={cn('w-3 h-3 text-[#878787]', 'group-hover:text-[#ffffff]', {
                //   'text-[#ffffff]': true,
                'text-[#ffffff]': mevProtectionType === MevProtectionType.Off,
              })}
            />
            <p
              className={cn('text-[12px] leading-none text-[#605e68]', 'group-hover:text-[#ffffff]', {
                'text-[#ffffff]': mevProtectionType === MevProtectionType.Off,
              })}
            >
              {t('tradeSettings.MevClose')}
            </p>
          </div>
          <div
            className={cn(
              'group flex items-center justify-center gap-0.5 flex-1 cursor-pointer h-[26px] rounded-[6px]',
              {
                'bg-[#302e38]': mevProtectionType === MevProtectionType.Normal,
              },
            )}
            onClick={() => handleChangeMevProtectType(MevProtectionType.Normal)}
          >
            <IconShield
              className={cn('w-3 h-3 text-[#878787]', 'group-hover:text-[#ffffff]', {
                'text-[#ffffff]': mevProtectionType === MevProtectionType.Normal,
              })}
            />
            <p
              className={cn('text-[12px] leading-none text-[#605e68]', 'group-hover:text-[#ffffff]', {
                'text-[#ffffff]': mevProtectionType === MevProtectionType.Normal,
              })}
            >
              {t('tradeSettings.MevStandard')}
            </p>
          </div>
          <div
            className={cn(
              'group flex items-center justify-center gap-0.5 flex-1 cursor-pointer h-[26px] rounded-[6px]',
              {
                'bg-[#302e38]': mevProtectionType === MevProtectionType.Secure,
              },
            )}
            onClick={() => handleChangeMevProtectType(MevProtectionType.Secure)}
          >
            <IconShield3
              className={cn('w-3 h-3 text-[#878787]', 'group-hover:text-[#ffffff]', {
                'text-[#ffffff]': mevProtectionType === MevProtectionType.Secure,
              })}
            />
            <p
              className={cn('text-[12px] leading-none text-[#605e68]', 'group-hover:text-[#ffffff]', {
                'text-[#ffffff]': mevProtectionType === MevProtectionType.Secure,
              })}
            >
              {t('tradeSettings.MevSecure')}
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (activeChain === TYPE_CHAIN.BSC || activeChain === TYPE_CHAIN.MON)
    return (
      <div className="flex items-center mt-4 gap-2.5">
        <p className="text-[15px] font-[400] w-27 text-center">{t('tradeSettings.Mev')}</p>
        <div
          className={`flex items-center w-11 h-[24px] px-[3px] rounded-full cursor-pointer ${
            mevProtect ? 'justify-end bg-[#843BEA]' : 'justify-start bg-[#ECECED1F]'
          }`}
          onClick={() => handleChangeMevProtect(!mevProtect)}
        >
          <div className=" w-[18px] h-[18px] bg-white rounded-full transition-all duration-500 ease-in-out"></div>
        </div>
      </div>
    )

  return (
    <div className="flex items-center mt-4 gap-2.5">
      <p className="text-[15px] font-[400] w-27 text-center">{t('tradeSettings.Mev')}</p>
      <div className="p-0.5 border-[1px] border-[#1f1e25] flex-1 flex items-center bg-[#18181b] rounded-[6px]">
        <div
          className={cn('group flex items-center justify-center gap-0.5 flex-1 cursor-pointer h-[26px] rounded-[6px]', {
            'bg-[#302e38]': mevProtectionType === MevProtectionType.Off,
          })}
          onClick={() => handleChangeMevProtectType(MevProtectionType.Off)}
        >
          <IconShield2
            className={cn('w-3 h-3 text-[#878787]', 'group-hover:text-[#ffffff]', {
              //   'text-[#ffffff]': true,
              'text-[#ffffff] ': mevProtectionType === MevProtectionType.Off,
            })}
          />
          <p
            className={cn('text-[12px] leading-none text-[#605e68]', 'group-hover:text-[#ffffff]', {
              'text-[#ffffff]': mevProtectionType === MevProtectionType.Off,
            })}
          >
            {t('tradeSettings.MevClose')}
          </p>
        </div>
        <div
          className={cn('group flex items-center justify-center gap-0.5 flex-1 cursor-pointer h-[26px] rounded-[6px]', {
            'bg-[#302e38]': mevProtectionType === MevProtectionType.Normal,
          })}
          onClick={() => handleChangeMevProtectType(MevProtectionType.Normal)}
        >
          <IconShield
            className={cn('w-3 h-3 text-[#878787]', 'group-hover:text-[#ffffff]', {
              //   'text-[#ffffff]': true,
              'text-[#ffffff]': mevProtectionType === MevProtectionType.Normal,
            })}
          />
          <p
            className={cn('text-[12px] leading-none text-[#605e68]', 'group-hover:text-[#ffffff]', {
              'text-[#ffffff]': mevProtectionType === MevProtectionType.Normal,
            })}
          >
            {t('tradeSettings.MevStandard')}
          </p>
        </div>
        <div
          className={cn('group flex items-center justify-center gap-0.5 flex-1 cursor-pointer h-[26px] rounded-[6px]', {
            'bg-[#302e38]': mevProtectionType === MevProtectionType.Secure,
          })}
          onClick={() => handleChangeMevProtectType(MevProtectionType.Secure)}
        >
          <IconShield3
            className={cn('w-3 h-3 text-[#878787]', 'group-hover:text-[#ffffff]', {
              //   'text-[#ffffff]': true,
              'text-[#ffffff]': mevProtectionType === MevProtectionType.Secure,
            })}
          />
          <p
            className={cn('text-[12px] leading-none text-[#605e68]', 'group-hover:text-[#ffffff]', {
              'text-[#ffffff]': mevProtectionType === MevProtectionType.Secure,
            })}
          >
            {t('tradeSettings.MevSecure')}
          </p>
        </div>
      </div>
    </div>
  )
}

export default MevSelector
