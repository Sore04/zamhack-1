"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, Filter, X } from "lucide-react"

export function ChallengeFilters() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const { replace } = useRouter()

  const [query, setQuery] = useState(searchParams.get("q") || "")
  const [category, setCategory] = useState(searchParams.get("category") || "all")
  const [sort, setSort] = useState(searchParams.get("sort") || "newest")
  const [difficulty, setDifficulty] = useState(searchParams.get("difficulty") || "all")
  const [participationType, setParticipationType] = useState(searchParams.get("participation_type") || "all")
  const [entryType, setEntryType] = useState(searchParams.get("entry_type") || "all")

  const hasActiveFilters =
    !!query ||
    category !== "all" ||
    sort !== "newest" ||
    difficulty !== "all" ||
    participationType !== "all" ||
    entryType !== "all"

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (query) {
        params.set("q", query)
      } else {
        params.delete("q")
      }
      replace(`${pathname}?${params.toString()}`)
    }, 300)
    return () => clearTimeout(timer)
  }, [query]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== "all") {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    replace(`${pathname}?${params.toString()}`)
  }

  const handleClear = () => {
    setQuery("")
    setCategory("all")
    setSort("newest")
    setDifficulty("all")
    setParticipationType("all")
    setEntryType("all")
    replace(pathname)
  }

  return (
    <div className="space-y-4 bg-card p-4 rounded-lg border shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
          <Filter className="h-4 w-4" />
          Filter Challenges
        </h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="h-8 text-xs text-muted-foreground hover:text-foreground"
          >
            <X className="mr-1 h-3 w-3" />
            Clear All
          </Button>
        )}
      </div>

      {/* Row 1: Search + Category + Sort */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title or description..."
            className="pl-8"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <Select
          value={category}
          onValueChange={(val) => {
            setCategory(val)
            handleFilterChange("category", val)
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Technology">Technology & Coding</SelectItem>
            <SelectItem value="Design">Design & Creative</SelectItem>
            <SelectItem value="Business">Business & Marketing</SelectItem>
            <SelectItem value="Social Impact">Social Impact</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={sort}
          onValueChange={(val) => {
            setSort(val)
            handleFilterChange("sort", val)
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="closing_soon">Closing Soon</SelectItem>
            <SelectItem value="participants_high">Most Popular</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Row 2: Difficulty + Participation Type + Entry Type */}
      <div className="grid gap-4 md:grid-cols-3">
        <Select
          value={difficulty}
          onValueChange={(val) => {
            setDifficulty(val)
            handleFilterChange("difficulty", val)
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Difficulty Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="beginner">🟢 Beginner</SelectItem>
            <SelectItem value="intermediate">🟡 Intermediate</SelectItem>
            <SelectItem value="advanced">🔴 Advanced</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={participationType}
          onValueChange={(val) => {
            setParticipationType(val)
            handleFilterChange("participation_type", val)
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Participation Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Solo & Team</SelectItem>
            <SelectItem value="solo">👤 Solo Only</SelectItem>
            <SelectItem value="team">👥 Team Only</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={entryType}
          onValueChange={(val) => {
            setEntryType(val)
            handleFilterChange("entry_type", val)
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Entry Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Challenges</SelectItem>
            <SelectItem value="free">🆓 Free Entry</SelectItem>
            <SelectItem value="paid">💳 Paid Entry</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}