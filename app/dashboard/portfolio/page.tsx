"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Globe, Github, Linkedin, Briefcase, Loader2, Sparkles, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"

const evaluationTypes = [
  {
    id: "linkedin",
    name: "LinkedIn Profile",
    icon: Linkedin,
    description: "Get insights on your professional presence",
    placeholder: "https://linkedin.com/in/yourprofile"
  },
  {
    id: "github",
    name: "GitHub Profile",
    icon: Github,
    description: "Analyze your open source contributions",
    placeholder: "https://github.com/yourusername"
  },
  {
    id: "portfolio",
    name: "Personal Website",
    icon: Briefcase,
    description: "Evaluate your portfolio site",
    placeholder: "https://yoursite.com"
  },
  {
    id: "other",
    name: "Other Link",
    icon: Globe,
    description: "Any professional profile or project",
    placeholder: "https://example.com/your-work"
  }
]

export default function PortfolioEvaluationPage() {
  const [url, setUrl] = useState("")
  const [evaluationType, setEvaluationType] = useState("linkedin")
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const selectedType = evaluationTypes.find(t => t.id === evaluationType)

  const handleEvaluate = async () => {
    if (!url.trim()) return

    // Basic URL validation
    try {
      new URL(url)
    } catch {
      setError("Please enter a valid URL")
      return
    }

    setIsEvaluating(true)
    setError(null)

    try {
      const response = await fetch("/api/evaluate-portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, evaluationType }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Evaluation failed")
      }

      const result = await response.json()
      router.push(`/dashboard/portfolio/${result.id}`)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Evaluation failed")
      setIsEvaluating(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'var(--font-display)' }}>
          Portfolio Evaluation
        </h1>
        <p className="text-muted-foreground mt-1">
          Get AI-powered insights on your online presence and professional profiles
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            What would you like to evaluate?
          </CardTitle>
          <CardDescription>
            Select the type of link you want to analyze
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={evaluationType}
            onValueChange={setEvaluationType}
            className="grid gap-4 md:grid-cols-2"
          >
            {evaluationTypes.map((type) => (
              <Label
                key={type.id}
                htmlFor={type.id}
                className={cn(
                  "flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-colors",
                  evaluationType === type.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                )}
              >
                <RadioGroupItem value={type.id} id={type.id} className="mt-1" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <type.icon className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-foreground">{type.name}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{type.description}</p>
                </div>
              </Label>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Enter URL</CardTitle>
          <CardDescription>
            Paste the link to your {selectedType?.name.toLowerCase() || "profile"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              type="url"
              placeholder={selectedType?.placeholder || "https://..."}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="text-base"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={() => setUrl("")}>
          Clear
        </Button>
        <Button
          onClick={handleEvaluate}
          disabled={isEvaluating || !url.trim()}
          className="min-w-[160px]"
        >
          {isEvaluating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Evaluating...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Evaluate Profile
            </>
          )}
        </Button>
      </div>

      {/* Tips Card */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-lg">Tips for Best Results</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary">-</span>
              Make sure your profile is public or the link is accessible
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">-</span>
              For LinkedIn, use your public profile URL (linkedin.com/in/username)
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">-</span>
              For GitHub, we&apos;ll analyze your repositories, contributions, and README
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">-</span>
              Personal websites should showcase your work and professional experience
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
