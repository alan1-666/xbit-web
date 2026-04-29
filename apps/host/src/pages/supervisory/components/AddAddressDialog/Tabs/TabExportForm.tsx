import { UseFormReturn } from 'react-hook-form'
import { FormField, FormItem, FormControl, FormMessage, FormLabel } from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import FilterSelect from '@/components/common/FilterSelect'
import { GroupManageDialog } from '../GroupManageDialog'
import { useResponsive } from '@/hooks/useResponsive'
import GroupSelectDrawer from '../GroupSelect/GroupSelectDrawer'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { ReactComponent as ManageIcon } from '@/components/icon/supervisory/manager.svg'

export type TabExportValues = {
  groupId: string
}

export type GroupOption = { label: string; value: string }

type Props = {
  form: UseFormReturn<TabExportValues>
  exportText?: string
  options: GroupOption[]
  onGroupManageDialogChange?: (isOpen: boolean) => void
}

export const TabExportForm = ({ form, exportText, options, onGroupManageDialogChange }: Props) => {
  const { isDesktop } = useResponsive()
  const { t } = useTranslation()
  const [isShowAddressManage, setIsShowAddressManage] = useState<boolean>(false)
  return (
    <div className="space-y-5">
      <FormField
        control={form.control}
        name="groupId"
        render={({ field }) => (
          <FormItem>
            {!isDesktop && (
              <div>
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
                <GroupManageDialog />
              </div>
            )}

            {isDesktop && (
              <div className="flex justify-between">
                <FormLabel className="text-[#FAFAFA] font-light">{t('smartMoney.supervisory.addressGroup')}</FormLabel>
                <GroupManageDialog />
              </div>
            )}

            <FormControl>
              {isDesktop ? (
                <FilterSelect
                  options={options}
                  value={field.value}
                  onValueChange={field.onChange}
                  selectTriggerProps={{
                    className: 'h-11 w-full bg-[#0E0E11] border border-[#2A2A2F] text-white',
                  }}
                  selectContentProps={{
                    className: 'bg-[#0E0E11] border-[#2A2A2F] text-white',
                  }}
                />
              ) : (
                <GroupSelectDrawer value={field.value ?? ''} onChange={field.onChange} isSingleOption={true} onGroupManageDialogChange={onGroupManageDialogChange} />
              )}
            </FormControl>

            <FormMessage className="text-red-400" />
          </FormItem>
        )}
      />

      <div>
        <FormLabel className="text-[#FAFAFA] font-light block mb-2">{t('smartMoney.supervisory.exportAddr')}</FormLabel>
        <p className={cn('mt-1 text-xs leading-5', isDesktop ? 'text-white/40' : '#908E9A')}>
          {t('smartMoney.supervisory.exportAddrRemark')}
        </p>

        <Textarea
          rows={12}
          readOnly
          className={cn(
            'mt-3 bg-[#0E0E11] border text-white/70 focus-visible:ring-0 focus-visible:ring-offset-0',
            isDesktop ? 'border-[#2A2A2F]' : 'border-[#79779029]',
          )}
          value={
            exportText ??
            `[
  { "address": "0x....", "name": "" },
  { "address": "0x....", "name": "" }
]`
          }
          placeholder={t('smartMoney.supervisory.exportAddrPlaceholder')}
        />
      </div>

      {isShowAddressManage && (
        <GroupManageDialog
          show={isShowAddressManage}
          onBack={() => {
            setIsShowAddressManage(!isShowAddressManage)
            onGroupManageDialogChange?.(!isShowAddressManage)
          }}
        />
      )}
    </div>
  )
}
