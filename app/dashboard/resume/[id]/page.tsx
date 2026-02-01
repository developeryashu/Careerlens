import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { 
  ArrowLeft, 
  FileText, 
  Target, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle, 
  Lightbulb,
  Code,
  Users,
  AlertTriangle,
  Clock
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Analysis {
  summary: string
  strengths: Array<{ title: string; description: string }>
  sections: {
    contact: { score: number; feedback: string }
    experience: { score: number; feedback: string }
    education: { score: number; feedback: string }
    skills: { score: number; feedback: string }
    format: { score: number; feedback: string }
  }
  keywords: string[]
  wordCount: number
}

interface Suggestion {
  title: string
  description: string
  priority: "high" | "medium" | "low"
}

interface Skills {
  technical: string[]
  soft: string[]
  missing: string[]
}

export default async function ResumeResultPage({ 
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

  const { data: analysis, error } = await supabase
    .from("resume_analyses")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (error || !analysis) {
    notFound()
  }

  const analysisData = analysis.analysis_data as Analysis
  const suggestions = analysis.suggestions as Suggestion[]
  const skills = analysis.skills_extracted as Skills

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500"
    if (score >= 60) return "text-yellow-500"
    return "text-red-500"
  }

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-500"
    if (score >= 60) return "bg-yellow-500"
    return "bg-red-500"
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-500/10 text-red-500 border-red-500/20"
      case "medium": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
      case "low": return "bg-blue-500/10 text-blue-500 border-blue-500/20"
      default: return "bg-muted text-muted-foreground"
    }
  }

  const sectionIcons = {
    contact: Users,
    experience: FileText,
    education: TrendingUp,
    skills: Code,
    format: Target
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" size="sm" asChild className="mb-2">
            <Link href="/dashboard/resume">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Upload
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'var(--font-display)' }}>
            Analysis Results
          </h1>
          <p className="text-muted-foreground mt-1 flex items-center gap-2">
            <FileText className="h-4 w-4" />
            {analysis.file_name}
            <span className="text-muted-foreground/50">|</span>
            <Clock className="h-4 w-4" />
            {new Date(analysis.created_at).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
              hour: "numeric",
              minute: "2-digit"
            })}
          </p>
        </div>
      </div>

      {/* Score Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Overall Assessment</CardTitle>
            <CardDescription>{analysisData.summary}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-20 h-20 rounded-2xl flex items-center justify-center",
                  analysis.overall_score >= 80 ? "bg-green-500/10" :
                  analysis.overall_score >= 60 ? "bg-yellow-500/10" : "bg-red-500/10"
                )}>
                  <span className={cn("text-3xl font-bold", getScoreColor(analysis.overall_score))}>
                    {analysis.overall_score}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Overall Score</p>
                  <p className="font-semibold text-foreground">
                    {analysis.overall_score >= 80 ? "Excellent" :
                     analysis.overall_score >= 60 ? "Good" : "Needs Work"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-20 h-20 rounded-2xl flex items-center justify-center",
                  analysis.ats_score >= 80 ? "bg-green-500/10" :
                  analysis.ats_score >= 60 ? "bg-yellow-500/10" : "bg-red-500/10"
                )}>
                  <span className={cn("text-3xl font-bold", getScoreColor(analysis.ats_score))}>
                    {analysis.ats_score}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">ATS Score</p>
                  <p className="font-semibold text-foreground">
                    {analysis.ats_score >= 80 ? "ATS-Friendly" :
                     analysis.ats_score >= 60 ? "Acceptable" : "May Have Issues"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Word Count</span>
              <span className="font-medium">{analysisData.wordCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Keywords Found</span>
              <span className="font-medium">{analysisData.keywords?.length || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Technical Skills</span>
              <span className="font-medium">{skills?.technical?.length || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Soft Skills</span>
              <span className="font-medium">{skills?.soft?.length || 0}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section Scores */}
      <Card>
        <CardHeader>
          <CardTitle>Section Analysis</CardTitle>
          <CardDescription>Detailed breakdown of each resume section</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(analysisData.sections || {}).map(([key, section]) => {
              const Icon = sectionIcons[key as keyof typeof sectionIcons] || Target
              return (
                <div key={key} className="p-4 rounded-lg bg-muted/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium capitalize">{key}</span>
                    </div>
                    <span className={cn("font-bold", getScoreColor(section.score))}>
                      {section.score}
                    </span>
                  </div>
                  <Progress value={section.score} className="h-2" />
                  <p className="text-sm text-muted-foreground">{section.feedback}</p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

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
              {analysisData.strengths?.map((strength, index) => (
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
            <CardDescription>Actionable suggestions to enhance your resume</CardDescription>
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

      {/* Skills */}
      <Card>
        <CardHeader>
          <CardTitle>Skills Analysis</CardTitle>
          <CardDescription>Skills identified in your resume</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <Code className="h-4 w-4" />
                Technical Skills
              </h4>
              <div className="flex flex-wrap gap-2">
                {skills?.technical?.map((skill, index) => (
                  <Badge key={index} variant="secondary">{skill}</Badge>
                ))}
                {(!skills?.technical || skills.technical.length === 0) && (
                  <p className="text-sm text-muted-foreground">No technical skills detected</p>
                )}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Soft Skills
              </h4>
              <div className="flex flex-wrap gap-2">
                {skills?.soft?.map((skill, index) => (
                  <Badge key={index} variant="outline">{skill}</Badge>
                ))}
                {(!skills?.soft || skills.soft.length === 0) && (
                  <p className="text-sm text-muted-foreground">No soft skills detected</p>
                )}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Consider Adding
              </h4>
              <div className="flex flex-wrap gap-2">
                {skills?.missing?.map((skill, index) => (
                  <Badge key={index} variant="outline" className="border-dashed">{skill}</Badge>
                ))}
                {(!skills?.missing || skills.missing.length === 0) && (
                  <p className="text-sm text-muted-foreground">No suggestions</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Keywords */}
      {analysisData.keywords && analysisData.keywords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Keywords Found</CardTitle>
            <CardDescription>Important keywords that ATS systems may look for</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {analysisData.keywords.map((keyword, index) => (
                <Badge key={index} variant="secondary" className="bg-primary/10 text-primary">
                  {keyword}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-4 justify-end">
        <Button variant="outline" asChild>
          <Link href="/dashboard/resume">Analyze Another Resume</Link>
        </Button>
        <Button asChild>
          <Link href="/dashboard/history">View History</Link>
        </Button>
      </div>
    </div>
  )
}
