"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCallback, useEffect, useState } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export const ChallengeFilters = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Local state for immediate UI feedback
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "")
  
  // Debounce the search URL update
  useEffect(() => {
    const timer = setTimeout(() => {
      updateURL({ q: searchQuery })
    }, 500) // 500ms delay

    return () => clearTimeout(timer)
  }, [searchQuery])

  const updateURL = useCallback(
    (updates: { q?: string; difficulty?: string; status?: string }) => {
      const params = new URLSearchParams(searchParams.toString())
      
      if (updates.q !== undefined) {
        updates.q ? params.set("q", updates.q) : params.delete("q")
      }
      
      if (updates.difficulty !== undefined) {
        updates.difficulty && updates.difficulty !== "all" 
          ? params.set("difficulty", updates.difficulty) 
          : params.delete("difficulty")
      }
      
      if (updates.status !== undefined) {
        updates.status && updates.status !== "all" 
          ? params.set("status", updates.status) 
          : params.delete("status")
      }
      
      router.push(`?${params.toString()}`)
    },
    [searchParams, router]
  )

  return (
    <div className="grid gap-4 md:grid-cols-4 rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
      {/* Search Bar */}
      <div className="md:col-span-2 space-y-2">
        <Label htmlFor="search">Search</Label>
        <Input
          id="search"
          placeholder="Search by title or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Difficulty Filter */}
      <div className="space-y-2">
        <Label>Difficulty</Label>
        <Select 
          defaultValue={searchParams.get("difficulty") || "all"}
          onValueChange={(val) => updateURL({ difficulty: val })}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Levels" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Status Filter */}
      <div className="space-y-2">
        <Label>Status</Label>
        <Select 
          defaultValue={searchParams.get("status") || "all"}
          onValueChange={(val) => updateURL({ status: val })}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="approved">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}













