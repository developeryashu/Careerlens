import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { FileText, Globe, Clock, ArrowRight, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

export default async function HistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: resumeAnalyses } = await supabase
    .from("resume_analyses")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const { data: portfolioEvaluations } = await supabase
    .from("portfolio_evaluations")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const allItems = [
    ...(resumeAnalyses || []).map(item => ({ ...item, type: "resume" as const })),
    ...(portfolioEvaluations || []).map(item => ({ ...item, type: "portfolio" as const }))
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const getScoreColor = (score: number | null) => {
    if (!score) return "text-muted-foreground"
    if (score >= 80) return "text-green-500"
    if (score >= 60) return "text-yellow-500"
    return "text-red-500"
  }

  const typeLabels: Record<string, string> = {
    linkedin: "LinkedIn",
    github: "GitHub",
    portfolio: "Website",
    other: "Link"
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'var(--font-display)' }}>
          Analysis History
        </h1>
        <p className="text-muted-foreground mt-1">
          View all your past resume analyses and portfolio evaluations
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{resumeAnalyses?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Resume Analyses</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-chart-2/10 flex items-center justify-center">
                <Globe className="h-6 w-6 text-chart-2" />
              </div>
              <div>
                <p className="text-2xl font-bold">{portfolioEvaluations?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Portfolio Reviews</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-chart-3/10 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-chart-3" />
              </div>
              <div>
                <p className="text-2xl font-bold">{allItems.length}</p>
                <p className="text-sm text-muted-foreground">Total Analyses</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* History List */}
      {allItems.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>All Analyses</CardTitle>
            <CardDescription>
              Click on any analysis to view the detailed results
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {allItems.map((item) => (
                <Link
                  key={`${item.type}-${item.id}`}
                  href={item.type === "resume" ? `/dashboard/resume/${item.id}` : `/dashboard/portfolio/${item.id}`}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      item.type === "resume" ? "bg-primary/10" : "bg-chart-2/10"
                    )}>
                      {item.type === "resume" ? (
                        <FileText className="h-5 w-5 text-primary" />
                      ) : (
                        <Globe className="h-5 w-5 text-chart-2" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">
                          {item.type === "resume" 
                            ? item.file_name 
                            : typeLabels[item.evaluation_type] || "Profile"
                          }
                        </p>
                        <Badge variant="secondary" className="text-xs">
                          {item.type === "resume" ? "Resume" : "Portfolio"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(item.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "numeric",
                          minute: "2-digit"
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Score</p>
                      <p className={cn("text-lg font-bold", getScoreColor(
                        item.type === "resume" ? item.overall_score : item.score
                      ))}>
                        {(item.type === "resume" ? item.overall_score : item.score) || "-"}/100
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Sparkles className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No analyses yet
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Start by analyzing your resume or evaluating your portfolio to see your history here.
            </p>
            <div className="flex gap-3 justify-center">
              <Button asChild>
                <Link href="/dashboard/resume">Analyze Resume</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard/portfolio">Evaluate Portfolio</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
