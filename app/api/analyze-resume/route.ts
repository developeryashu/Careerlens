import { generateText, Output } from "ai"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

const analysisSchema = z.object({
  atsScore: z.number().min(0).max(100),
  overallScore: z.number().min(0).max(100),
  summary: z.string(),
  strengths: z.array(z.object({
    title: z.string(),
    description: z.string()
  })),
  improvements: z.array(z.object({
    title: z.string(),
    description: z.string(),
    priority: z.enum(["high", "medium", "low"])
  })),
  skills: z.object({
    technical: z.array(z.string()),
    soft: z.array(z.string()),
    missing: z.array(z.string())
  }),
  sections: z.object({
    contact: z.object({
      score: z.number().min(0).max(100),
      feedback: z.string()
    }),
    experience: z.object({
      score: z.number().min(0).max(100),
      feedback: z.string()
    }),
    education: z.object({
      score: z.number().min(0).max(100),
      feedback: z.string()
    }),
    skills: z.object({
      score: z.number().min(0).max(100),
      feedback: z.string()
    }),
    format: z.object({
      score: z.number().min(0).max(100),
      feedback: z.string()
    })
  }),
  keywords: z.array(z.string()),
  wordCount: z.number(),
  jobMatch: z.object({
    score: z.number().min(0).max(100).nullable(),
    missingKeywords: z.array(z.string()),
    matchingKeywords: z.array(z.string()),
    feedback: z.string()
  }).nullable()
})

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File | null
    const textContent = formData.get("text") as string | null
    const jobDescription = formData.get("jobDescription") as string | null

    let resumeText = ""
    let fileName = "Pasted Resume"

    if (file) {
      fileName = file.name
      resumeText = await file.text()
    } else if (textContent) {
      resumeText = textContent
    } else {
      return NextResponse.json({ error: "No resume content provided" }, { status: 400 })
    }

    if (!resumeText.trim()) {
      return NextResponse.json({ error: "Resume content is empty" }, { status: 400 })
    }

    const systemPrompt = `You are an expert career counselor and resume analyst...`

    const userPrompt = `Please analyze this resume:

${resumeText}

${jobDescription ? `\n\nTarget Job Description:\n${jobDescription}` : ""}`

    const result = await generateText({
      model: "openai/gpt-4o-mini",
      system: systemPrompt,
      prompt: userPrompt,
      output: Output.object({ schema: analysisSchema }),
    })

    // ✅ FIXED LINE
    const analysis = result.output

    const { data: savedAnalysis, error: dbError } = await supabase
      .from("resume_analyses")
      .insert({
        user_id: user.id,
        file_name: fileName,
        raw_text: resumeText.substring(0, 10000),
        ats_score: analysis.atsScore,
        overall_score: analysis.overallScore,
        analysis_data: {
          summary: analysis.summary,
          strengths: analysis.strengths,
          sections: analysis.sections,
          keywords: analysis.keywords,
          wordCount: analysis.wordCount,
        },
        suggestions: analysis.improvements,
        skills_extracted: analysis.skills,
      })
      .select()
      .single()

    if (dbError) {
      console.error("Database error:", dbError)
      return NextResponse.json({ error: "Failed to save analysis" }, { status: 500 })
    }

    return NextResponse.json({
      id: savedAnalysis.id,
      analysis: {
        ...analysis,
        jobMatch: analysis.jobMatch,
      }
    })
  } catch (error) {
    console.error("Analysis error:", error)
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 })
  }
}
