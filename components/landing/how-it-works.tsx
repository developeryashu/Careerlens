import { Upload, Brain, FileCheck, Rocket } from "lucide-react"

const steps = [
  {
    icon: Upload,
    step: "01",
    title: "Upload Your Resume",
    description:
      "Simply drag and drop your PDF resume or upload it from your device. We support all standard resume formats.",
  },
  {
    icon: Brain,
    step: "02",
    title: "AI Analysis",
    description:
      "Our advanced AI engine scans your resume, evaluates content, and compares it against industry standards.",
  },
  {
    icon: FileCheck,
    step: "03",
    title: "Review Results",
    description:
      "Get detailed insights including ATS score, skill analysis, and personalized improvement suggestions.",
  },
  {
    icon: Rocket,
    step: "04",
    title: "Improve & Apply",
    description:
      "Apply the recommendations, download your report, and submit your optimized resume with confidence.",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-muted/30 px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2
            className="text-balance text-3xl font-bold tracking-tight sm:text-4xl"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            How <span className="text-primary">CareerLens</span> Works
          </h2>
          <p className="mt-4 text-pretty text-lg text-muted-foreground">
            Four simple steps to transform your resume and boost your job search success.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((item, index) => (
            <div
              key={item.step}
              className="group relative"
            >
              {index < steps.length - 1 && (
                <div className="absolute left-1/2 top-16 hidden h-0.5 w-full -translate-x-1/2 bg-border lg:block" />
              )}
              <div className="relative flex flex-col items-center text-center">
                <div className="relative z-10 mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-card shadow-lg ring-1 ring-border transition-all duration-300 group-hover:ring-primary/50">
                  <item.icon className="h-7 w-7 text-primary" />
                  <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {item.step}
                  </span>
                </div>
                <h3 className="mb-2 text-lg font-semibold">{item.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
