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
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Search, Filter, X } from "lucide-react"

// Matches the full industry list used across the platform (company create + admin settings)
const INDUSTRIES = [
  "Technology",
  "Finance",
  "Healthcare",
  "Education",
  "E-commerce",
  "Design",
  "Marketing",
  "Agriculture",
  "Manufacturing",
  "Social Impact",
  "Other",
]

export function ChallengeFilters() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const { replace } = useRouter()

  const [query, setQuery] = useState(searchParams.get("q") || "")
  const [sort, setSort] = useState(searchParams.get("sort") || "newest")
  const [difficulty, setDifficulty] = useState(searchParams.get("difficulty") || "all")
  const [participationType, setParticipationType] = useState(searchParams.get("participation_type") || "all")
  const [entryType, setEntryType] = useState(searchParams.get("entry_type") || "all")

  // ── Multi-select industry state ──────────────────────────────────
  // URL param is comma-separated: ?category=Technology,Finance
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>(() => {
    const raw = searchParams.get("category")
    return raw ? raw.split(",").filter(Boolean) : []
  })

  const hasActiveFilters =
    !!query ||
    selectedIndustries.length > 0 ||
    sort !== "newest" ||
    difficulty !== "all" ||
    participationType !== "all" ||
    entryType !== "all"

  // ── Debounced search ─────────────────────────────────────────────
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

  // ── Generic single-value filter ──────────────────────────────────
  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== "all") {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    replace(`${pathname}?${params.toString()}`)
  }

  // ── Industry checkbox toggle ─────────────────────────────────────
  const toggleIndustry = (industry: string) => {
    const next = selectedIndustries.includes(industry)
      ? selectedIndustries.filter((i) => i !== industry)
      : [...selectedIndustries, industry]

    setSelectedIndustries(next)

    const params = new URLSearchParams(searchParams.toString())
    if (next.length > 0) {
      params.set("category", next.join(","))
    } else {
      params.delete("category")
    }
    replace(`${pathname}?${params.toString()}`)
  }

  // ── Clear all ────────────────────────────────────────────────────
  const handleClear = () => {
    setQuery("")
    setSelectedIndustries([])
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

      {/* Row 1: Search + Sort */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="relative md:col-span-2">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title or description..."
            className="pl-8"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

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

      {/* Row 3: Industry multi-checkbox ─────────────────────────── */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">
          Industry{" "}
          <span className="text-xs font-normal text-muted-foreground">
            (select all that apply)
          </span>
          {selectedIndustries.length > 0 && (
            <span className="ml-2 inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
              {selectedIndustries.length} selected
            </span>
          )}
        </p>


        <div className="rounded-md border p-3">
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
            {INDUSTRIES.map((industry) => {
              const id = `industry-${industry}`
              const checked = selectedIndustries.includes(industry)
              return (
                <div key={industry} className="flex items-center space-x-2">
                  <Checkbox
                    id={id}
                    checked={checked}
                    onCheckedChange={() => toggleIndustry(industry)}
                    aria-label={industry}
                  />
                  <Label
                    htmlFor={id}
                    className="cursor-pointer text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {industry}
                  </Label>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}