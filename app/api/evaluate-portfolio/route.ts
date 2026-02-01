import { generateText, Output } from "ai"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

const evaluationSchema = z.object({
  score: z.number().min(0).max(100).describe("Overall profile quality score from 0-100"),
  summary: z.string().describe("Brief 2-3 sentence summary of the profile quality"),
  strengths: z.array(z.object({
    title: z.string(),
    description: z.string()
  })).describe("List of 3-5 key strengths"),
  improvements: z.array(z.object({
    title: z.string(),
    description: z.string(),
    priority: z.enum(["high", "medium", "low"])
  })).describe("List of 4-6 suggested improvements with priority"),
  categories: z.object({
    completeness: z.object({
      score: z.number().min(0).max(100),
      feedback: z.string()
    }).describe("How complete is the profile"),
    professionalism: z.object({
      score: z.number().min(0).max(100),
      feedback: z.string()
    }).describe("Professional presentation"),
    content: z.object({
      score: z.number().min(0).max(100),
      feedback: z.string()
    }).describe("Quality of content and descriptions"),
    visibility: z.object({
      score: z.number().min(0).max(100),
      feedback: z.string()
    }).describe("How discoverable and prominent")
  }),
  highlights: z.array(z.string()).describe("Key highlights or notable elements"),
  redFlags: z.array(z.string()).describe("Potential issues or red flags to address"),
  recommendations: z.array(z.object({
    action: z.string(),
    impact: z.string(),
    effort: z.enum(["quick", "moderate", "significant"])
  })).describe("Specific actionable recommendations")
})

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { url, evaluationType } = await req.json()

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    // Validate URL
    try {
      new URL(url)
    } catch {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 })
    }

    const typeDescriptions: Record<string, string> = {
      linkedin: "LinkedIn professional profile",
      github: "GitHub developer profile and repositories",
      portfolio: "personal portfolio website",
      other: "professional online profile or project"
    }

    const typePrompt = typeDescriptions[evaluationType] || typeDescriptions.other

    const systemPrompt = `You are an expert career coach and professional branding specialist with deep knowledge of online presence optimization, personal branding, and what makes professional profiles stand out to recruiters and hiring managers.

Evaluate the provided ${typePrompt} URL and provide detailed, actionable feedback. Consider:
- Completeness of information
- Professional presentation
- Content quality and relevance
- Visibility and discoverability
- Industry best practices

Be specific and constructive in your analysis. Focus on actionable improvements that will have the most impact.

Note: You are evaluating based on the URL provided. Analyze what a typical ${evaluationType} profile at this URL would contain and provide relevant feedback.`

    const userPrompt = `Please evaluate this ${typePrompt}:

URL: ${url}

Provide a comprehensive evaluation of this professional profile, including scores, strengths, areas for improvement, and specific recommendations.`

    const result = await generateText({
      model: "openai/gpt-4o-mini",
      system: systemPrompt,
      prompt: userPrompt,
      output: Output.object({ schema: evaluationSchema }),
    })

    const evaluation = result.object

    // Save to database
    const { data: savedEvaluation, error: dbError } = await supabase
      .from("portfolio_evaluations")
      .insert({
        user_id: user.id,
        url,
        evaluation_type: evaluationType,
        score: evaluation.score,
        evaluation_data: {
          summary: evaluation.summary,
          strengths: evaluation.strengths,
          categories: evaluation.categories,
          highlights: evaluation.highlights,
          redFlags: evaluation.redFlags,
        },
        suggestions: evaluation.improvements,
      })
      .select()
      .single()

    if (dbError) {
      console.error("Database error:", dbError)
      return NextResponse.json({ error: "Failed to save evaluation" }, { status: 500 })
    }

    return NextResponse.json({
      id: savedEvaluation.id,
      evaluation: {
        ...evaluation,
        recommendations: evaluation.recommendations,
      }
    })
  } catch (error) {
    console.error("Evaluation error:", error)
    return NextResponse.json({ error: "Evaluation failed" }, { status: 500 })
  }
}
