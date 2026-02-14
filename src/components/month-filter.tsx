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
      <SelectTrigger className="w-[180px] glass-card border-white/10 text-white hover:border-cinema-gold/30 transition-colors">
        <SelectValue placeholder="公開年月を選択" />
      </SelectTrigger>
      <SelectContent className="glass-card border-white/10">
        {monthOptions.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            className="text-white hover:bg-cinema-gold/10 focus:bg-cinema-gold/10 focus:text-white"
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
