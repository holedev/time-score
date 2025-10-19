"use client"
import { ChevronDownIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useCallback, useEffect, useState } from "react"

type DateTimePickerProps = {
  /** The currently selected date and time */
  value?: Date
  /** Callback fired when the date or time changes */
  onChange?: (date: Date | undefined) => void
  /** Whether the date-time picker is disabled */
  disabled?: boolean
  /** Placeholder text for the date button when no date is selected */
  datePlaceholder?: string
  /** ID for the date picker element (for accessibility) */
  datePickerId: string
  /** ID for the time picker element (for accessibility) */
  timePickerId: string
  /** Optional CSS class name for the container */
  className?: string
  /** Optional label for the date field */
  dateLabel?: string
  /** Optional label for the time field */
  timeLabel?: string
}

export function DateTimePicker({
  value,
  onChange,
  disabled = false,
  datePlaceholder = "Chọn ngày",
  datePickerId,
  timePickerId,
  className = "",
  dateLabel = "Ngày",
  timeLabel = "Giờ",
}: DateTimePickerProps) {
  const [open, setOpen] = useState(false)

  // Extract time from the value prop as HH:MM:SS
  const getTimeString = useCallback((date?: Date): string => {
    if (!date) return "00:00:00"
    
    const hours = date.getHours().toString().padStart(2, "0")
    const minutes = date.getMinutes().toString().padStart(2, "0")
    const seconds = date.getSeconds().toString().padStart(2, "0")
    
    return `${hours}:${minutes}:${seconds}`
  }, [])

  const [date, setDate] = useState<Date | undefined>(value)
  const [timeString, setTimeString] = useState<string>(getTimeString(value))

  // Update internal state when value prop changes
  useEffect(() => {
    setDate(value)
    setTimeString(getTimeString(value))
  }, [value, getTimeString])

  // Combine date and time into a single Date object
  const handleDateChange = useCallback((newDate: Date | undefined) => {

    console.info('[date-time-picker.tsx:72] ', newDate)
    setDate(newDate)
    
    if (newDate && onChange) {
      const [hours, minutes, seconds] = timeString.split(":").map(Number)
      const updatedDate = new Date(newDate)
      updatedDate.setHours(hours, minutes, seconds)
      onChange(updatedDate)
    } else if (onChange) {
      onChange(undefined)
    }
    
    setOpen(false)
  }, [timeString, onChange])

  // Handle time input changes
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTimeString = e.target.value
    setTimeString(newTimeString)
    
    if (date && onChange) {
      const [hours, minutes, seconds] = newTimeString.split(":").map(Number)
      const newDateTime = new Date(date)
      newDateTime.setHours(hours || 0, minutes || 0, seconds || 0)
      onChange(newDateTime)
    }
  }

  return (
    <div className={`flex gap-2 ${className}`}>
      <div className="flex flex-col gap-3 flex-2/3">
        {dateLabel && (
          <Label htmlFor={datePickerId} className="px-1">
            {dateLabel}
          </Label>
        )}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild >
            <Button
              variant="outline"
              id={datePickerId}
              className="w-full justify-between font-normal"
              disabled={disabled}
              type="button"
              aria-label="Select date"
            >
              {date ? date.toLocaleDateString() : datePlaceholder}
              <ChevronDownIcon className="h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="flex" align="start">
            <Calendar
              mode="single"
              selected={date}
              captionLayout="dropdown"
              className="flex-1 pointer-events-auto"
              onSelect={handleDateChange}
              disabled={disabled}
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex flex-col gap-3 flex-1/3">
        {timeLabel && (
          <Label htmlFor={timePickerId} className="px-1">
            {timeLabel}
          </Label>
        )}
        <Input
          type="time"
          id={timePickerId}
          step="1"
          value={timeString}
          onChange={handleTimeChange}
          disabled={disabled}
          className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
          aria-label="Select time"
        />
      </div>
    </div>
  )
}
