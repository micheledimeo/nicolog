"use client"

import { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Line, Bar, XAxis, YAxis, ResponsiveContainer, ComposedChart } from "recharts"

interface CigaretteEntry {
  id: string
  timestamp: Date
  mood: number
  urgency: number
  waited10Minutes: boolean
  smoked: boolean
  isSpecial: boolean
  notes: string
}

interface ReportPageProps {
  entries: CigaretteEntry[]
}

export function ReportPage({ entries }: ReportPageProps) {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [timeFilter, setTimeFilter] = useState<"day" | "week" | "month">("day")

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("it-IT", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  const navigateDate = (direction: "prev" | "next") => {
    const newDate = new Date(selectedDate)
    if (timeFilter === "day") {
      newDate.setDate(newDate.getDate() + (direction === "next" ? 1 : -1))
    } else if (timeFilter === "week") {
      newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7))
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1))
    }
    setSelectedDate(newDate)
  }

  const filteredEntries = useMemo(() => {
    const startDate = new Date(selectedDate)
    const endDate = new Date(selectedDate)

    if (timeFilter === "day") {
      startDate.setHours(0, 0, 0, 0)
      endDate.setHours(23, 59, 59, 999)
    } else if (timeFilter === "week") {
      const dayOfWeek = startDate.getDay()
      startDate.setDate(startDate.getDate() - dayOfWeek)
      startDate.setHours(0, 0, 0, 0)
      endDate.setDate(startDate.getDate() + 6)
      endDate.setHours(23, 59, 59, 999)
    } else {
      startDate.setDate(1)
      startDate.setHours(0, 0, 0, 0)
      endDate.setMonth(endDate.getMonth() + 1, 0)
      endDate.setHours(23, 59, 59, 999)
    }

    return entries.filter((entry) => entry.timestamp >= startDate && entry.timestamp <= endDate)
  }, [entries, selectedDate, timeFilter])

  const smokedCount = filteredEntries.filter((entry) => entry.smoked).length
  const resistedCount = filteredEntries.filter((entry) => !entry.smoked).length

  // Prepare hourly data for the chart
  const hourlyData = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => ({
      hour: i.toString().padStart(2, "0") + ":00",
      smoked: 0,
      resisted: 0,
      avgMood: 0,
      avgUrgency: 0,
      totalEntries: 0,
    }))

    filteredEntries.forEach((entry) => {
      const hour = entry.timestamp.getHours()
      if (entry.smoked) {
        hours[hour].smoked++
      } else {
        hours[hour].resisted++
      }
      hours[hour].totalEntries++
      hours[hour].avgMood += entry.mood
      hours[hour].avgUrgency += entry.urgency
    })

    return hours.map((hour) => ({
      ...hour,
      avgMood: hour.totalEntries > 0 ? hour.avgMood / hour.totalEntries : 0,
      avgUrgency: hour.totalEntries > 0 ? hour.avgUrgency / hour.totalEntries : 0,
    }))
  }, [filteredEntries])

  const recentEntries = filteredEntries
    .filter((entry) => entry.smoked)
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 10)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Date Navigation */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigateDate("prev")}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>

              <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatDate(selectedDate)}</h2>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigateDate("next")}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>

            <div className="text-center mb-6">
              <div className="text-4xl font-bold text-red-500 dark:text-red-400 mb-2">
                {smokedCount} sigarette accese
              </div>
              <div className="text-lg text-gray-600 dark:text-gray-400">{resistedCount} volte resistito</div>
            </div>

            {/* Time Filter Buttons */}
            <div className="flex justify-center gap-2">
              {[
                { key: "day" as const, label: "Giorno" },
                { key: "week" as const, label: "Settimana" },
                { key: "month" as const, label: "Mese" },
              ].map(({ key, label }) => (
                <Button
                  key={key}
                  variant={timeFilter === key ? "default" : "ghost"}
                  onClick={() => setTimeFilter(key)}
                  className={
                    timeFilter === key
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }
                >
                  {label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Legend */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-4">
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-700 dark:text-gray-300">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Desiderate</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                <span>Accese</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span>Speciali</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Umore medio</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>Urgenza media</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chart */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={hourlyData}>
                  <XAxis
                    dataKey="hour"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "currentColor", fontSize: 12 }}
                    className="text-gray-600 dark:text-gray-400"
                  />
                  <YAxis
                    yAxisId="left"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "currentColor", fontSize: 12 }}
                    className="text-gray-600 dark:text-gray-400"
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    domain={[0, 10]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "currentColor", fontSize: 12 }}
                    className="text-gray-600 dark:text-gray-400"
                  />
                  <Bar yAxisId="left" dataKey="smoked" fill="#6B7280" radius={[2, 2, 0, 0]} />
                  <Bar yAxisId="left" dataKey="resisted" fill="#3B82F6" radius={[2, 2, 0, 0]} />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="avgMood"
                    stroke="#10B981"
                    strokeWidth={2}
                    dot={{ fill: "#10B981", strokeWidth: 2, r: 4 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="avgUrgency"
                    stroke="#EF4444"
                    strokeWidth={2}
                    dot={{ fill: "#EF4444", strokeWidth: 2, r: 4 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Entries Table */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="grid grid-cols-4 gap-4 text-center font-semibold text-blue-600 dark:text-blue-400 mb-4">
              <div>Orario</div>
              <div>Speciale</div>
              <div>Umore</div>
              <div>Urgenza</div>
            </div>
            <div className="space-y-3">
              {recentEntries.length > 0 ? (
                recentEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="grid grid-cols-4 gap-4 text-center py-2 border-b border-gray-200 dark:border-gray-700"
                  >
                    <div className="text-gray-700 dark:text-gray-300">
                      {entry.timestamp.toLocaleTimeString("it-IT", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                    <div className="text-gray-700 dark:text-gray-300">{entry.isSpecial ? "Sì" : "No"}</div>
                    <div className="text-gray-700 dark:text-gray-300">{entry.mood}</div>
                    <div className="text-gray-700 dark:text-gray-300">{entry.urgency}</div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                  Nessuna registrazione trovata per questo periodo
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
