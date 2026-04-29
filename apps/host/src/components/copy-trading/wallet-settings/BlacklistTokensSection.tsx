import { TokenBlacklist, TokenBlacklistAction } from '@/@generated/gql/graphql-trading'
import { IconCPDelete } from '@/components/icon'
import { Button } from '@/components/ui/button'
import { tradingClient } from '@/lib/gql/apollo-client'
import { _userInfo } from '@/redux/modules/newAuth.slice'
import { getListTokenBlacklistQuery, modifyTokenBlacklistMutate } from '@/services/copytrade.service'
import { isSolanaWallet } from '@/utils/solana'
import { useQuery } from '@apollo/client'
import { get } from 'lodash-es'
import React, { useEffect, useMemo, useState } from 'react'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { toast } from 'sonner'
import { WalletSettingsFormData } from './schema'
import XTooltip from '@/components/ui/XTooltip'
import { InputGroup, InputGroupInput } from '@/components/ui/input-group'

const BlacklistTokensSection: React.FC = () => {
  const {
    register,
    control,
    setError,
    setValue,
    watch,
    clearErrors,
    formState: { errors },
  } = useFormContext<WalletSettingsFormData>()
  const { t } = useTranslation()
  const blacklistTokens = watch('blacklistTokens')
  const [isLoading, setIsLoading] = useState(false)
  const { fields, append, remove, update } = useFieldArray({
    control,
    name: 'blacklistTokens',
  })

  const  userId = useSelector(_userInfo)?.userId
  const listAddress = useMemo(() => {
    return blacklistTokens?.map((item) => item.address);
  }, [blacklistTokens])
  const { data } = useQuery(getListTokenBlacklistQuery, {
    variables: {
      input: {
        userId: userId,
        page: 1,
        size: 10,
      },
    },
    skip: !userId,
    client: tradingClient,
  })

  const listTokenBlackLists = data?.listTokenBlacklist?.items as TokenBlacklist[]
  useEffect(() => {
    if (listTokenBlackLists) {
      const list = listTokenBlackLists.map((item: TokenBlacklist) => {
        return {
          id: item.id,
          address: item.token,
          disabled: true,
        }
      })
      if (list.length > 0) {
        setTimeout(() => {
          setValue('blacklistTokens', list)
        }, 500)
      }
    }
  }, [listTokenBlackLists])

  const validateToken = (token: string) => {
    if (token && token.length > 0 && listAddress?.includes(token)) {
      return t('walletCopy.settings.tokenAlreadyInBlacklist')
    }
    if (!token || token.length === 0) {
      return t('walletCopy.settings.inputBeforeAdd')
    }
    if (!isSolanaWallet(token)) {
      return t('walletCopy.settings.invalidToken')
    }
    return ''
  }

  const addBlacklistToken = async () => {
    if ((fields.length < 10 && fields[fields.length - 1]?.address !== '' && fields[fields.length - 1]?.disabled) || fields.length === 0) {
      append({
        id: Date.now().toString(),
        address: '',
        disabled: false,
      });
      // const token = blacklistTokens?.[blacklistTokens.length - 1]
      // if (!token?.address) {
      //   setError(`blacklistTokens.${blacklistTokens && blacklistTokens.length > 0 ? blacklistTokens.length - 1 : 0}`, {
      //     type: 'manual',
      //     message: t('walletCopy.settings.inputBeforeAdd'),
      //   })
      //   return
      // }
    }
  }

  const removeToken = (index: number) => {
    const token = blacklistTokens?.[index]
    // const findToken = listTokenBlackLists.find((item: TokenBlacklist) => item.token === token?.address)
    // if (!token?.address || !findToken) {
    //   remove(index)
    //   return
    // }
    if (!token?.address) {
      remove(index)
      return
    }
    try {
      handleBlacklistItem(token?.address, TokenBlacklistAction.Remove).then((res) => {
        if (res) {
          toast.success(t('toast.deleteSuccess'))
          remove(index)
          // loop check all fields, if address is empty or same address, remove it
          fields.forEach((field, i) => {
            const address = get(field, 'address', '').trim();
            const tokenAddress = get(token, 'address', '').trim();
            if (address == '' && field.disabled == false) {
              handleBlacklistItem(tokenAddress, TokenBlacklistAction.Add).then((res) => {
                if (res) {
                  clearErrors(`blacklistTokens.${i - 1}`)
                  // Disable input after successfully adding the token
                  setValue(`blacklistTokens.${i - 1}.disabled`, true, { shouldDirty: true });
                  // Update the field to reflect the new state
                  update(i - 1, {
                    id: field.id,
                    address: tokenAddress,
                    disabled: true,
                  });
                  // Show success message
                  toast.success(t('toast.saveSuccess'));
                }
              })
            }
          })
        }
      })
    } catch (error) {
      toast.error(error?.[0]?.message)
      console.warn(error)
      throw error
    }
  }

  function handleBlacklistItem(address: string, action: TokenBlacklistAction) {
    return tradingClient
      .mutate({
        mutation: modifyTokenBlacklistMutate,
        variables: {
          input: {
            token: address,
            action,
          }
        },
      })
  }

  return (
    <div className="mt-6 flex flex-row gap-2">
      <div className="w-24 min-w-24">
        <label className="text-primary text-[13px] font-normal inline-flex items-center gap-0.5 h-10 mt-[2px]">
          {t('walletCopy.settings.currencyBlacklist')}
          <XTooltip description={t('listCoin.copyTrade.hint.blacklist')} title={t('walletCopy.settings.currencyBlacklist')} />
        </label>
      </div>
      <div className="w-full">
        {fields.map((token, index) => (
          <div key={token.id} className="mb-2">
            <div className="flex items-center gap-2">
              <span className="text-sm">{index + 1}</span>
              <div className="flex-1 relative">
                <InputGroup>
                  <InputGroupInput
                    type="text"
                    {...register(`blacklistTokens.${index}.address` as const)}
                    placeholder={t('walletCopy.settings.enterTokenAddress')}
                    className="w-full bg-transparent outline-none placeholder:text-[#6C6A74] text-sm"
                    disabled={watch(`blacklistTokens.${index}.disabled`)}
                    autoComplete="off"
                    onBlur={async (e) => {
                      const value = e.target.value
                      const msg = validateToken(value)
                      if (msg.length > 0) {
                        setError(`blacklistTokens.${index}`, {
                          type: 'manual',
                          message: msg,
                        })
                      }
                      else {
                        const res = await handleBlacklistItem(value, TokenBlacklistAction.Add)
                        if (res) {
                          clearErrors(`blacklistTokens.${index}`)
                          // Disable input after successfully adding the token
                          setValue(`blacklistTokens.${index}.disabled`, true, { shouldDirty: true });
                          // Update the field to reflect the new state
                          update(index, {
                            id: token.id,
                            address: value,
                            disabled: true,
                          });
                          // Show success message
                          toast.success(t('toast.saveSuccess'));
                        }
                      }
                    }}
                  />
                </InputGroup>
              </div>
              <button
                type="button"
                className="inline-flex items-center justify-center"
                onClick={() => removeToken(index)}
              >
                <IconCPDelete />
              </button>
            </div>
            {errors.blacklistTokens?.[index] && (
              <div className="text-[#EA3B4F] text-xs ml-7 mt-1">{errors.blacklistTokens?.[index].message}</div>
            )}
          </div>
        ))}

        <div className="pl-4 pr-6">
          {fields.length < 10 && (
            // <button
            //   type="button"
            //   disabled={fields.length >= 10 || isLoading}
            //   style={{
            //     background:
            //       'var(--111-but1, linear-gradient(44deg, #E843FE 0%, #FFF 47.32%, #FFF 63.89%, #00FFCD 103.57%))',
            //   }}
            //   className="w-full rounded-[6px] py-0 px-3.5 text-center h-9 text-sm text-[#141414] font-normal "
            //   onClick={addBlacklistToken}
            // >
            //   {t('walletCopy.settings.addToBlacklist')}
            // </button>
            <Button
              variant="ghost"
              disabled={fields.length >= 10 || isLoading}
              type="button"
              className="w-full py-0 px-3.5 text-center h-9 text-sm text-[#FBFBFB] font-normal bg-[#79778C29]"
              onClick={addBlacklistToken}
            >
              {t('walletCopy.settings.addToBlacklist')}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default BlacklistTokensSection
