"use client"

import { useState } from "react"
import { CalendarIcon, Clock, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"

interface DatePickerProps {
  selectedDate: Date | undefined
  onDateChange: (date: Date | undefined) => void
}

export function DatePicker({ selectedDate, onDateChange }: DatePickerProps) {
  const [open, setOpen] = useState(false)

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDateChange(undefined)
  }

  return (
    <div className="space-y-1">
      <div className="flex gap-1">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 justify-start bg-background/50 hover:bg-background/80 transition-colors relative"
            >
              <CalendarIcon className="w-3.5 h-3.5 mr-2" />
              <span className="text-sm">{selectedDate ? selectedDate.toLocaleDateString() : "Select date"}</span>
              <Clock className="w-3 h-3 ml-auto opacity-60" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                onDateChange(date)
                setOpen(false)
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        {selectedDate && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="h-8 w-8 p-0 shrink-0"
            title="Clear date filter"
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>
      {selectedDate && (
        <p className="text-xs text-muted-foreground flex items-center gap-1 px-1">
          <Clock className="w-3 h-3" />
          Time Machine active
        </p>
      )}
    </div>
  )
}
