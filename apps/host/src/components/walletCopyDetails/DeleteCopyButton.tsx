import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { XModal } from '../ui'
import { useMutation } from '@apollo/client'
import { updateCopyTradeConfigStatus } from '@/services/copytrade.service'
import { tradingClient } from '@/lib/gql/apollo-client'
import { toast } from 'sonner'
import { ConfigStatus } from '@/@generated/gql/graphql-trading'
import { cn } from '@/lib/utils'
import { listCoinHelper } from '@/utils/list-coin-helper'
import { Button } from '../ui/button'
import { IconCloseCircle } from '../icon'

interface DeleteCopyButtonProps {
  id: string
  onSuccess?: () => void
  isDisabled?: boolean
  adr?: string
  isPC?: boolean
}

const DeleteCopyButton = ({ id, onSuccess, isDisabled = false, adr = '', isPC = false }: DeleteCopyButtonProps) => {
  const [showModal, setShowModal] = useState(false)
  const { t } = useTranslation()

  async function handleConfirm() {
    try {
      await tradingClient.mutate({
        mutation: updateCopyTradeConfigStatus,
        variables: {
          input: {
            id,
            status: ConfigStatus.Canceled,
          },
        },
      });
      toast.success(t('walletCopy.cancelCopy'))
      onSuccess?.()
    }
    catch (error) {
      toast.error(t('walletCopy.errorUpdatingStatus'))
    }
    finally {
      setShowModal(false)
    }
  }
  return (
    <>

      {
        isPC ? (
          <Button
            variant="secondary"
            className={cn("flex items-center gap-1 bg-[#232329] text-[#FFFFFFB2] px-[10px] rounded-full min-w-[80px] mr-[6px]", isPC ? 'h-[32px] text-[14px]' : 'h-[28px] text-[11px]', isDisabled && 'opacity-50')}
            onClick={() => setShowModal(true)}
            disabled={isDisabled}
          >
            <IconCloseCircle className="!size-3" />
            <span className="flex-1">{t('listCoin.copyTrade.copyTradeDelete')}</span>
          </Button>
        ) :
          <button className={cn("text-[#B9B9B9] block text-right w-full", isDisabled && 'opacity-50')} onClick={() => setShowModal(true)} disabled={isDisabled}>
            <span className='text-sm text-white'>{t('listCoin.copyTrade.copyTradeDelete')}</span>
          </button>
      }
      <XModal.Confirmation
        showModal={showModal}
        onConfirm={handleConfirm}
        setShowModal={setShowModal}
        title={t('walletCopy.confirmDelete')}
        description={`${t('walletCopy.deleteMessage', { AddressLeader: listCoinHelper.formatWalletNameCustom(adr) })}`}
      />
    </>
  )
}

export default DeleteCopyButton
