import { UseFormReturn } from 'react-hook-form'
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { GroupMultiSelect } from '../GroupSelect/GroupMultiSelect'
import GroupSelectDrawer from '../GroupSelect/GroupSelectDrawer'
import { useResponsive } from '@/hooks/useResponsive'
import { cn } from '@/lib/utils'
import { ReactComponent as ManageIcon } from '@/components/icon/supervisory/manager.svg'
import { useState } from 'react'
import { GroupManageDialog } from '../GroupManageDialog'
import { useTranslation } from 'react-i18next'

export type TabBatchAddValues = {
  groupIds: string[]
  addressesText: string
}

type Props = {
  form: UseFormReturn<TabBatchAddValues>
  onGroupManageDialogChange?: (isOpen: boolean) => void
}

export const TabBatchAddForm = ({ form, onGroupManageDialogChange }: Props) => {
  const { isDesktop } = useResponsive()
  const { t } = useTranslation()
  const [isShowAddressManage, setIsShowAddressManage] = useState<boolean>(false)

  return (
    <div className="space-y-5">
      <FormField
        control={form.control}
        name="groupIds"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              {isDesktop ? (
                <GroupMultiSelect value={field.value ?? []} onChange={field.onChange} label={t('smartMoney.supervisory.addressGroup')} />
              ) : (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <FormLabel className="text-[#FFFFFF] text-xs">{t('smartMoney.supervisory.addressGroup')}</FormLabel>

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
                </>
              )}
            </FormControl>
            <FormMessage className="text-red-400" />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="addressesText"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-[#FAFAFA] font-light">{t('smartMoney.supervisory.importAddressesLabel')}</FormLabel>

            <p className={cn('mt-1 text-xs leading-5', isDesktop ? 'text-white/40 ' : 'text-[#908E9A]')}>
              { t('smartMoney.supervisory.importAddrRemark') }
            </p>

            <FormControl>
              <Textarea
                {...field}
                rows={10}
                className={cn(
                  'mt-3 bg-[#0E0E11] border text-white placeholder:text-white/30 focus-visible:ring-0 focus-visible:ring-offset-0',
                  isDesktop ? 'border-[#2A2A2F]' : 'border-[#79779029]',
                )}
              />
            </FormControl>
            <FormMessage className="text-red-400" />
          </FormItem>
        )}
      />

      <div className={cn('p-3 rounded-xl bg-[#0E0E11] border', isDesktop ? 'border-[#2A2A2F]' : 'border-[#79779029]')}>
        <p className="text-xs text-white/40 mb-2">{t('smartMoney.supervisory.importAddrExample')}</p>
        <pre className="text-white/70 text-xs leading-5">0x9c...e7ad:名称 1 0x9c...e9ad:名称 2,0x9c...e8ad</pre>
      </div>
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
