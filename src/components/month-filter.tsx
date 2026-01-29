'use client'

import { generateMonthOptions } from '@/lib/helpers'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface MonthFilterProps {
  value: string
  onChange: (value: string) => void
}

export function MonthFilter({ value, onChange }: MonthFilterProps) {
  const monthOptions = generateMonthOptions()

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[180px] bg-slate-800 border-slate-600 text-white">
        <SelectValue placeholder="月を選択" />
      </SelectTrigger>
      <SelectContent className="bg-slate-800 border-slate-600">
        <SelectItem value="all" className="text-white hover:bg-slate-700">
          すべての月
        </SelectItem>
        {monthOptions.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            className="text-white hover:bg-slate-700"
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
