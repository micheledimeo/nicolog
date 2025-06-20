"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Cigarette, TrendingDown, Calendar, Clock, BarChart3 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Navigation } from "@/components/navigation"
import { ReportPage } from "@/components/report-page"
import { useAuth } from "@/contexts/auth-context"
import { AuthScreen } from "@/components/auth/auth-screen"

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

export default function CigaretteTracker() {
  const { user, loading } = useAuth()
  const [currentPage, setCurrentPage] = useState<"registra" | "report">("registra")
  const [mood, setMood] = useState([5])
  const [urgency, setUrgency] = useState([5])
  const [waited10Minutes, setWaited10Minutes] = useState(false)
  const [smoked, setSmoked] = useState(false)
  const [isSpecial, setIsSpecial] = useState(false)
  const [notes, setNotes] = useState("")
  const [entries, setEntries] = useState<CigaretteEntry[]>(() => {
    // Generate some sample data for demonstration
    const sampleEntries: CigaretteEntry[] = []
    const now = new Date()

    // Add some entries for today
    for (let i = 0; i < 15; i++) {
      const timestamp = new Date(now)
      timestamp.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60))
      timestamp.setDate(timestamp.getDate() - Math.floor(Math.random() * 7))

      sampleEntries.push({
        id: `sample-${i}`,
        timestamp,
        mood: Math.floor(Math.random() * 10) + 1,
        urgency: Math.floor(Math.random() * 10) + 1,
        waited10Minutes: Math.random() > 0.5,
        smoked: Math.random() > 0.3,
        isSpecial: Math.random() > 0.7,
        notes: Math.random() > 0.5 ? "Note di esempio" : "",
      })
    }

    return sampleEntries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  })
  const { toast } = useToast()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="h-6 w-6 text-white animate-pulse" />
          </div>
          <p className="text-gray-600 dark:text-gray-400">Caricamento...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <AuthScreen />
  }

  const handleSubmit = () => {
    const newEntry: CigaretteEntry = {
      id: Date.now().toString(),
      timestamp: new Date(),
      mood: mood[0],
      urgency: urgency[0],
      waited10Minutes,
      smoked,
      isSpecial,
      notes,
    }

    setEntries((prev) => [newEntry, ...prev])

    // Reset form
    setMood([5])
    setUrgency([5])
    setWaited10Minutes(false)
    setSmoked(false)
    setIsSpecial(false)
    setNotes("")

    toast({
      title: "Registrazione salvata",
      description: "Il tuo bisogno è stato registrato con successo.",
    })
  }

  if (currentPage === "report") {
    return (
      <div>
        <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
        <ReportPage entries={entries} />
      </div>
    )
  }

  const todayEntries = entries.filter((entry) => entry.timestamp.toDateString() === new Date().toDateString())
  const todaySmoked = todayEntries.filter((entry) => entry.smoked).length
  const todayResisted = todayEntries.filter((entry) => !entry.smoked).length

  return (
    <div>
      <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Cigarette className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Smoke Tracker</h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400">Monitora il tuo percorso verso una vita senza fumo</p>
          </div>

          {/* Daily Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Oggi</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{todayEntries.length}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Registrazioni</div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Cigarette className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Fumate</span>
                </div>
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">{todaySmoked}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Sigarette</div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <TrendingDown className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Resistito</span>
                </div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{todayResisted}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Volte</div>
              </CardContent>
            </Card>
          </div>

          {/* Main Form */}
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                <Clock className="h-5 w-5" />
                Registra il bisogno
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Traccia il tuo stato d'animo e le tue decisioni per comprendere meglio i tuoi pattern
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Mood Slider */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium text-gray-900 dark:text-white">Umore</Label>
                  <Badge
                    variant="outline"
                    className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700"
                  >
                    {mood[0]}/10
                  </Badge>
                </div>
                <Slider value={mood} onValueChange={setMood} max={10} min={1} step={1} className="w-full" />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Pessimo</span>
                  <span>Ottimo</span>
                </div>
              </div>

              {/* Urgency Slider */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium text-gray-900 dark:text-white">Urgenza</Label>
                  <Badge
                    variant="outline"
                    className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700"
                  >
                    {urgency[0]}/10
                  </Badge>
                </div>
                <Slider value={urgency} onValueChange={setUrgency} max={10} min={1} step={1} className="w-full" />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Bassa</span>
                  <span>Estrema</span>
                </div>
              </div>

              {/* Checkboxes */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Checkbox id="waited" checked={waited10Minutes} onCheckedChange={setWaited10Minutes} />
                  <Label
                    htmlFor="waited"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-900 dark:text-white"
                  >
                    Ho aspettato 10 minuti prima di decidere?
                  </Label>
                </div>

                <div className="flex items-center space-x-3">
                  <Checkbox id="smoked" checked={smoked} onCheckedChange={setSmoked} />
                  <Label
                    htmlFor="smoked"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-900 dark:text-white"
                  >
                    Ho acceso la sigaretta?
                  </Label>
                </div>

                <div className="flex items-center space-x-3">
                  <Checkbox id="special" checked={isSpecial} onCheckedChange={setIsSpecial} />
                  <Label
                    htmlFor="special"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-900 dark:text-white"
                  >
                    È una sigaretta speciale? (es. dopo pasto, con caffè)
                  </Label>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-base font-medium text-gray-900 dark:text-white">
                  Note (opzionale)
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Descrivi il contesto, le emozioni o i trigger che hai notato..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  maxLength={500}
                  rows={4}
                  className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                />
                <div className="text-right text-xs text-gray-500 dark:text-gray-400">{notes.length}/500</div>
              </div>

              {/* Submit Button */}
              <Button onClick={handleSubmit} className="w-full bg-blue-600 hover:bg-blue-700 text-white" size="lg">
                Registra
              </Button>
            </CardContent>
          </Card>

          {/* Recent Entries */}
          {entries.length > 0 && (
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">Registrazioni recenti</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Le tue ultime 5 registrazioni
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {entries.slice(0, 5).map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${entry.smoked ? "bg-red-500" : "bg-green-500"}`} />
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {entry.timestamp.toLocaleTimeString("it-IT", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Umore: {entry.mood}/10 • Urgenza: {entry.urgency}/10
                          </div>
                        </div>
                      </div>
                      <Badge variant={entry.smoked ? "destructive" : "default"}>
                        {entry.smoked ? "Fumata" : "Resistito"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
