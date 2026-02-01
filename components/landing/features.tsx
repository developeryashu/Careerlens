import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  FileSearch,
  BarChart3,
  Target,
  Lightbulb,
  Link2,
  Download,
} from "lucide-react"

const features = [
  {
    icon: FileSearch,
    title: "Smart Resume Parsing",
    description:
      "Upload your PDF resume and our AI instantly extracts and analyzes every detail, from skills to experience.",
  },
  {
    icon: BarChart3,
    title: "ATS Score Analysis",
    description:
      "Get a detailed ATS compatibility score and understand how your resume performs with applicant tracking systems.",
  },
  {
    icon: Target,
    title: "Skill Gap Detection",
    description:
      "Compare your skills against job requirements and identify exactly what you need to learn or highlight.",
  },
  {
    icon: Lightbulb,
    title: "AI Suggestions",
    description:
      "Receive personalized, actionable recommendations to improve your resume's impact and visibility.",
  },
  {
    icon: Link2,
    title: "Portfolio Analysis",
    description:
      "Evaluate your LinkedIn, GitHub, and portfolio links to ensure your online presence supports your resume.",
  },
  {
    icon: Download,
    title: "Downloadable Reports",
    description:
      "Export comprehensive improvement reports with all insights and recommendations in a shareable format.",
  },
]

export function Features() {
  return (
    <section id="features" className="px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2
            className="text-balance text-3xl font-bold tracking-tight sm:text-4xl"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Everything You Need to{" "}
            <span className="text-primary">Stand Out</span>
          </h2>
          <p className="mt-4 text-pretty text-lg text-muted-foreground">
            Comprehensive tools to analyze, improve, and optimize your professional profile for maximum impact.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="group border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
            >
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
