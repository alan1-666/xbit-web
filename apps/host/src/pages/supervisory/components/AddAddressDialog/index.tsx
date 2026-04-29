import React, { useEffect, useMemo, useState, useRef } from 'react'
import clsx from 'clsx'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { ChevronLeft } from 'lucide-react'

import { useAddressGroups } from '@/providers/AddressGroupsProvider'

import { TabExportForm } from './Tabs/TabExportForm'
import { TabAddSingleForm } from './Tabs/TabAddSingleForm'
import { TabBatchAddForm } from './Tabs/TabBatchAddForm'

import { useCreateAddress } from '@/hooks/useCreateAddress'
import { useBatchCreateAddresses } from '@/hooks/useBatchCreateAddresses'
import { useImportAddresses } from '@/hooks/useImportAddresses'
import { useExportAddresses } from '@/hooks/useExportAddresses'
import { exportContentToJson } from '@/utils/smart-money'
import { useResponsive } from '@/hooks/useResponsive'

import { createSingleSchema, createBatchSchema, createExportSchema } from './model'
import { cn } from '@/lib/utils'

type TabKey = 'single' | 'batch' | 'export'

type Props = {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  defaultTab?: TabKey
  onSuccess?: () => Promise<void> | void
}

export type TabExportValues = {
  groupId: string
}

