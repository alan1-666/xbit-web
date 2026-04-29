import { IconChevronUp, IconReset } from '@/components/icon'
import { Button } from '@/components/ui/button'
import XTooltip from '@/components/ui/XTooltip'
import React, { useMemo, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import BlacklistTokensSection from './BlacklistTokensSection'
import PlatformSection from './PlatformSection'
import { handleOnInput, WalletSettingsFormData } from './schema'
import { useNativeTokenSymbol } from '@/hooks/useActiveChain'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { cn } from '@/lib/utils'

const AdvancedSettingsSection: React.FC = () => {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<WalletSettingsFormData>()
  // Watch all relevant fields
  const watchedFields = watch([
    'minMarketCap',
    'maxMarketCap',
    'minLiquidity',
    'maxLiquidity',
    'minAmount',
    'maxAmount',
    'minCreationTimeInt',
    'maxCreationTimeInt',
    'minBurnLiquidity',
    'maxPurchasePerToken',
  ])

  const nativeTokenSymbol = useNativeTokenSymbol()

  // Count how many fields are not empty
  const filledCount = useMemo(
    () => watchedFields.filter((v) => v !== undefined && v !== null && v !== '').length,
    [watchedFields],
  )
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(true)

  const descriptionList = {
    followAmount: [t('listCoin.copyTrade.hint.followAmount.intro1'), t('listCoin.copyTrade.hint.followAmount.intro2')],
    minBurnPool: [t('listCoin.copyTrade.hint.minBurnPool.intro1')],
    singleAddPositionCount: [
      t('listCoin.copyTrade.hint.singleAddPositionCount.intro1'),
      t('listCoin.copyTrade.hint.singleAddPositionCount.intro2'),
      t('listCoin.copyTrade.hint.singleAddPositionCount.intro3'),
    ],
  }

  const handleDetailsToggle = (e: React.SyntheticEvent<HTMLDetailsElement, Event>) => {
    setIsOpen(e.currentTarget.open)
  }

  function handleClickReset(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault()
    const fields = [
      'minMarketCap',
      'maxMarketCap',
      'minLiquidity',
      'maxLiquidity',
      'minAmount',
      'maxAmount',
      'minCreationTimeInt',
      'maxCreationTimeInt',
      'minBurnLiquidity',
      'maxPurchasePerToken',
    ] as const
    //with setting form edit, it reset all fields, note in XBI-6496
    // fields.forEach((field) => resetField(field))
    fields.forEach((field) => setValue(field, ''))
  }

  function handleOnChangeNumber(
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: keyof WalletSettingsFormData,
    ableMinus: boolean = true,
  ) {
    // let value = e.target.value.replace(/[^0-9.]/g, '')
    // ableMinus = true : value able negative
    // ableMinus = false : value not able negative
    let value = e.target.value.replace(ableMinus ? /[^\-0-9.]/g : /[^0-9.]/g, '')
    if (value.includes('.')) {
      const parts = value.split('.')
      value = parts[0] + '.' + parts[1]
    }
    if (fieldName === 'minBurnLiquidity') {
      // minBurnLiquidity max is 100
      const numValue = parseFloat(value)
      if (numValue > 100) {
        value = '100'
      }
    }
    setValue(fieldName, value)
  }

  return (
    <div className="mt-7">
      <details className="group" onToggle={handleDetailsToggle}>
        <summary className="flex justify-between items-center cursor-pointer list-none [&::-webkit-details-marker]:hidden">
          <div className="flex items-center gap-1">
            <span className="text-base font-normal">
              {t('walletCopy.settings.advancedSettings')} ({filledCount})
            </span>
            <Button
              type="button"
              className="text-[#FFFFFFCC] text-sm font-normal bg-transparent hover:opacity-80 transition-opacity ease-linear ml-[0px] px-2"
              onClick={handleClickReset}
            >
              <IconReset className="text-[#9B9B9B] mr-[-4px]" />
              <span>{t('walletCopy.settings.reset')}</span>
            </Button>
          </div>
          <button type="button" className="size-[16px] flex items-center justify-center pointer-events-none">
            <IconChevronUp className={cn('transition-transform duration-200', isOpen && 'rotate-180')} />
          </button>
        </summary>

        <div className="mt-1 space-y-4">
          {/* Market Value */}
          <div className="flex items-center mb-[16px] gap-2">
            <span className="w-24 min-w-24 tracking-tighter text-[13px] font-normal">
              {t('walletCopy.settings.marketValue')}
            </span>
            <div className="flex-1">
              <div className="grid grid-cols-2 gap-2">
                <InputGroup>
                  <InputGroupInput
                    type="text"
                    {...register('minMarketCap', {
                      onChange: (e) => handleOnChangeNumber(e, 'minMarketCap', false),
                    })}
                    placeholder={t('walletCopy.settings.min')}
                    className="w-full bg-transparent outline-none placeholder:text-[#6C6A74] text-sm"
                    onKeyDown={(e) => handleOnInput(e, 6, false, true)}
                    autoComplete="off"
                  />
                  <InputGroupAddon align="inline-end">
                    <span className="text-sm text-[#908E98] leading-[100%] text-center">K</span>
                  </InputGroupAddon>
                </InputGroup>
                <InputGroup>
                  <InputGroupInput
                    type="text"
                    {...register('maxMarketCap', {
                      onChange: (e) => handleOnChangeNumber(e, 'maxMarketCap'),
                    })}
                    placeholder={t('walletCopy.settings.max')}
                    className="bg-transparent outline-none w-full placeholder:text-[#6C6A74] text-sm"
                    onKeyDown={(e) => handleOnInput(e, 6, false, true)}
                    autoComplete="off"
                  />
                  <InputGroupAddon align="inline-end">
                    <span className="text-sm text-[#908E98] leading-[100%] text-center">K</span>
                  </InputGroupAddon>
                </InputGroup>
              </div>
              {(() => {
                const minMsg = errors?.minMarketCap?.message
                const maxMsg = errors?.maxMarketCap?.message
                if (minMsg && maxMsg && minMsg === maxMsg) {
                  return (
                    <div className="mt-1 justify-start text-[#EA3B4F] text-xs font-normal leading-3">
                      {t(`walletCopy.settings.error.${minMsg}`)}
                    </div>
                  )
                }
                return (
                  <>
                    {minMsg && (
                      <div className="mt-1 justify-start text-[#EA3B4F] text-xs font-normal leading-3">
                        {t(`walletCopy.settings.error.${minMsg}`)}
                      </div>
                    )}
                    {maxMsg && (
                      <div className="mt-1 justify-start text-[#EA3B4F] text-xs font-normal leading-3">
                        {t(`walletCopy.settings.error.${maxMsg}`)}
                      </div>
                    )}
                  </>
                )
              })()}
            </div>
          </div>

          {/* Pool Size */}
          <div className="flex items-center mb-[16px] gap-2">
            <span className="w-24 min-w-24 tracking-tighter text-[13px] font-normal">
              {t('walletCopy.settings.pool')}
            </span>
            <div className="flex-1">
              <div className="grid grid-cols-2 gap-2">
                <InputGroup>
                  <InputGroupInput
                    type="text"
                    {...register('minLiquidity', {
                      onChange: (e) => handleOnChangeNumber(e, 'minLiquidity'),
                    })}
                    placeholder={t('walletCopy.settings.min')}
                    className="w-full bg-transparent outline-none placeholder:text-[#6C6A74] text-sm"
                    onKeyDown={(e) => handleOnInput(e, 6, false, true)}
                    autoComplete="off"
                  />
                  <InputGroupAddon align="inline-end">
                    <span className="text-sm text-[#908E98] leading-[100%] text-center">K</span>
                  </InputGroupAddon>
                </InputGroup>

                <InputGroup>
                  <InputGroupInput
                    type="text"
                    {...register('maxLiquidity', {
                      onChange: (e) => handleOnChangeNumber(e, 'maxLiquidity'),
                    })}
                    placeholder={t('walletCopy.settings.max')}
                    className="bg-transparent outline-none w-full placeholder:text-[#6C6A74] text-sm"
                    onKeyDown={(e) => handleOnInput(e, 6, false, true)}
                    autoComplete="off"
                  />
                  <InputGroupAddon align="inline-end">
                    <span className="text-sm text-[#908E98] leading-[100%] text-center">K</span>
                  </InputGroupAddon>
                </InputGroup>
              </div>
              {(() => {
                const minMsg = errors?.minLiquidity?.message
                const maxMsg = errors?.maxLiquidity?.message
                if (minMsg && maxMsg && minMsg === maxMsg) {
                  return (
                    <div className="mt-1 justify-start text-[#EA3B4F] text-xs font-normal leading-3">
                      {t(`walletCopy.settings.error.${minMsg}`)}
                    </div>
                  )
                }
                return (
                  <>
                    {minMsg && (
                      <div className="mt-1 justify-start text-[#EA3B4F] text-xs font-normal leading-3">
                        {t(`walletCopy.settings.error.${minMsg}`)}
                      </div>
                    )}
                    {maxMsg && (
                      <div className="mt-1 justify-start text-[#EA3B4F] text-xs font-normal leading-3">
                        {t(`walletCopy.settings.error.${maxMsg}`)}
                      </div>
                    )}
                  </>
                )
              })()}
            </div>
          </div>

          {/* Follow Amount */}
          <div className="flex items-center mb-[14px] gap-2">
            <span className="w-24 min-w-24 tracking-tighter text-[13px] font-normal inline-flex gap-1 items-center">
              {t('walletCopy.settings.followAmount')}
              <XTooltip description={descriptionList.followAmount} title={t('walletCopy.settings.followAmount')} />
            </span>
            <div className="flex-1">
              <div className="flex-1 grid grid-cols-2 gap-2">
                <InputGroup>
                  <InputGroupInput
                    type="text"
                    {...register('minAmount', {
                      onChange: (e) => handleOnChangeNumber(e, 'minAmount'),
                    })}
                    placeholder={t('walletCopy.settings.min')}
                    className="w-full bg-transparent outline-none placeholder:text-[#6C6A74] text-sm"
                    onKeyDown={(e) => handleOnInput(e, 6, false, false)}
                    autoComplete="off"
                  />
                  <InputGroupAddon align="inline-end">
                    <span className="text-sm text-[#908E98] leading-[100%] text-center">{nativeTokenSymbol}</span>
                  </InputGroupAddon>
                </InputGroup>
                <InputGroup>
                  <InputGroupInput
                    type="text"
                    {...register('maxAmount', {
                      onChange: (e) => handleOnChangeNumber(e, 'maxAmount'),
                    })}
                    placeholder={t('walletCopy.settings.max')}
                    className="bg-transparent outline-none w-full placeholder:text-[#6C6A74] text-sm"
                    onKeyDown={(e) => handleOnInput(e, 6, false, false)}
                    autoComplete="off"
                  />
                  <InputGroupAddon align="inline-end">
                    <span className="text-sm text-[#908E98] leading-[100%] text-center">{nativeTokenSymbol}</span>
                  </InputGroupAddon>
                </InputGroup>
              </div>
              {(() => {
                const minMsg = errors?.minAmount?.message
                const maxMsg = errors?.maxAmount?.message
                if (minMsg && maxMsg && minMsg === maxMsg) {
                  return (
                    <div className="mt-1 justify-start text-[#EA3B4F] text-xs font-normal leading-3">
                      {t(`walletCopy.settings.error.${minMsg}`)}
                    </div>
                  )
                }
                return (
                  <>
                    {minMsg && (
                      <div className="mt-1 justify-start text-[#EA3B4F] text-xs font-normal leading-3">
                        {t(`walletCopy.settings.error.${minMsg}`)}
                      </div>
                    )}
                    {maxMsg && (
                      <div className="mt-1 justify-start text-[#EA3B4F] text-xs font-normal leading-3">
                        {t(`walletCopy.settings.error.${maxMsg}`)}
                      </div>
                    )}
                  </>
                )
              })()}
            </div>
          </div>

          {/* Creation Time */}
          <div className="flex items-center mb-[13px] gap-2">
            <span className="w-24 min-w-24 tracking-tighter text-[13px] font-normal">
              {t('walletCopy.settings.creationTime')}
            </span>
            <div className="flex-1">
              <div className="flex-1 grid grid-cols-2 gap-2">
                <InputGroup>
                  <InputGroupInput
                    type="text"
                    {...register('minCreationTimeInt', {
                      onChange: (e) => handleOnChangeNumber(e, 'minCreationTimeInt'),
                    })}
                    placeholder={t('walletCopy.settings.min')}
                    className="w-full bg-transparent outline-none placeholder:text-[#6C6A74] text-sm"
                    onKeyDown={(e) => handleOnInput(e, 2, false)}
                    autoComplete="off"
                  />
                  <InputGroupAddon align="inline-end">
                    <span className="text-sm text-[#908E98] leading-[100%] text-center">min</span>
                  </InputGroupAddon>
                </InputGroup>
                <InputGroup>
                  <InputGroupInput
                    type="text"
                    {...register('maxCreationTimeInt', {
                      onChange: (e) => handleOnChangeNumber(e, 'maxCreationTimeInt'),
                    })}
                    placeholder={t('walletCopy.settings.max')}
                    className="bg-transparent outline-none w-full placeholder:text-[#6C6A74] text-sm"
                    onKeyDown={(e) => handleOnInput(e, 2, false)}
                    autoComplete="off"
                  />
                  <InputGroupAddon align="inline-end">
                    <span className="text-sm text-[#908E98] leading-[100%] text-center">min</span>
                  </InputGroupAddon>
                </InputGroup>
              </div>

              {(() => {
                const minMsg = errors?.minCreationTimeInt?.message
                const maxMsg = errors?.maxCreationTimeInt?.message
                if (minMsg && maxMsg && minMsg === maxMsg) {
                  return (
                    <div className="mt-1 justify-start text-[#EA3B4F] text-xs font-normal leading-3">
                      {t(`walletCopy.settings.error.${minMsg}`)}
                    </div>
                  )
                }
                return (
                  <>
                    {minMsg && (
                      <div className="mt-1 justify-start text-[#EA3B4F] text-xs font-normal leading-3">
                        {t(`walletCopy.settings.error.${minMsg}`)}
                      </div>
                    )}
                    {maxMsg && (
                      <div className="mt-1 justify-start text-[#EA3B4F] text-xs font-normal leading-3">
                        {t(`walletCopy.settings.error.${maxMsg}`)}
                      </div>
                    )}
                  </>
                )
              })()}
            </div>
          </div>

          {/* Min Burn Liquidity */}
          <div className="flex items-center mb-[16px] gap-2">
            <span className="w-24 min-w-24 tracking-tighter text-[13px] font-normal inline-flex gap-1 items-center">
              {t('walletCopy.settings.minBurnPool')}
              <XTooltip description={descriptionList.minBurnPool} title={t('walletCopy.settings.minBurnPool')} />
            </span>
            <div className="flex-1">
              <InputGroup>
                <InputGroupInput
                  type="text"
                  className="w-full bg-transparent outline-none placeholder:text-[#6C6A74] text-sm"
                  {...register('minBurnLiquidity', {
                    onChange: (e) => handleOnChangeNumber(e, 'minBurnLiquidity', false),
                  })}
                  onKeyDown={(e) => handleOnInput(e, 2, false, true)}
                  autoComplete="off"
                />
                <InputGroupAddon align="inline-end">
                  <span className="text-sm text-[#908E98] leading-[100%] text-center">%</span>
                </InputGroupAddon>
              </InputGroup>
            </div>
          </div>

          {/* Single Add Position Count */}
          <div className="flex items-center mb-[12px] gap-2">
            <span className="w-24 min-w-24 tracking-tighter text-[13px] font-normal inline-flex items-center">
              {t('walletCopy.settings.singleAddPositionCount')}
              <XTooltip
                description={descriptionList.singleAddPositionCount}
                title={t('walletCopy.settings.singleAddPositionCount')}
              />
            </span>
            <div className="flex-1">
              <InputGroup>
                <InputGroupInput
                  type="text"
                  placeholder={t('walletCopy.settings.enterPositiveInteger')}
                  className="w-full bg-transparent outline-none placeholder:text-[#6C6A74] text-sm"
                  {...register('maxPurchasePerToken', {
                    onChange: (e) => handleOnChangeNumber(e, 'maxPurchasePerToken', false),
                  })}
                  onKeyDown={(e) => handleOnInput(e, 2, false, true)}
                  autoComplete="off"
                />
              </InputGroup>
            </div>
          </div>
          <PlatformSection />
          <BlacklistTokensSection />
        </div>
      </details>
    </div>
  )
}

export default AdvancedSettingsSection
