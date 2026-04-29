import React, { useRef, useEffect, useState } from 'react'
import XStockCard, { XStockCardProps } from './XStockCard'
import { useTranslation } from 'react-i18next'
import { useMutation } from '@apollo/client'
import { removeTokenFromFavorite } from '@services/tokens.service.ts'
import { toast } from 'sonner'
import { futureClient } from '@/lib/gql/apollo-client.ts'

export interface XStockWatchlistCardProps extends XStockCardProps {
  onItemRemoved?: (token: string) => void
}

const XStockWatchlistCard: React.FC<XStockWatchlistCardProps> = ({ onItemRemoved, ...cardProps }) => {
  const [disabled, setDisabled] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { t } = useTranslation()
  const [removeFromFavoritesMutation] = useMutation(removeTokenFromFavorite, { client: futureClient })

  const token = cardProps.token

  useEffect(() => {
    if (ref.current) {
      ref.current.scrollTo({ left: 0, behavior: 'auto' })
    }
  }, [ref.current, token.address])

  const handleRemove = async () => {
    if (isDeleting) return
    
    setIsDeleting(true)
    setDisabled(true)
    
    try {
      await removeFromFavoritesMutation({ 
        variables: { 
          token: token.address, 
          chain: undefined 
        } 
      })
      toast.success(t('toast.removeFavoriteSuccess'), {
        duration: 3000,
      })
      onItemRemoved?.(token.address ?? '')
    } catch (error) {
      console.error('删除失败:', error)
      toast.warning(t('toast.saveFailed'))
      setDisabled(false)
      setIsDeleting(false)
    }
  }

  return (
    <div
      ref={ref}
      className="relative w-full overflow-x-auto no-scrollbar snap-x snap-mandatory flex items-stretch gap-1"
    >
      <div className="w-full basis-full shrink-0 snap-start relative">
        <XStockCard {...cardProps} />
        {disabled && <div className="absolute inset-0 bg-[#141414B3]" />}
      </div>
      <div className="w-[60px] z-20 basis-[60px] shrink-0 flex items-center snap-start justify-center bg-[#0A0A0A]">
        <button
          onClick={handleRemove}
          disabled={isDeleting}
          className={`relative right-1 w-[60px] h-[28px] bg-red-500 hover:bg-red-600 rounded-2xl flex items-center justify-center text-white text-sm font-medium transition-opacity ${
            isDeleting ? 'opacity-50' : 'opacity-100'
          }`}
        >
          {isDeleting ? (
            <div className="flex items-center">
              <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
              <span>{t('futuresDetails.margin.remove')}</span>
            </div>
          ) : (
            t('futuresDetails.margin.remove')
          )}
        </button>
      </div>
    </div>
  )
}

export default XStockWatchlistCard
