import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'

export const HistoryExportButton = ({ className }: { className?: string }) => {
  const { t } = useTranslation()
  return (
    <Button
      variant="outline"
      className={cn(
        'flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-sm border border-white/10 bg-transparent px-4 text-sm font-medium text-gray-400 transition hover:border-white/20 hover:text-gray-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
        className
      )}
    >
      <Download size={14} />
      {t('prediction.common.export')}
    </Button>
  )
}
