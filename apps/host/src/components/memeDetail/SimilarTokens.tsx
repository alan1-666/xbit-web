import { useSimilarTokens } from '@pages/meme/discover/desktop/hooks/useSimilarTokens.ts'
import { Skeleton } from '@components/ui/skeleton.tsx'
import { useTranslation } from 'react-i18next'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@components/ui/accordion.tsx'
import { SimilarToken } from '@components/memeDetail/SimilarToken.tsx'

export interface SimilarTokensProps {
  token: string
  chainId: number
}

export const SimilarTokens = (props: SimilarTokensProps) => {
  const { token, chainId } = props
  const { data = [], isLoading } = useSimilarTokens({ token: token, chainId: chainId })
  const { t } = useTranslation()
  return (
    <Accordion type="single" collapsible defaultValue="openSimilarTokens">
      <AccordionItem value="openSimilarTokens" className="border-b-0">
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between">
            <AccordionTrigger className="[&[data-state=open]>svg]:rotate-0 [&[data-state=closed]>svg]:-rotate-90 py-0">
              <div className="text-[calc(14rem/16)] flex items-center gap-2 cursor-pointer">
                <span>{t('listCoin.tooltip.similarTokens')}</span>
              </div>
            </AccordionTrigger>
          </div>
          <AccordionContent className="border-[0.5px] border-[#ECECED1F] rounded-[4px]">
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="w-full h-8" />
                ))}
              </div>
            ) : (
              <div className="space-y-0">
                {data.map((item) => (
                  <SimilarToken
                    key={item.token}
                    token={item}
                    className="mb-0 border-none hover:bg-[#ECECED14] rounded-none"
                  />
                ))}
              </div>
            )}
          </AccordionContent>
        </div>
      </AccordionItem>
    </Accordion>
  )
}
