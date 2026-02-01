"use client"

import React from "react"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Upload, FileText, Loader2, X, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

export default function ResumeAnalysisPage() {
  const [file, setFile] = useState<File | null>(null)
  const [resumeText, setResumeText] = useState("")
  const [jobDescription, setJobDescription] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [inputMethod, setInputMethod] = useState<"upload" | "paste">("upload")
  const router = useRouter()

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile.type === "application/pdf" || 
          droppedFile.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
          droppedFile.type === "text/plain") {
        setFile(droppedFile)
      }
    }
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleAnalyze = async () => {
    if (!file && !resumeText.trim()) return

    setIsAnalyzing(true)
    
    const formData = new FormData()
    if (file) {
      formData.append("file", file)
    } else {
      formData.append("text", resumeText)
    }
    if (jobDescription.trim()) {
      formData.append("jobDescription", jobDescription)
    }

    try {
      const response = await fetch("/api/analyze-resume", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Analysis failed")
      }

      const result = await response.json()
      router.push(`/dashboard/resume/${result.id}`)
    } catch (error) {
      console.error("Error analyzing resume:", error)
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'var(--font-display)' }}>
          Resume Analysis
        </h1>
        <p className="text-muted-foreground mt-1">
          Upload your resume or paste the text to get AI-powered insights
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Your Resume
          </CardTitle>
          <CardDescription>
            Choose how you want to provide your resume content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Input Method Toggle */}
          <div className="flex gap-2 p-1 bg-muted rounded-lg w-fit">
            <button
              onClick={() => setInputMethod("upload")}
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                inputMethod === "upload"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Upload File
            </button>
            <button
              onClick={() => setInputMethod("paste")}
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                inputMethod === "paste"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Paste Text
            </button>
          </div>

          {inputMethod === "upload" ? (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={cn(
                "relative border-2 border-dashed rounded-xl p-8 text-center transition-colors",
                dragActive
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50",
                file && "border-primary bg-primary/5"
              )}
            >
              {file ? (
                <div className="flex items-center justify-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-foreground">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setFile(null)}
                    className="ml-4"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                  <p className="text-foreground font-medium mb-1">
                    Drop your resume here or click to browse
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Supports PDF, DOCX, and TXT files (max 5MB)
                  </p>
                  <Input
                    type="file"
                    accept=".pdf,.docx,.txt"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Button variant="outline" className="pointer-events-none bg-transparent">
                    Browse Files
                  </Button>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="resumeText">Resume Content</Label>
              <Textarea
                id="resumeText"
                placeholder="Paste your resume text here..."
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                className="min-h-[200px] resize-none"
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Target Job (Optional)</CardTitle>
          <CardDescription>
            Add a job description to get tailored suggestions for that specific role
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Paste the job description here for more targeted analysis..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            className="min-h-[120px] resize-none"
          />
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={() => {
          setFile(null)
          setResumeText("")
          setJobDescription("")
        }}>
          Clear All
        </Button>
        <Button
          onClick={handleAnalyze}
          disabled={isAnalyzing || (!file && !resumeText.trim())}
          className="min-w-[140px]"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Analyze Resume
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
