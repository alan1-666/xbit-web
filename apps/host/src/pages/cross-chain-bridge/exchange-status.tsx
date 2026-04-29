import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

const CrossChainBridgeStatusPage = () => {
  const { t } = useTranslation()

  const mockData = {
    fromToken: 'TRUMP',
    amount: '1000',
    status: 'pending', // 'pending', 'success', 'failed'
  }

  const buttonLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return t('crossChainBridge.back')
      case 'success':
        return t('crossChainBridge.viewTransaction')
      case 'failed':
        return t('crossChainBridge.checkDetails')
      default:
        return status
    }
  }

  return (
    <div className="p-3 h-dvh flex flex-col items-center justify-between">
      <div className="flex-1 flex flex-col items-center justify-center">
        <img
          src={
            mockData.status === 'pending'
              ? '/images/icons/exchange-pending.svg'
              : mockData.status === 'success'
                ? '/images/icons/exchange-success.png'
                : '/images/icons/exchange-failed.png'
          }
          className="w-[100px] h-[100px]"
          alt="status-icon"
        />
        <div className="mt-4 font-semibold text-[32px] leading-none">
          {mockData.status === 'pending' ? (
            <>
              <span className="text-[#00FFB4]">
                {mockData.amount} <span className="text-[24px] leading-[1.2]">{mockData.fromToken}</span>{' '}
              </span>
              {t('crossChainBridge.redeeming')}
            </>
          ) : mockData.status === 'success' ? (
            t('crossChainBridge.redeemSuccess')
          ) : (
            t('crossChainBridge.redeemFailed')
          )}
        </div>
        <div className="mt-3 text-[14px] text-white/70 leading-none">
          {mockData.status === 'pending'
            ? t('crossChainBridge.redeemingNote', { token: mockData.fromToken })
            : mockData.status === 'success'
              ? t('crossChainBridge.redeemSuccessNote', { token: mockData.fromToken })
              : t('crossChainBridge.redeemFailedNote')}
        </div>
      </div>
      <div className="h-[76px] bg-transparent w-full flex items-center justify-between py-4">
        <div
          className="bg-gradient-to-t from-[#E149F8]/10 via-[#9945FF]/10 to-[#00F3AB]/10 rounded-[200px] py-[14px] text-center w-full border-gradient border-[1px] cursor-pointer"
          onClick={() => {
            // Handle button click based on status
            if (mockData.status === 'pending') {
              window.history.back()
            } else if (mockData.status === 'success') {
              // Navigate to the transaction details page
            } else if (mockData.status === 'failed') {
              // Navigate to the details page
            }
          }}
        >
          {buttonLabel(mockData.status)}
        </div>
      </div>
    </div>
  )
}

export default CrossChainBridgeStatusPage
