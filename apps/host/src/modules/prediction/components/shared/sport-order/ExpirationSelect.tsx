import { useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { ExpirationDateDialog } from './ExpirationDateDialog'

interface ExpirationSelectProps {
  enabled: boolean
  setEnabled: (enabled: boolean) => void
  value: string
  setValue: (value: string) => void
  setCustomDate: (date: Date) => void
}

export const ExpirationSelect = ({
  enabled,
  setEnabled,
  value,
  setValue,
  setCustomDate,
}: ExpirationSelectProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleValueChange = (val: string) => {
    if (val === 'custom') {
      setIsDialogOpen(true)
    }
    setValue(val)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-muted-foreground">Set Expiration</span>
        <Switch checked={enabled} onCheckedChange={setEnabled} />
      </div>

      {enabled && (
        <>
          <Select value={value} onValueChange={handleValueChange}>
            <SelectTrigger className="w-full bg-white/5 border-white/10 text-text h-10">
              <SelectValue placeholder="Select duration" />
            </SelectTrigger>
            <SelectContent className="bg-[#1C1C1E] border-white/10 text-white">
              <SelectItem value="30_seconds">In 30 seconds</SelectItem>
              <SelectItem value="10_minutes">In 10 Minutes</SelectItem>
              <SelectItem value="end_of_day">End of day</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>

          <ExpirationDateDialog
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            onApply={(date) => {
              setCustomDate(date)
              setValue('custom')
            }}
          />
        </>
      )}
    </div>
  )
}

