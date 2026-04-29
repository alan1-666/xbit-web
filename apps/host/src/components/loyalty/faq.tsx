import { useResponsive } from '@/hooks/useResponsive'
import { cn } from '@/lib/utils'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@components/ui/accordion'
import { ChevronDown } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

const LoyaltyFAQ = () => {
  const { t } = useTranslation()
  const { isDesktop } = useResponsive()
  const [openItem, setOpenItem] = useState<string>('')
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map())

  const faqList = [
    {
      question: t('loyalty.faq.whatIsPoint'),
      answer: t('loyalty.faq.whatIsPointAnswer'),
    },
    {
      question: t('loyalty.faq.howToEarn'),
      answer: t('loyalty.faq.howToEarnAnswer'),
    },
    {
      question: t('loyalty.faq.airdropRelation'),
      answer: t('loyalty.faq.airdropRelationAnswer'),
    },
    {
      question: t('loyalty.faq.tradingPoint'),
      answer: t('loyalty.faq.tradingPointAnswer'),
    },
  ]

  useEffect(() => {
    if (openItem && itemRefs.current.has(openItem)) {
      setTimeout(() => {
        const element = itemRefs.current.get(openItem)
        element?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          inline: 'nearest',
        })
      }, 250)
    }
  }, [openItem])

  const setItemRef = (question: string) => (el: HTMLDivElement | null) => {
    if (el) {
      itemRefs.current.set(question, el)
    } else {
      itemRefs.current.delete(question)
    }
  }

  return (
    <div className={cn('flex flex-col gap-[14px] w-full mx-auto pb-[32px]', isDesktop && 'pt-[32px]')}>
      <h2
        className={cn('text-[16px] font-medium xl:mb-[14px] text-[#cacaca]', !isDesktop && 'font-[380] text-[#FBFBFB]')}
      >
        {t('loyalty.faq.title')}
      </h2>
      <Accordion
        type="single"
        collapsible
        className="w-full flex flex-col gap-[10px]"
        value={openItem}
        onValueChange={setOpenItem}
      >
        {faqList.map((item, idx) => (
          <AccordionItem key={idx} value={item.question} className="border-none" ref={setItemRef(item.question)}>
            <AccordionTrigger
              className={cn(
                'bg-[#141418] rounded-t-[8px] px-[20px] py-[12px] text-[14px] font-medium text-[#cacaca] flex justify-between h-[52px]',
                openItem === item.question ? 'rounded-b-none' : 'rounded-b-[8px]',
              )}
              icon={
                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-250" />
              }
            >
              {item.question}
            </AccordionTrigger>
            {item.answer && (
              <AccordionContent className="bg-[#141418] rounded-b-[8px] px-[20px] pb-[16px] text-[13px] text-[#52526e]">
                {item.answer}
              </AccordionContent>
            )}
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}

export default LoyaltyFAQ