export const AddAddressDialog = ({ open, onOpenChange, defaultTab = 'single', onSuccess }: Props) => {
  const { isDesktop } = useResponsive()

  const [active, setActive] = useState<TabKey>(defaultTab)
  const [exportPreview, setExportPreview] = useState<string>('')
  const [selectedGroup, setSelectedGroup] = useState('')
  const [isGroupManageDialogOpen, setIsGroupManageDialogOpen] = useState(false)
  const { t } = useTranslation()

  const singleSchema = useMemo(() => createSingleSchema(t), [t])
  const batchSchema = useMemo(() => createBatchSchema(t), [t])
  const exportSchema = useMemo(() => createExportSchema(t), [t])

  type SingleValues = z.infer<typeof singleSchema>
  type BatchValues = z.infer<typeof batchSchema>
  type ExportValues = z.infer<typeof exportSchema>

  const { groupList, selectedGroupId, setSelectedGroupId } = useAddressGroups()

  const { createAddress, loading: creating } = useCreateAddress()
  const { batchCreateAddresses } = useBatchCreateAddresses()
  const { importAddresses } = useImportAddresses()

  const { exportAddresses, loading: exporting } = useExportAddresses()

  useEffect(() => {
    if (open) setActive(defaultTab)
  }, [open, defaultTab])

  const singleForm = useForm<SingleValues>({
    resolver: zodResolver(singleSchema),
    defaultValues: { address: '', remarkName: '', groupIds: [] },
    mode: 'onChange',
  })

  const batchForm = useForm<BatchValues>({
    resolver: zodResolver(batchSchema),
    defaultValues: { groupIds: [], addressesText: '' },
    mode: 'onChange',
  })

  const exportForm = useForm<ExportValues>({
    resolver: zodResolver(exportSchema),
    defaultValues: { groupId: '' },
    mode: 'onChange',
  })

  const onSubmitSingle = async (v: SingleValues) => {
    try {
      const res = await createAddress({
        address: v.address,
        remarkName: v.remarkName?.trim() || null,
        groupIds: v.groupIds ?? [],
      })
      toast.success(t('smartMoney.supervisory.addrAddSuccessToast'))
      singleForm.reset({ address: '', remarkName: '', groupIds: [] })
      onOpenChange?.(false)
      await onSuccess?.()
    } catch (e) {
      console.error(e)
      toast.error(t('smartMoney.supervisory.addrAddFailToast'))
    }
  }

  const onSubmitBatch = async (v: BatchValues) => {
    console.log('submit batch', v)

    const params = {
      text: v.addressesText,
      groupIds: v.groupIds ?? [],
    }
    try {
      await importAddresses(params)
      toast.success(t('smartMoney.supervisory.addrAddMultiSuccessToast'))
      batchForm.reset({ addressesText: '', groupIds: [] })
      onOpenChange?.(false)
      await onSuccess?.()
    } catch (e) {
      console.error(e)
      toast.error(t('smartMoney.supervisory.addrAddMultiFailedToast'))
    }
  }

  const onSubmitExport = async (v: ExportValues) => {
    try {
      const res = await exportAddresses({ groupId: v.groupId })

      const jsonArr = exportContentToJson(res.content)
      setExportPreview(JSON.stringify(jsonArr, null, 2))

      toast.success(t('smartMoney.supervisory.addrImportSuccessToast', { count: res.count }))
    } catch (e: any) {
      console.error(e)
      toast.error(e?.message ?? t('smartMoney.supervisory.addrImportFailedToast'))
    }
  }

  const TABS = [
    { key: 'single', label: t('smartMoney.supervisory.addAddress') },
    { key: 'batch', label: t('smartMoney.supervisory.addrMultiAdd') },
    { key: 'export', label: t('smartMoney.supervisory.export') },
  ] as const

  const renderSubmitButton = () => {
    return (
      <>
        {active === 'single' && (
          <Button
            type="submit"
            disabled={creating}
            onClick={singleForm.handleSubmit(onSubmitSingle)}
            className={cn("h-11", isDesktop ? "px-8 rounded-xl text-[#FAFAFA] bg-[#7C3AED] hover:bg-[#8B5CF6]" : "w-full bg-zinc-800 rounded-3xl text-white text-base font-semibold font-['Geist'] leading-5")}
          >
            {creating ? t('smartMoney.supervisory.submitting') : t('smartMoney.supervisory.confirm')}
          </Button>
          
        )}
        {active === 'batch' && (
          <Button
            type="button"
            onClick={batchForm.handleSubmit(onSubmitBatch)}
            className={cn("h-11", isDesktop ? "px-8 rounded-xl text-[#FAFAFA] bg-[#7C3AED] hover:bg-[#8B5CF6]" : "w-full bg-zinc-800 rounded-3xl text-white text-base font-semibold font-['Geist'] leading-5")}
          >
            {t('smartMoney.supervisory.confirmAdd')}
          </Button>
        )}
        {active === 'export' && (
          <Button
            type="button"
            onClick={exportForm.handleSubmit(onSubmitExport)}
            className={cn("h-11", isDesktop ? "px-8 rounded-xl text-[#FAFAFA] bg-[#7C3AED] hover:bg-[#8B5CF6]" : "w-full bg-zinc-800 rounded-3xl text-white text-base font-semibold font-['Geist'] leading-5")}
          >
            {exporting ? t('smartMoney.supervisory.exporting') : t('smartMoney.supervisory.confirmExport')}
          </Button>
        )}
      </>
    )
  }

  const renderFormContent = () => {
    return (
      <>
        {/* tabs 固定 */}
        <div
          className="
            inline-flex w-fit
            gap-2 mb-6 p-1
            rounded-lg
            bg-[rgba(121,119,144,0.16)]
          "
        >
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setActive(t.key)}
              className={clsx(
                'h-8 px-3 rounded-lg text-sm text-white transition',
                active === t.key ? 'bg-[#101114]' : 'hover:bg-white/5',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex-1 min-h-0 overflow-auto pr-1">
          {active === 'single' && (
            <Form {...singleForm}>
              <form onSubmit={singleForm.handleSubmit(onSubmitSingle)} className="space-y-5">
                <TabAddSingleForm form={singleForm} onGroupManageDialogChange={setIsGroupManageDialogOpen} />
              </form>
            </Form>
          )}

          {active === 'batch' && (
            <Form {...batchForm}>
              <form onSubmit={batchForm.handleSubmit(onSubmitBatch)} className="space-y-5">
                <TabBatchAddForm form={batchForm} onGroupManageDialogChange={setIsGroupManageDialogOpen} />
              </form>
            </Form>
          )}

          {active === 'export' && (
            <Form {...exportForm}>
              <form onSubmit={exportForm.handleSubmit(onSubmitExport)} className="space-y-5">
                <TabExportForm
                  form={exportForm}
                  options={groupList}
                  onGroupManageDialogChange={setIsGroupManageDialogOpen}
                  exportText={
                    exportPreview ??
                    `
            [
              { "address": "0x....", "name": "" },
              { "address": "0x....", "name": "" }
            ]`
                  }
                />
              </form>
            </Form>
          )}
        </div>

        {isDesktop && (
          <div className="pt-4 mt-4 border-t border-white/5 shrink-0 flex justify-end">{renderSubmitButton()}</div>
        )}

        {!isDesktop && !isGroupManageDialogOpen && (
          <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pt-11 pb-4 bg-[#0A0A0A] border-t border-white/5 flex justify-end max-w-[768px] mx-auto">
            {renderSubmitButton()}
          </div>
        )}
      </>
    )
  }

  const renderDesktop = () => {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          overlayClassName="bg-black/60"
          showDialogPrimitiveClose={false}
          className="
            bg-[#1A1A1D] border border-[#2A2A2F]
            text-white p-6 rounded-xl
            max-w-[680px] shadow-xl
            max-h-[80vh] overflow-hidden
            flex flex-col
          "
        >
          {/* header 固定 */}
          <div className="flex justify-between items-center mb-5">
            <div className="flex items-center gap-2 text-lg font-medium">
              <button className="p-2 rounded-lg hover:bg-white/5" onClick={() => onOpenChange?.(false)} type="button">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <DialogTitle>{t('smartMoney.supervisory.addAddress')}</DialogTitle>
            </div>
            <button className="p-2 rounded-lg hover:bg-white/5" onClick={() => onOpenChange?.(false)} type="button">
              <span className="text-2xl leading-none">×</span>
            </button>
          </div>

          {renderFormContent()}
        </DialogContent>
      </Dialog>
    )
  }

  const renderMobile = () => {
    return (
      <div className="fixed inset-0 z-50 py-4 px-3 bg-[#0A0A0A] max-w-[768px] mx-auto">
        <div className="w-full h-11 relative flex items-center overflow-hidden">
          <div className="absolute flex h-full items-center">
            <button className="py-2 rounded-lg hover:bg-white/5" onClick={() => onOpenChange?.(false)} type="button">
              <ChevronLeft className="h-5 w-5" />
            </button>
          </div>

          {/* Center title */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-base font-medium">{t('smartMoney.supervisory.addAddress')}</span>
          </div>
        </div>

        <div key={active} className="flex flex-col flex-1 min-h-0">
          {renderFormContent()}
        </div>
      </div>
    )
  }

  return isDesktop ? renderDesktop() : renderMobile()
}
