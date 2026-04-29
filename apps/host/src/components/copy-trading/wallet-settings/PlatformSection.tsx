import { ConfigPlatform } from '@/@generated/gql/graphql-trading'
import CheckboxWithLabel from '@/components/common/CheckboxWithLabel'
import XTooltip from '@/components/ui/XTooltip'
import { capitalize } from 'lodash-es'
import React from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { WalletSettingsFormData } from './schema'

const PlatformSection: React.FC = () => {
  const { t } = useTranslation()
  const {
    control,
    formState: { errors },
  } = useFormContext<WalletSettingsFormData>()
  const LIST_PLATFORM = [ConfigPlatform.Pump, ConfigPlatform.Moonshot, ConfigPlatform.Raydium, ConfigPlatform.Others]
  const getLabelPlatform = (platform: ConfigPlatform) => {
    switch (platform) {
      case ConfigPlatform.Moonshot:
        return capitalize(t('walletCopy.settings.platform.moonshot'))
      case ConfigPlatform.Pump:
        return capitalize(t('walletCopy.settings.platform.pump'))
      case ConfigPlatform.Raydium:
        return capitalize(t('walletCopy.settings.platform.raydium'))
      default:
        return capitalize(t('walletCopy.settings.platform.other'))
    }
  }

  const platformIntro: string = t('listCoin.copyTrade.hint.platform.intro')

  return (
    <div className="mt-6 flex flex-row gap-2">
      <div className="w-24 min-w-24 tracking-tighter flex flex-row items-start mb-4">
        <label className="w-24 min-w-24 tracking-tighter text-[13px] font-normal inline-flex gap-1 items-center -mt-1">
          {t('walletCopy.settings.platform.platform')}{' '}
          <XTooltip
            description={platformIntro.split(/\\n|\n/)}
            title={t('walletCopy.settings.platform.platform')}
          />
        </label>
      </div>
      <div className="flex-1">
        <div className="grid grid-cols-2 gap-y-4 gap-x-1">
          <Controller
            control={control}
            name="platform"
            render={({ field }) => (
              <>
                {LIST_PLATFORM.map((platform) => (
                  <CheckboxWithLabel
                    key={platform}
                    label={getLabelPlatform(platform)}
                    defaultChecked={field.value.includes(platform)}
                    isChecked={field.value.includes(platform)}
                    isDisabled={field.value.includes(platform) && field.value.length === 1}
                    containerClassName=""
                    onChange={(checked) => {
                      let newList = [...field.value]
                      if (checked) {
                        if (!field.value.includes(platform)) {
                          newList = [...field.value, platform]
                        }
                      } else {
                        newList = field.value.filter((v) => v !== platform)
                      }
                      field.onChange(newList)
                    }}
                  />
                ))}
              </>
            )}
          />
        </div>
        {errors.platform && (
          <div className="text-red-500 text-xs mt-1">{t('walletCopy.settings.platform.error.minimumOne')}</div>
        )}
      </div>
    </div>
  )
}

export default PlatformSection
