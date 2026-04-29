import { useState } from 'react'
import { Calendar } from '@/components/ui/calendar'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { format } from 'date-fns'

interface ExpirationDateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onApply: (date: Date) => void
}

export const ExpirationDateDialog = ({ open, onOpenChange, onApply }: ExpirationDateDialogProps) => {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [time, setTime] = useState(format(new Date(), 'HH:mm'))

  const [month, setMonth] = useState<Date>(new Date())

  const handleApply = () => {
    if (!date) return
    const [hours, minutes] = time.split(':').map(Number)
    const newDate = new Date(date)
    newDate.setHours(hours, minutes)
    onApply(newDate)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] bg-[#1C1C1E] border-white/10 text-white p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-4 border-b border-white/10">
          <DialogTitle className="text-center text-base font-semibold">Date</DialogTitle>
        </DialogHeader>

        <div className="p-4 flex flex-col items-center">
          <Calendar
            mode="single"
            defaultMonth={date}
            month={month}
            onMonthChange={setMonth}
            selected={date}
            onSelect={setDate}
            numberOfMonths={1}
            disabled={{ before: new Date() }}
            fromDate={new Date()}
            className="rounded-md border border-white/10 mb-4 bg-white/5"
          />

          <div className="w-full space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Time</label>
            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="bg-white/5 border-white/10 text-white w-full [&::-webkit-calendar-picker-indicator]:hidden"
            />
          </div>
        </div>

        <DialogFooter className="p-4 border-t border-white/10">
          <Button onClick={handleApply} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
