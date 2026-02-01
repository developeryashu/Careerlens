import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { 
  ArrowLeft, 
  Globe, 
  ExternalLink,
  CheckCircle2, 
  AlertCircle, 
  Lightbulb,
  Star,
  AlertTriangle,
  Clock,
  Zap
} from "lucide-react"
import { cn } from "@/lib/utils"

interface EvaluationData {
  summary: string
  strengths: Array<{ title: string; description: string }>
  categories: {
    completeness: { score: number; feedback: string }
    professionalism: { score: number; feedback: string }
    content: { score: number; feedback: string }
    visibility: { score: number; feedback: string }
  }
  highlights: string[]
  redFlags: string[]
}

interface Suggestion {
  title: string
  description: string
  priority: "high" | "medium" | "low"
}

export default async function PortfolioResultPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: evaluation, error } = await supabase
    .from("portfolio_evaluations")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (error || !evaluation) {
    notFound()
  }

  const evaluationData = evaluation.evaluation_data as EvaluationData
  const suggestions = evaluation.suggestions as Suggestion[]

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500"
    if (score >= 60) return "text-yellow-500"
    return "text-red-500"
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-500/10 text-red-500 border-red-500/20"
      case "medium": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
      case "low": return "bg-blue-500/10 text-blue-500 border-blue-500/20"
      default: return "bg-muted text-muted-foreground"
    }
  }

  const typeLabels: Record<string, string> = {
    linkedin: "LinkedIn Profile",
    github: "GitHub Profile",
    portfolio: "Personal Website",
    other: "Professional Link"
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" size="sm" asChild className="mb-2">
            <Link href="/dashboard/portfolio">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Evaluation
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'var(--font-display)' }}>
            Evaluation Results
          </h1>
          <p className="text-muted-foreground mt-1 flex items-center gap-2">
            <Globe className="h-4 w-4" />
            {typeLabels[evaluation.evaluation_type] || "Profile Evaluation"}
            <span className="text-muted-foreground/50">|</span>
            <Clock className="h-4 w-4" />
            {new Date(evaluation.created_at).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric"
            })}
          </p>
        </div>
        <Button variant="outline" asChild>
          <a href={evaluation.url} target="_blank" rel="noopener noreferrer">
            View Profile
            <ExternalLink className="ml-2 h-4 w-4" />
          </a>
        </Button>
      </div>

      {/* Score Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Overall Assessment</CardTitle>
            <CardDescription>{evaluationData.summary}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className={cn(
                "w-24 h-24 rounded-2xl flex items-center justify-center",
                evaluation.score >= 80 ? "bg-green-500/10" :
                evaluation.score >= 60 ? "bg-yellow-500/10" : "bg-red-500/10"
              )}>
                <span className={cn("text-4xl font-bold", getScoreColor(evaluation.score))}>
                  {evaluation.score}
                </span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Profile Score</p>
                <p className="text-xl font-semibold text-foreground">
                  {evaluation.score >= 80 ? "Excellent Profile" :
                   evaluation.score >= 60 ? "Good, With Room to Improve" : "Needs Attention"}
                </p>
                <p className="text-sm text-muted-foreground mt-2 max-w-md">
                  Your {typeLabels[evaluation.evaluation_type]?.toLowerCase() || "profile"} 
                  {evaluation.score >= 80 ? " makes a strong impression" :
                   evaluation.score >= 60 ? " has solid foundations" : " could benefit from some updates"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Evaluated URL</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground break-all">{evaluation.url}</p>
            <Badge className="mt-3" variant="secondary">
              {typeLabels[evaluation.evaluation_type] || "Other"}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Category Scores */}
      <Card>
        <CardHeader>
          <CardTitle>Category Breakdown</CardTitle>
          <CardDescription>Detailed analysis of different aspects</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {Object.entries(evaluationData.categories || {}).map(([key, category]) => (
              <div key={key} className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium capitalize text-foreground">{key}</span>
                  <span className={cn("font-bold", getScoreColor(category.score))}>
                    {category.score}/100
                  </span>
                </div>
                <Progress value={category.score} className="h-2" />
                <p className="text-sm text-muted-foreground">{category.feedback}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Highlights & Red Flags */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Highlights
            </CardTitle>
            <CardDescription>Notable elements of your profile</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {evaluationData.highlights?.map((highlight, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-yellow-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Star className="h-3.5 w-3.5 text-yellow-500" />
                  </div>
                  <span className="text-sm text-foreground">{highlight}</span>
                </li>
              ))}
              {(!evaluationData.highlights || evaluationData.highlights.length === 0) && (
                <p className="text-sm text-muted-foreground">No highlights identified</p>
              )}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Areas of Concern
            </CardTitle>
            <CardDescription>Issues that may impact your profile</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {evaluationData.redFlags?.map((flag, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                  </div>
                  <span className="text-sm text-foreground">{flag}</span>
                </li>
              ))}
              {(!evaluationData.redFlags || evaluationData.redFlags.length === 0) && (
                <p className="text-sm text-muted-foreground">No major concerns identified</p>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Strengths & Improvements */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Strengths
            </CardTitle>
            <CardDescription>What you&apos;re doing well</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {evaluationData.strengths?.map((strength, index) => (
                <div key={index} className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{strength.title}</p>
                    <p className="text-sm text-muted-foreground">{strength.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              Improvements
            </CardTitle>
            <CardDescription>Suggestions to enhance your profile</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {suggestions?.map((suggestion, index) => (
                <div key={index} className="flex gap-3">
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                    suggestion.priority === "high" ? "bg-red-500/10" :
                    suggestion.priority === "medium" ? "bg-yellow-500/10" : "bg-blue-500/10"
                  )}>
                    {suggestion.priority === "high" ? (
                      <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                    ) : suggestion.priority === "medium" ? (
                      <AlertCircle className="h-3.5 w-3.5 text-yellow-500" />
                    ) : (
                      <Lightbulb className="h-3.5 w-3.5 text-blue-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-foreground">{suggestion.title}</p>
                      <Badge variant="outline" className={cn("text-xs", getPriorityColor(suggestion.priority))}>
                        {suggestion.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Wins */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Quick Wins
          </CardTitle>
          <CardDescription>
            High-impact improvements you can make right now
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {suggestions?.filter(s => s.priority === "high").slice(0, 3).map((suggestion, index) => (
              <div key={index} className="p-4 rounded-lg bg-background border border-border">
                <p className="font-medium text-foreground mb-2">{suggestion.title}</p>
                <p className="text-sm text-muted-foreground">{suggestion.description}</p>
              </div>
            ))}
            {(!suggestions || suggestions.filter(s => s.priority === "high").length === 0) && (
              <p className="text-sm text-muted-foreground col-span-3">No urgent improvements needed - great job!</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4 justify-end">
        <Button variant="outline" asChild>
          <Link href="/dashboard/portfolio">Evaluate Another Profile</Link>
        </Button>
        <Button asChild>
          <Link href="/dashboard/history">View History</Link>
        </Button>
      </div>
    </div>
  )
}
