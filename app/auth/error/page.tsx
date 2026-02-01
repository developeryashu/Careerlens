import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">CL</span>
            </div>
            <span className="text-2xl font-bold text-foreground" style={{ fontFamily: 'var(--font-display)' }}>
              CareerLens
            </span>
          </Link>
        </div>

        <Card className="border-border/50 shadow-lg text-center">
          <CardHeader className="space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl">Authentication Error</CardTitle>
            <CardDescription className="text-base">
              Something went wrong during authentication. Please try again.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              If this problem persists, please contact support or try clearing your browser cookies.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button asChild className="w-full">
              <Link href="/auth/login">Try again</Link>
            </Button>
            <Button variant="outline" asChild className="w-full bg-transparent">
              <Link href="/">Return home</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
