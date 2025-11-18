"use client"

import React, { useEffect, useState } from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface ComboboxProps<T> {
  data: T[]
  displayKey: keyof T
  onSelect: (item: T | null) => void
  placeholder?: string
  clearLabel?: string
  width?: string
  selectedValue?: T | null // <--- novo
}

export function Combobox<T>({
  data,
  displayKey,
  onSelect,
  placeholder = "Select an option",
  clearLabel = "Clear",
  width = "225px",
  selectedValue, // <--- novo
}: ComboboxProps<T>) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<T | null>(null)

  useEffect(() => {
    setSelected(selectedValue ?? null)
  }, [selectedValue])

  const handleClick = (item: T) => {
    const isSelected = selected && selected[displayKey] === item[displayKey]
    const newValue = isSelected ? null : item
    setSelected(newValue)
    onSelect(newValue)
    setOpen(false)
  }

  const handleSelect = (item: T) => {
    const isSelected = selected && selected[displayKey] === item[displayKey]
    const newValue = isSelected ? null : item
    setSelected(newValue)
    onSelect(newValue)
    setOpen(false)
  }

  const handleClear = () => {
    setSelected(null)
    onSelect(null)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen} modal>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between font-normal",
            !selected && "text-muted-foreground"
          )}
        >
          {selected ? String(selected[displayKey]) : placeholder}
          <ChevronsUpDown className="ml-1 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder={placeholder} />
          <CommandList>
            <CommandEmpty>No items found.</CommandEmpty>
            <CommandGroup>
              {data.map((item, index) => (
                <CommandItem
                  key={index}
                  value={String(item[displayKey])}
                  onMouseDown={(e)=> {
                    e.preventDefault()
                    handleClick(item)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selected &&
                      selected[displayKey] === item[displayKey]
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  {String(item[displayKey])}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
        {selected && (
          <div className="border-t p-2">
            <Button
              variant="ghost"
              onClick={handleClear}
              size="sm"
              className="w-full justify-start text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4 mr-2" />
              {clearLabel}
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
