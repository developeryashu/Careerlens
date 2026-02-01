import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check } from "lucide-react"

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for trying out CareerLens",
    features: [
      "1 resume analysis per month",
      "Basic ATS score",
      "Top 3 improvement tips",
      "Email support",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Pro",
    price: "$12",
    period: "per month",
    description: "Best for active job seekers",
    features: [
      "Unlimited resume analyses",
      "Detailed ATS breakdown",
      "Full skill gap analysis",
      "Portfolio & link evaluation",
      "Downloadable PDF reports",
      "Priority support",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Team",
    price: "$29",
    period: "per month",
    description: "For career coaches & teams",
    features: [
      "Everything in Pro",
      "Up to 10 team members",
      "Bulk resume uploads",
      "Team analytics dashboard",
      "Custom branding",
      "API access",
    ],
    cta: "Contact Sales",
    popular: false,
  },
]

export function Pricing() {
  return (
    <section id="pricing" className="px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2
            className="text-balance text-3xl font-bold tracking-tight sm:text-4xl"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Simple, <span className="text-primary">Transparent</span> Pricing
          </h2>
          <p className="mt-4 text-pretty text-lg text-muted-foreground">
            Choose the plan that fits your career journey. Upgrade or downgrade anytime.
          </p>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative flex flex-col ${
                plan.popular
                  ? "border-primary shadow-xl shadow-primary/10"
                  : "border-border/50"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground">
                  Most Popular
                </div>
              )}
              <CardHeader className="pb-8 pt-6">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription className="text-sm">{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">/{plan.period}</span>
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col">
                <ul className="flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <Link href="/signup">
                    <Button
                      className="w-full rounded-full"
                      variant={plan.popular ? "default" : "outline"}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
