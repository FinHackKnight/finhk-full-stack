"use client"

import { useState } from "react"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

const categories = [
  { id: "oil", label: "Oil & Energy", color: "bg-amber-500" },
  { id: "education", label: "Education", color: "bg-blue-500" },
  { id: "environment", label: "Environment", color: "bg-emerald-500" },
  { id: "technology", label: "Technology", color: "bg-purple-500" },
  { id: "politics", label: "Politics", color: "bg-rose-500" },
  { id: "economy", label: "Economy", color: "bg-cyan-500" },
]

interface CategoryFilterProps {
  selectedCategories: string[]
  onCategoriesChange: (categories: string[]) => void
}

export function CategoryFilter({ selectedCategories, onCategoriesChange }: CategoryFilterProps) {
  const [open, setOpen] = useState(false)

  const toggleCategory = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      onCategoriesChange(selectedCategories.filter((id) => id !== categoryId))
    } else {
      onCategoriesChange([...selectedCategories, categoryId])
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start bg-background/50 hover:bg-background/80 transition-colors"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span>Categories</span>
            {selectedCategories.length > 0 && (
              <span className="ml-auto text-xs text-muted-foreground">({selectedCategories.length})</span>
            )}
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2" align="start">
        <div className="space-y-1">
          {categories.map((category) => {
            const isSelected = selectedCategories.includes(category.id)
            return (
              <button
                key={category.id}
                onClick={() => toggleCategory(category.id)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent transition-colors text-sm"
              >
                <div
                  className={`w-3 h-3 rounded-full ${category.color} transition-transform ${isSelected ? "scale-110" : "scale-100"}`}
                />
                <span className="flex-1 text-left">{category.label}</span>
                {isSelected && <Check className="w-4 h-4 text-primary" />}
              </button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
