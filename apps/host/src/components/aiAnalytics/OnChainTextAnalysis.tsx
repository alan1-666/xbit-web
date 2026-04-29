import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils.ts'
import { IconWave } from '@components/icon'
import Markdown from 'react-markdown'
import { useAiAnalysis } from '@hooks/useAiAnalysis.ts'
import { Button } from '@components/ui/button.tsx'

export interface OnChainTextAnalysisProps {
  tokenAddress: string | undefined
}

const Thinking = () => {
  const { t } = useTranslation()
  const [dotCount, setDotCount] = useState(0)
  const dots = useMemo(() => {
    return '.'.repeat(dotCount)
  }, [dotCount])
  useEffect(() => {
    const interval = setInterval(() => {
      setDotCount((prev) => (prev + 1) % 4) // Cycle through 0 to 3
    }, 500)
    return () => clearInterval(interval)
  }, [])
  return (
    <div className="w-full h-28 flex bg-[#ECECED0A] border border-[#ECECED1F] rounded-[8px] p-4">
      <IconWave className="drop-shadow-[0px_1px_4px_#A162F7] icon-wave mr-2" />
      <span className="text-[calc(13rem/16)] mt-1">{(t('ai.analyzing') as string).replace('...', '')}</span>
      <span className="w-8">{dots}</span>
    </div>
  )
}

const OnChainTextAnalysis = (props: OnChainTextAnalysisProps) => {
  const { tokenAddress } = props
  const { t } = useTranslation()

  const tabs = {
    narrative: t('ai.narrative'),
    website: t('ai.websiteAnalysis'),
    avatar: t('ai.avatarAnalysis'),
  }

  const [activeTab, setActiveTab] = useState(tabs.narrative)
  const [isExpanded, setIsExpanded] = useState(false)
  const pRef = useRef<HTMLParagraphElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const getTabStyle = (tab: string) => ({
    background: activeTab === tab ? '#6A2AE0' : '#ECECED14',
    color: activeTab === tab ? '#fff' : '#FFFFFFB2',
  })

  const queriesData = useAiAnalysis({
    tokenAddress: tokenAddress,
  })

  const rawContent = useMemo(() => {
    if (activeTab === tabs.narrative) {
      return queriesData.narrative.content
    }
    if (activeTab === tabs.website) {
      return queriesData.website.content
    }
    if (activeTab === tabs.avatar) {
      return queriesData.avatar.content
    }
    return ''
  }, [activeTab, queriesData])

  const content = useMemo(() => {
    if (activeTab === tabs.narrative) {
      return queriesData.narrative.content ?? t('ai.noDataNarrative')
    }
    if (activeTab === tabs.website) {
      return queriesData.website.content ?? t('ai.noDataWebsite')
    }
    if (activeTab === tabs.avatar) {
      return queriesData.avatar.content ?? t('ai.noDataAvatar')
    }
    return t('ai.noDataNarrative')
  }, [activeTab, queriesData])

  const isLoading = useMemo(() => {
    if (activeTab === tabs.narrative) {
      return queriesData.narrative.isLoading
    }
    if (activeTab === tabs.website) {
      return queriesData.website.isLoading
    }
    if (activeTab === tabs.avatar) {
      return queriesData.avatar.isLoading
    }
    return false
  }, [activeTab, queriesData])

  useEffect(() => {
    const p = pRef.current
    const button = buttonRef.current
    if (!p || !button) return
    // Check if the content is longer than 3 lines
    const lineHeight = parseFloat(getComputedStyle(p).lineHeight)
    const maxLines = 5
    const maxHeight = Math.round(maxLines * lineHeight)
    const isLong = p.scrollHeight > maxHeight
    if (!isLong) {
      button.classList.add('hidden')
    } else {
      button.classList.remove('hidden')
    }
  }, [pRef.current, buttonRef.current, content, isExpanded])

  return (
    <div className="mt-5 rounded-xl w-full max-w-3xl text-white">
      <h2 className="text-sm app-font-medium">{t('ai.onchainTextTitle')}</h2>

      <div className="mt-4 mb-2.5 flex gap-2">
        {Object.values(tabs).map((tab) => (
          <Button
            key={tab}
            variant={activeTab === tab ? 'gradient' : 'secondary'}
            onClick={() => setActiveTab(tab)}
            className="flex-shrink-0 flex-grow-0 px-3.5 py-1.5 text-sm app-font-medium rounded-full h-7 transition-all duration-50 w-fit"
            style={getTabStyle(tab)}
          >
            {tab}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <Thinking />
      ) : (
        <div
          className={cn(
            'text-[calc(1rem*(13/16))] leading-none text-[#908e98] bg-[#18181d] border-[0.5px] border-[#25242b] rounded-[8px] p-2',
          )}
        >
          <p
            ref={pRef}
            className={cn(
              'text-[calc(1rem*(13/16))] leading-normal font-[330] transition-all text-ellipsis',
              isExpanded ? '' : 'line-clamp-5',
            )}
          >
            <Markdown>{content}</Markdown>
          </p>
          {rawContent && rawContent.length > 0 && (
            <button ref={buttonRef} onClick={() => setIsExpanded(!isExpanded)} className="text-[#1890FF]">
              {isExpanded ? t('ai.collapse') : t('ai.expand')}
            </button>
          )}
        </div>
      )}

      <div className="mt-2 text-[calc(1rem*(11/16))] leading-none text-[#605e68] font-[330] flex items-center gap-1.5">
        <span>{t('ai.onchainTextNote')}</span>
      </div>
    </div>
  )
}

export default OnChainTextAnalysis
