import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import ButtonGradient from '@/components/common/buttons/ButtonGradient'
import LogoWithChain from '@/components/common/LogoWithChain'
import { 
  IconWalletBalance, 
  IconCopySuccess, 
  IconWalletCopy, 
  IconArbitrum
} from '@/components/icon'

interface WithdrawalFormProps {
  onWithdraw: (amount: string) => void
  status: string
}

const WithdrawalForm = ({ onWithdraw, status }: WithdrawalFormProps) => {
  const { t } = useTranslation()
  const [amount, setAmount] = useState('')
  const [copied, setCopied] = useState(false)
  const availableBalance = 9839.23
  const walletAddress = '946qJf...R1u0mp'

  const getReceiverAmount = (inputAmount: number | string) => {
    if (!inputAmount || Number(inputAmount) === 0) return '0.0'
    if (Number(inputAmount) <= availableBalance) {
      return Number(inputAmount) === availableBalance ? '9839.78' : Number(inputAmount) + 0.65
    }
    return '0.0'
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setAmount(value)
  }

  const handleMaxClick = () => {
    setAmount(availableBalance.toString())
  }

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(walletAddress.replace('...', ''))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getButtonText = () => {
    switch (status) {
      case 'initial':
        return amount ? t('withdrawal.button.withdrawWithAmount', { amount }) : t('withdrawal.button.withdraw')
      case 'insufficient':
        return t('withdrawal.button.insufficientFunds')
      case 'processing':
        return t('withdrawal.button.processing', { amount })
      case 'success':
        return t('withdrawal.button.success', { amount })
      case 'failed':
        return t('withdrawal.button.failed')
      default:
        return t('withdrawal.button.withdraw')
    }
  }

  const isButtonDisabled = () => {
    return ['insufficient', 'processing', 'success', 'failed'].includes(status) || !amount
  }

  return (
    <div className="px-3">
      <h5 className="mt-5 font-[15px] app-font-medium">{t('withdrawal.title')}</h5>
      <div className="mt-3 p-[1px] bg-gradient-to-br from-[#5E3395] to-[#118E6C] rounded-[8px] relative">
        <div className="bg-gradient-to-br from-[#25222D] to-[#212C2E] rounded-[8px] px-[14px] pt-[19px] pb-[27px]">
          <div className="flex flex-row justify-between">
            <h6 className="text-sm text-[#FFFFFFB2]">{t('withdrawal.fromContractAccount')}</h6>
            <div className="flex flex-row items-center gap-1">
              <IconWalletBalance />
              <span className="text-[11px] text-[#FFFFFFB2]">
                {availableBalance - (Number(amount) > availableBalance ? 0 : Number(amount))}
              </span>
              <button className="text-[#00FFB4] ml-2 text-[13px]" onClick={handleMaxClick}>
                {t('withdrawal.max')}
              </button>
            </div>
          </div>
          <div className="bg-[#121218] rounded-[10px] py-[19px] px-4 mt-3 flex flex-row gap-2">
            <span className="inline-flex items-center gap-1">
              <img src="/images/withdrawal/usdc.png" alt="" className="w-[26px] h-[26px]" /> USDC
            </span>
            <input
              type="text"
              placeholder="0.0"
              className={`w-full text-right text-[20px] font-semibold bg-transparent outline-none ${status === 'insufficient' ? 'text-red-500' : ''}`}
              value={amount}
              onChange={handleAmountChange}
            />
          </div>
          {status === 'insufficient' && <div className="text-red-500 text-right mt-1 text-sm">{t('withdrawal.insufficientFunds')}</div>}
        </div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[26px] z-10 border border-[#fffffff60] rounded-full">
          <div className="absolute inset-[6px] rounded-full bg-gradient-to-t from-purple-600 to-emerald-400 opacity-50 blur-md"></div>
          <div className="relative z-10 bg-gradient-to-tr from-[#3B2244] to-[#1B3B38] rounded-full p-[6px] border-4 border-[#121218]">
            <IconArbitrum />
          </div>
        </div>
      </div>
      <div className="mt-1 p-[1px] bg-gradient-to-br from-[#5E3395] to-[#118E6C] rounded-[8px] relative">
        <div className="bg-gradient-to-br from-[#25222D] to-[#212C2E] rounded-[8px] px-[14px] pt-[19px] pb-[27px]">
          <div className="flex flex-row justify-between">
            <h6 className="text-sm text-[#FFFFFFB2]">{t('withdrawal.toArbitrum')}</h6>
            <div className="flex flex-row items-center gap-1">
              <img src="/images/withdrawal/wallet.png" alt="" className="w-4 h-4" />
              <span className="text-[11px] text-[#FFFFFFB2]">{walletAddress}</span>
              <button className="ml-2" onClick={handleCopyAddress}>
                {copied ? <IconCopySuccess /> : <IconWalletCopy />}
              </button>
            </div>
          </div>
          <div className="bg-[#121218] rounded-[10px] py-[19px] px-4 mt-3 flex flex-row gap-2">
            <span className="inline-flex items-center gap-1">
              <LogoWithChain
                logo="/images/withdrawal/usdc.png"
                name={'USDC'}
                chainContainerClassName="!bg-none"
                logoClassName="w-[26px] h-[26px]"
                chainLogo="/images/withdrawal/chain.png"
              />
              USDC
            </span>
            <input
              type="text"
              value={getReceiverAmount(amount)}
              className="w-full text-right text-[20px] font-semibold bg-transparent"
              disabled
            />
          </div>
        </div>
      </div>
      <p className="text-sm text-[#FFFFFFB2] mt-3">
        {t('withdrawal.networkMessage')}
      </p>

      <ButtonGradient
        className={`rounded-full w-full hover-scale mt-8 ${isButtonDisabled() ? 'opacity-70' : ''}`}
        onClick={() => onWithdraw(amount)}
        disabled={isButtonDisabled()}
      >
        {status === 'processing' ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            {getButtonText()}
          </div>
        ) : (
          getButtonText()
        )}
      </ButtonGradient>
    </div>
  )
}

export default WithdrawalForm 