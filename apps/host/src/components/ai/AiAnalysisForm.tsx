import { MouseEvent, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@components/ui/button.tsx'
import { clsx } from 'clsx'
import {useAiAnalysis} from "@hooks/useAiAnalysis.ts";
import { IconEmpty, IconWave } from '@components/icon'
import {cn} from "@/lib/utils.ts";
import styles from "@/styles/ai.module.scss";
import Markdown from "react-markdown";

interface AiAnalysisFormProps {
  className?: string
  tokenAddress?: string
  enabled?: boolean
}


function Thinking() {
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
    <div className="flex items-center overflow-hidden">
      <IconWave className="drop-shadow-[0px_1px_4px_#A162F7] icon-wave overflow-hidden" />
      <span className="text-[calc(13rem/16)] text-[#FFFFFFCC] ml-2 font-normal mb-4.5">
        {(t('ai.analyzing') as string).replace('...', '')}
        {dots}
      </span>
    </div>
  )
}

function Answer(props: { output: string }) {
  const { output } = props
  const { t } = useTranslation()
  if (!output)
    return (
      <div className="text-[#FFFFFFCC] text-[calc(13rem/16)] flex flex-col items-center justify-center h-32">
        <IconEmpty />
        <span>{t('listCoin.noData')}</span>
      </div>
    )
  return (
    <div className={cn('text-[#FFFFFFCC] text-[calc(13rem/16)] overflow-y-auto no-scrollbar', styles['ai-content'])}>
      <Markdown>{output}</Markdown>
    </div>
  )
}

export const AiAnalysisForm = (props: AiAnalysisFormProps) => {
  const { className, tokenAddress, enabled } = props
  const [selectedKey, setSelectedKey] = useState<string>('narrative')
  const { t } = useTranslation()
  const buttons = [
    {
      key: 'narrative',
      label: t('ai.buttons.narrativeTheme'),
    },
    {
      key: 'website',
      label: t('ai.buttons.websiteAnalysis'),
    },
    {
      key: 'avatar',
      label: t('ai.buttons.avatarAnalysis'),
    },
  ]

  const handleTabChange = (event: MouseEvent<HTMLButtonElement>, key: string) => {
    event.stopPropagation()
    setSelectedKey(key)
  }

  const queriesData = useAiAnalysis({
    tokenAddress: tokenAddress,
    enabled,
  })

  const content = useMemo(() => {
    if (selectedKey === 'narrative') {
      return queriesData.narrative.content ?? t('ai.noDataNarrative')
    }
    if (selectedKey === 'website') {
      return queriesData.website.content ?? t('ai.noDataWebsite')
    }
    if (selectedKey === 'avatar') {
      return queriesData.avatar.content ?? t('ai.noDataAvatar')
    }
    return t('ai.noDataNarrative')
  }, [selectedKey, queriesData])

  const isLoading = useMemo(() => {
    if (selectedKey === 'narrative') {
      return queriesData.narrative.isLoading
    }
    if (selectedKey === 'website') {
      return queriesData.website.isLoading
    }
    if (selectedKey === 'avatar') {
      return queriesData.avatar.isLoading
    }
    return false
  }, [selectedKey, queriesData])

  return (
    <div className={className}>
      <div className="mb-4">
        {buttons.map((button) => (
          <Button
            key={button.key}
            size="xs"
            className={clsx(
              'rounded-full text-[0.875rem] mr-2 transition-all duration-200 ease-in-out relative overflow-hidden',
              button.key === selectedKey ? 'font-medium text-white' : 'text-[#FFFFFFB3] font-normal',
            )}
            style={{
              background:
                button.key === selectedKey ? 'linear-gradient(2.78deg, #9c2cff 1.71%, #ff5eff 103.06%)' : '#ECECED14',
            }}
            onClick={(event) => handleTabChange(event, button.key)}
          >
            {button.label}
          </Button>
        ))}
      </div>
      <div className="flex-1 mb-4 overflow-y-auto no-scrollbar pointer-events-auto select-text">
        {isLoading ? <Thinking /> : <Answer output={content as string} />}
      </div>
    </div>
  )
}
