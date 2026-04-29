import React from 'react'
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { WalletSettingsFormData } from './schema'
import { cn } from '@/lib/utils'
import { useResponsive } from '@/hooks/useResponsive'
import { useActiveChain } from '@/hooks/useActiveChain'

const FollowAddressSection: React.FC<{ isEdit?: boolean }> = ({ isEdit = false }) => {
  const { isDesktop } = useResponsive();
  const activeChain = useActiveChain()
  const {
    register,
    setValue,
    formState: { errors },
  } = useFormContext<WalletSettingsFormData>()
  const { t } = useTranslation()

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      return text
    } catch (error) {
      console.error('Failed to read clipboard contents: ', error)
    }
  }

  return (
    <div className="mt-2.5">
      <label className="justify-start text-primary text-base font-normal leading-none">
        {t('walletCopy.settings.followAddress')}
      </label>
      <div className="flex flex-row items-center border py-2 bg-[#79778C29] border-[#212127] mt-1 rounded-[6px] p-[8px]">
        <input
          type="text"
          className={cn("flex-grow text-sm font-normal bg-transparent outline-", isEdit ? "opacity-50" : "")}
          placeholder={t('walletCopy.settings.enterAddress')}
          {...register('leaderAddress')}
          disabled={isEdit}
        />
        <button
          type="button"
          className={cn("text-xs font-normal bg-(--bgInput) py-1.5 px-3 inline-flex rounded-sm", isEdit ? "opacity-50 cursor-not-allowed" : "", isDesktop ? "bg-[#212127]" : "")}
          onClick={async () => {
            if (!isEdit) {
              const text = await handlePaste()
              setValue('leaderAddress', text!, { shouldValidate: true })
            }
          }}
        >
          {t('walletCopy.settings.paste')}
        </button>
      </div>
      {errors.leaderAddress && (
        <div className="mt-1 justify-start text-[#EA3B4F] text-xs font-normal leading-3">
          {t('walletCopy.settings.invalidAddress', {
            network: activeChain.toUpperCase(),
          })}
        </div>
      )}
    </div>
  )
}

export default FollowAddressSection
