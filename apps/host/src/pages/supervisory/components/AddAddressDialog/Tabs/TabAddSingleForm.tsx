import { UseFormReturn } from 'react-hook-form'
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { GroupMultiSelect } from '../GroupSelect/GroupMultiSelect'
import { useResponsive } from '@/hooks/useResponsive'
import GroupSelectDrawer from '../GroupSelect/GroupSelectDrawer'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { GroupManageDialog } from '../GroupManageDialog'
import { ReactComponent as ManageIcon } from '@/components/icon/supervisory/manager.svg'
import { useTranslation } from 'react-i18next'

export type TabAddSingleValues = {
  address: string
  remarkName?: string
  groupIds: string[]
}

type Props = {
  form: UseFormReturn<TabAddSingleValues>
  onGroupManageDialogChange?: (isOpen: boolean) => void
}

export const TabAddSingleForm = ({ form, onGroupManageDialogChange }: Props) => {
  const { isDesktop } = useResponsive()
  const { t } = useTranslation()
  const [isShowAddressManage, setIsShowAddressManage] = useState<boolean>(false)

  return (
    <div className="space-y-5">
      <FormField
        control={form.control}
        name="address"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel className={cn('text-[#FAFAFA] block mb-2', !isDesktop ? 'text-xs' : '')}>{t('smartMoney.supervisory.address')}</FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder={t('smartMoney.supervisory.pleaseEnter')}
                className={cn(
                  'bg-[#0E0E11] border text-[#FAFAFA] placeholder:text-white/30 focus-visible:ring-0 focus-visible:ring-offset-0 ',
                  isDesktop
                    ? 'h-11 border-[#2A2A2F]'
                    : "h-10 border-[#79779029] text-xs font-normal font-['Geist'] leading-3",
                )}
              />
            </FormControl>
            <FormMessage className="text-red-400" />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="remarkName"
        render={({ field }) => (
          <FormItem>
            <FormLabel className={cn('text-[#FAFAFA] block mb-2', !isDesktop ? 'text-xs' : '')}>
              {t('smartMoney.supervisory.addressRemark')}
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder={t('smartMoney.supervisory.pleaseEnter')}
                className={cn(
                  'bg-[#0E0E11] border text-[#FAFAFA] placeholder:text-white/30 focus-visible:ring-0 focus-visible:ring-offset-0 ',
                  isDesktop
                    ? 'h-11 border-[#2A2A2F]'
                    : "h-10 border-[#79779029] text-xs font-normal font-['Geist'] leading-3",
                )}
              />
            </FormControl>
            <FormMessage className="text-red-400" />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="groupIds"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              {isDesktop ? (
                <GroupMultiSelect value={field.value ?? []} onChange={field.onChange} label={t('smartMoney.supervisory.addressGroup')} />
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <FormLabel className="text-[#FFFFFF] text-xs">
                      {t('smartMoney.supervisory.addressGroup')}
                    </FormLabel>

                    <button
                      type="button"
                      onClick={() => {
                        setIsShowAddressManage(!isShowAddressManage)
                        onGroupManageDialogChange?.(!isShowAddressManage)
                      }}
                      className="inline-flex items-center gap-1 text-white text-sm"
                    >
                      <ManageIcon className="w-3.5 h-3.5" />
                      {t('smartMoney.supervisory.manage')}
                    </button>
                  </div>
                  <GroupSelectDrawer value={field.value ?? []} onChange={field.onChange} onGroupManageDialogChange={onGroupManageDialogChange} />
                </div>
              )}
            </FormControl>
            <FormMessage className="text-red-400" />
          </FormItem>
        )}
      />

      {isShowAddressManage && (
        <GroupManageDialog
          show={isShowAddressManage}
          onBack={() => {
            setIsShowAddressManage(!isShowAddressManage)
            onGroupManageDialogChange?.(false)
          }}
        />
      )}
    </div>
  )
}
