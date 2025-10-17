"use client"

import { useState } from "react"
import { Filter, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

export type EventType = "conflict" | "economic" | "political" | "natural"
export type ImpactLevel = "high" | "medium" | "low"

interface EventFiltersProps {
  selectedTypes: EventType[]
  selectedImpacts: ImpactLevel[]
  onTypesChange: (types: EventType[]) => void
  onImpactsChange: (impacts: ImpactLevel[]) => void
}

export function EventFilters({ selectedTypes, selectedImpacts, onTypesChange, onImpactsChange }: EventFiltersProps) {
  const [isOpen, setIsOpen] = useState(true)

  const eventTypes: { value: EventType; label: string; color: string }[] = [
    { value: "economic", label: "Economic", color: "bg-blue-500" },
    { value: "political", label: "Political", color: "bg-purple-500" },
    { value: "conflict", label: "Conflict", color: "bg-red-500" },
    { value: "natural", label: "Natural", color: "bg-green-500" },
  ]

  const impactLevels: { value: ImpactLevel; label: string }[] = [
    { value: "high", label: "High Impact" },
    { value: "medium", label: "Medium Impact" },
    { value: "low", label: "Low Impact" },
  ]

  const toggleType = (type: EventType) => {
    if (selectedTypes.includes(type)) {
      onTypesChange(selectedTypes.filter((t) => t !== type))
    } else {
      onTypesChange([...selectedTypes, type])
    }
  }

  const toggleImpact = (impact: ImpactLevel) => {
    if (selectedImpacts.includes(impact)) {
      onImpactsChange(selectedImpacts.filter((i) => i !== impact))
    } else {
      onImpactsChange([...selectedImpacts, impact])
    }
  }

  const clearAll = () => {
    onTypesChange([])
    onImpactsChange([])
  }

  const activeFiltersCount = selectedTypes.length + selectedImpacts.length

  return (
    <div className="absolute left-4 top-4 z-10 w-72">
      <div className="bg-card/95 backdrop-blur-sm border border-border rounded-lg shadow-lg overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <h3 className="font-semibold text-sm">Filters</h3>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            {activeFiltersCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearAll} className="h-7 text-xs">
                Clear
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)} className="h-7 w-7">
              {isOpen ? <X className="w-4 h-4" /> : <Filter className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {isOpen && (
          <div className="p-4 space-y-6">
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Event Type</h4>
              <div className="space-y-2">
                {eventTypes.map((type) => (
                  <div key={type.value} className="flex items-center gap-2">
                    <Checkbox
                      id={type.value}
                      checked={selectedTypes.includes(type.value)}
                      onCheckedChange={() => toggleType(type.value)}
                    />
                    <Label htmlFor={type.value} className="flex items-center gap-2 cursor-pointer text-sm">
                      <div className={`w-2 h-2 rounded-full ${type.color}`} />
                      {type.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Impact Level</h4>
              <div className="space-y-2">
                {impactLevels.map((impact) => (
                  <div key={impact.value} className="flex items-center gap-2">
                    <Checkbox
                      id={impact.value}
                      checked={selectedImpacts.includes(impact.value)}
                      onCheckedChange={() => toggleImpact(impact.value)}
                    />
                    <Label htmlFor={impact.value} className="cursor-pointer text-sm">
                      {impact.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
