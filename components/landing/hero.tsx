"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, CheckCircle2 } from "lucide-react"

export function Hero() {
  return (
    <section className="relative overflow-hidden px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 right-0 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 left-0 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-5xl text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-muted-foreground">AI-Powered Resume Analysis</span>
        </div>

        <h1
          className="text-balance text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Get Your Resume{" "}
          <span className="text-primary">Interview-Ready</span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl">
          Upload your resume and get instant AI-driven feedback. Discover your ATS score, 
          identify skill gaps, and receive actionable suggestions to land your dream job.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/signup">
            <Button size="lg" className="group gap-2 rounded-full px-8 text-base">
              Analyze My Resume
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link href="#how-it-works">
            <Button variant="outline" size="lg" className="rounded-full px-8 text-base bg-transparent">
              See How It Works
            </Button>
          </Link>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <span>Free to start</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <span>No credit card required</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <span>Results in seconds</span>
          </div>
        </div>
      </div>
    </section>
  )
}
