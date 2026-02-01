import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { FileText, Globe, TrendingUp, Clock, ArrowRight, Sparkles } from "lucide-react"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: recentAnalyses } = await supabase
    .from("resume_analyses")
    .select("*")
    .eq("user_id", user?.id)
    .order("created_at", { ascending: false })
    .limit(3)

  const { data: recentPortfolios } = await supabase
    .from("portfolio_evaluations")
    .select("*")
    .eq("user_id", user?.id)
    .order("created_at", { ascending: false })
    .limit(3)

  const totalAnalyses = recentAnalyses?.length || 0
  const totalPortfolios = recentPortfolios?.length || 0
  const avgScore = recentAnalyses?.length 
    ? Math.round(recentAnalyses.reduce((acc, a) => acc + (a.overall_score || 0), 0) / recentAnalyses.length)
    : 0

  return (
    <div className="space-y-8">
      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Resume Analyses
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAnalyses}</div>
            <p className="text-xs text-muted-foreground">Total analyses completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Portfolio Reviews
            </CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPortfolios}</div>
            <p className="text-xs text-muted-foreground">Links evaluated</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Score
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgScore || "-"}</div>
            <p className="text-xs text-muted-foreground">Across all analyses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Last Activity
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {recentAnalyses?.[0] 
                ? new Date(recentAnalyses[0].created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                : "-"
              }
            </div>
            <p className="text-xs text-muted-foreground">Most recent analysis</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
          <CardHeader>
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Analyze Your Resume</CardTitle>
            <CardDescription>
              Upload your resume and get AI-powered insights on ATS compatibility, 
              skill gaps, and improvement suggestions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/dashboard/resume">
                Start Analysis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-chart-2/10 via-transparent to-transparent" />
          <CardHeader>
            <div className="w-12 h-12 rounded-xl bg-chart-2/10 flex items-center justify-center mb-2">
              <Globe className="h-6 w-6 text-chart-2" />
            </div>
            <CardTitle>Evaluate Your Portfolio</CardTitle>
            <CardDescription>
              Share your LinkedIn, GitHub, or personal website for a comprehensive 
              evaluation with actionable feedback.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" asChild>
              <Link href="/dashboard/portfolio">
                Evaluate Portfolio
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      {(recentAnalyses?.length ?? 0) > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Recent Analyses
            </CardTitle>
            <CardDescription>
              Your most recent resume analyses and their scores
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAnalyses?.map((analysis) => (
                <div 
                  key={analysis.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{analysis.file_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(analysis.created_at).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric"
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Score</p>
                      <p className="text-lg font-bold text-foreground">
                        {analysis.overall_score || "-"}/100
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/resume/${analysis.id}`}>
                        View
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            {(recentAnalyses?.length ?? 0) >= 3 && (
              <div className="mt-4 text-center">
                <Button variant="link" asChild>
                  <Link href="/dashboard/history">View all history</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {totalAnalyses === 0 && totalPortfolios === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Sparkles className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Welcome to CareerLens!
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Get started by uploading your resume or sharing your portfolio link 
              for AI-powered analysis and improvement suggestions.
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
