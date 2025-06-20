"use client"

import { Button } from "@/components/ui/button"
import { BarChart3, User, Sun, Moon } from "lucide-react"
import { useTheme } from "@/contexts/theme-context"
import { useAuth } from "@/contexts/auth-context"

interface NavigationProps {
  currentPage: "registra" | "report"
  onPageChange: (page: "registra" | "report") => void
}

export function Navigation({ currentPage, onPageChange }: NavigationProps) {
  const { theme, toggleTheme } = useTheme()
  const { logout, user } = useAuth()

  return (
    <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white p-4 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold">NicoLog</h1>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={currentPage === "registra" ? "secondary" : "ghost"}
              onClick={() => onPageChange("registra")}
              className={
                currentPage === "registra"
                  ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              }
            >
              Registra
            </Button>
            <Button
              variant={currentPage === "report" ? "default" : "ghost"}
              onClick={() => onPageChange("report")}
              className={
                currentPage === "report"
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              }
            >
              Report
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>
            <div className="flex items-center gap-2">
              {user?.avatar ? (
                <img src={user.avatar || "/placeholder.svg"} alt={user.name} className="w-8 h-8 rounded-full" />
              ) : (
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4" />
                </div>
              )}
              <Button
                variant="ghost"
                onClick={logout}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm"
              >
                Esci
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
