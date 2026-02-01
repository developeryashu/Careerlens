"use client"

import { ThemeToggle } from "@/components/theme-toggle"
import type { User } from "@supabase/supabase-js"

interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
}

interface HeaderProps {
  user: User
  profile: Profile | null
}

export function DashboardHeader({ profile }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 px-6">
      <div className="flex-1">
        <h1 className="text-lg font-semibold text-foreground">
          Welcome back, {profile?.full_name?.split(" ")[0] || "there"}
        </h1>
        <p className="text-sm text-muted-foreground">
          Analyze and improve your career materials
        </p>
      </div>
      <ThemeToggle />
    </header>
  )
}
