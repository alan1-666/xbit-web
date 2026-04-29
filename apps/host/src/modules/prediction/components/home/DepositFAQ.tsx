import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { SimpleTooltip } from '@/components/v2/ui-shared/components/SimpleTooltip'
import { ChevronDown, Clock, FileText, Info } from 'lucide-react'

const DepositFAQ = () => {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="stats" className="border-none">
        <AccordionTrigger
          className="hover:no-underline py-3 px-4  bg-[#2d2d35] rounded-xl data-[state=open]:rounded-b-none transition-all duration-200 flex justify-between"
          icon={<ChevronDown className="size-4 shrink-0 transition-transform duration-200" />}
        >
          <span className="flex items-center gap-2 text-foreground font-medium text-sm">
            <div className="bg-neutral-800 rounded-full w-5 h-5 flex items-center justify-center">
              <span className="text-[10px] font-bold">$</span>
            </div>
            Price impact: 0.00%{' '}
            <SimpleTooltip
              content={
                <div className="max-w-[250px] space-y-2">
                  <p>
                    Price impact is the difference between expected and execution price, due to trade size and
                    liquidity.
                  </p>
                  <p>Final cost may vary based on network conditions. Costs are reduced for larger amounts.</p>
                  <a href="#" className="underline font-medium hover:text-blue-500">
                    Learn more
                  </a>{' '}
                  about the pricing breakdown.
                </div>
              }
            >
              <Info className="size-3 text-muted-foreground cursor-help" />
            </SimpleTooltip>
          </span>
        </AccordionTrigger>
        <AccordionContent className=" bg-[#2d2d35] px-4 pb-3 rounded-b-xl space-y-3 pt-0">
          <div className="flex justify-between items-center text-sm">
            <span className="flex items-center gap-2">
              <div className="bg-neutral-800 rounded-full w-5 h-5 flex items-center justify-center">
                <span className="text-[10px] font-bold">%</span>
              </div>
              Max slippage: <span className="text-foreground font-medium">Auto • 0.05%</span>{' '}
              <SimpleTooltip
                content={
                  <div className="max-w-[250px] space-y-2">
                    <p>
                      Slippage accounts for price changes during execution. Slippage is adjusted per pair to ensure
                      reliable execution.
                    </p>
                    <p>
                      Final cost may vary based on network conditions. Costs are reduced for larger amounts.
                    </p>
                    <a href="#" className="underline font-medium hover:text-blue-500">
                      Learn more
                    </a>{' '}
                    about the pricing breakdown.
                  </div>
                }
              >
                <Info className="size-3 text-muted-foreground cursor-help" />
              </SimpleTooltip>
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="flex items-center gap-2">
              <div className="bg-neutral-800 rounded-full w-5 h-5 flex items-center justify-center">
                <Clock className="size-3" />
              </div>
              Processing time: <span className="text-foreground font-medium">&lt; 1 min</span>
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="flex items-center gap-2 mt-1">
              <div className="bg-neutral-800 rounded-full w-5 h-5 flex items-center justify-center">
                <FileText className="size-3" />
              </div>
              Have questions?{' '}
              <a href="#" className="underline text-foreground">
                Get help
              </a>
            </span>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

export default DepositFAQ
