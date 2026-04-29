import React, { Fragment } from 'react'
import { useTranslation } from 'react-i18next'
import TransactionSettingsSection from './TransactionSettingsSection'
import { Button } from '@/components/ui/button'
import { useCopyTradeContextFields } from './CopyTradeContext'

interface ActionButtonsProps {
  onCancel: () => void
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ onCancel }) => {
  const pcMode = Boolean(useCopyTradeContextFields(['pcMode']).pcMode.get);
  const { t } = useTranslation()
  return (
    <Fragment>
      {
        !pcMode ? (
          <TransactionSettingsSection />
        ) : null
      }
      <div className="px-[12px] w-full border-solid border-t-[0.5px] box-border flex flex-col items-center justify-center pb-[46px] md:pb-4 py-4 text-center text-base">
        <div className="self-stretch flex flex-row items-start gap-2">
          <Button
            variant="close"
            type="button"
            onClick={onCancel}
            className="rounded-full p-[2px] h-11 flex-1 w-full bg-[#2B2B33]"
          >
            <span className="h-full w-full flex items-center justify-center rounded-full overflow-hidden">
              {t('walletCopy.settings.cancel')}
            </span>
          </Button>
          <Button
            variant="gradient"
            type="submit"
            // disabled={Object.keys(errors).length > 0}
            className="purple-btn-gradient !text-white rounded-[200px] border-solid border-[1px] h-11 w-full flex-1 max-w-1/2 disabled:opacity-50"
          >
            {t('walletCopy.settings.save')}
          </Button>
        </div>
      </div>
    </Fragment>
  )
}

export default ActionButtons 