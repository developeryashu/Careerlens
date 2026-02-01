import { generateText, Output } from "ai"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

const analysisSchema = z.object({
  atsScore: z.number().min(0).max(100).describe("ATS compatibility score from 0-100"),
  overallScore: z.number().min(0).max(100).describe("Overall resume quality score from 0-100"),
  summary: z.string().describe("Brief 2-3 sentence summary of the resume quality"),
  strengths: z.array(z.object({
    title: z.string(),
    description: z.string()
  })).describe("List of 3-5 key strengths"),
  improvements: z.array(z.object({
    title: z.string(),
    description: z.string(),
    priority: z.enum(["high", "medium", "low"])
  })).describe("List of 4-6 suggested improvements with priority"),
  skills: z.object({
    technical: z.array(z.string()).describe("Technical skills found in the resume"),
    soft: z.array(z.string()).describe("Soft skills identified"),
    missing: z.array(z.string()).describe("Important skills that might be missing based on role")
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
  }).describe("Individual section scores and feedback"),
  keywords: z.array(z.string()).describe("Important keywords found in the resume"),
  wordCount: z.number().describe("Approximate word count"),
  jobMatch: z.object({
    score: z.number().min(0).max(100).nullable(),
    missingKeywords: z.array(z.string()),
    matchingKeywords: z.array(z.string()),
    feedback: z.string()
  }).nullable().describe("Job match analysis if job description was provided")
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
      // For text files, read directly
      if (file.type === "text/plain") {
        resumeText = await file.text()
      } else {
        // For PDF/DOCX, we'll use the text content if available
        // In production, you'd use a proper document parser
        resumeText = await file.text()
      }
    } else if (textContent) {
      resumeText = textContent
    } else {
      return NextResponse.json({ error: "No resume content provided" }, { status: 400 })
    }

    if (!resumeText.trim()) {
      return NextResponse.json({ error: "Resume content is empty" }, { status: 400 })
    }

    const systemPrompt = `You are an expert career counselor and resume analyst with deep knowledge of ATS (Applicant Tracking Systems), hiring practices, and what makes a resume stand out to recruiters.

Analyze the provided resume thoroughly and provide detailed, actionable feedback. Be specific and constructive in your analysis. Consider:
- ATS compatibility (formatting, keywords, structure)
- Content quality (achievements vs duties, quantification, impact)
- Presentation (clarity, organization, professional tone)
- Relevance (skills match, career progression)

${jobDescription ? "A job description has been provided - analyze how well the resume matches the target role." : "No specific job description provided - give general analysis."}`

    const userPrompt = `Please analyze this resume:

${resumeText}

${jobDescription ? `\n\nTarget Job Description:\n${jobDescription}` : ""}`

    const result = await generateText({
      model: "openai/gpt-4o-mini",
      system: systemPrompt,
      prompt: userPrompt,
      output: Output.object({ schema: analysisSchema }),
    })

    const analysis = result.object

    // Save to database
    const { data: savedAnalysis, error: dbError } = await supabase
      .from("resume_analyses")
      .insert({
        user_id: user.id,
        file_name: fileName,
        raw_text: resumeText.substring(0, 10000), // Limit stored text
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
