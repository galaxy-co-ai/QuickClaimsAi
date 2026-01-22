import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function HomePage() {
  const { userId } = await auth();

  // If logged in, redirect to dashboard
  if (userId) {
    redirect("/dashboard");
  }

  // Otherwise show landing page
  return (
    <div className="flex h-screen overflow-auto flex-col bg-[var(--rr-color-bg-inverse)]">
      {/* Header */}
      <header className="container mx-auto flex items-center justify-between p-[var(--rr-space-6)]">
        <div className="flex items-center gap-[var(--rr-space-3)]">
          <div className="flex h-10 w-10 items-center justify-center rounded-[var(--rr-radius-lg)] bg-[var(--rr-color-brand-primary)]">
            <span className="text-[var(--rr-font-size-lg)] font-[var(--rr-font-weight-semibold)] text-[var(--rr-color-text-inverse)]">QC</span>
          </div>
          <span className="text-[var(--rr-font-size-xl)] font-[var(--rr-font-weight-semibold)] text-[var(--rr-color-text-inverse)]">QuickClaims AI</span>
        </div>
        <nav className="flex items-center gap-[var(--rr-space-4)]">
          <Link
            href="/sign-in"
            className="rounded-[var(--rr-radius-md)] px-[var(--rr-space-4)] py-[var(--rr-space-2)] text-[var(--rr-font-size-sm)] font-[var(--rr-font-weight-medium)] text-[var(--rr-color-stone)] transition-colors hover:text-[var(--rr-color-text-inverse)]"
          >
            Sign In
          </Link>
          <Link
            href="/sign-up"
            className="rounded-[var(--rr-radius-md)] bg-[var(--rr-color-brand-primary)] px-[var(--rr-space-4)] py-[var(--rr-space-2)] text-[var(--rr-font-size-sm)] font-[var(--rr-font-weight-medium)] text-[var(--rr-color-text-inverse)] transition-colors hover:bg-[var(--rr-color-brand-primary-hover)]"
          >
            Get Started
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <main className="container mx-auto flex flex-1 flex-col items-center justify-center px-[var(--rr-space-6)] text-center">
        <div className="mb-[var(--rr-space-4)] inline-flex items-center gap-[var(--rr-space-2)] rounded-[var(--rr-radius-full)] bg-[var(--rr-color-brand-primary)]/20 px-[var(--rr-space-4)] py-[var(--rr-space-2)] text-[var(--rr-font-size-sm)] text-[var(--rr-color-brand-primary)]">
          <span className="h-2 w-2 rounded-[var(--rr-radius-full)] bg-[var(--rr-color-brand-primary)]" />
          Built for Claims Supplement Management
        </div>

        <h1 className="mb-[var(--rr-space-6)] max-w-4xl text-[var(--rr-font-size-display)] font-[var(--rr-font-weight-semibold)] tracking-[var(--rr-letter-spacing-tight)] text-[var(--rr-color-text-inverse)] leading-[var(--rr-line-height-tight)] sm:text-5xl">
          Claims Supplement Management,{" "}
          <span className="text-[var(--rr-color-brand-primary)]">Simplified</span>
        </h1>

        <p className="mb-[var(--rr-space-8)] max-w-2xl text-[var(--rr-font-size-lg)] text-[var(--rr-color-stone)] leading-[var(--rr-line-height-relaxed)]">
          Stop wasting hours on Excel spreadsheets. QuickClaims AI automates
          calculations, tracks commissions in real-time, and generates billing
          reports with three clicks or less.
        </p>

        <div className="flex items-center gap-[var(--rr-space-4)]">
          <Link
            href="/sign-up"
            className="rounded-[var(--rr-radius-md)] bg-[var(--rr-color-brand-primary)] px-[var(--rr-space-6)] py-[var(--rr-space-3)] text-[var(--rr-font-size-lg)] font-[var(--rr-font-weight-medium)] text-[var(--rr-color-text-inverse)] transition-all hover:bg-[var(--rr-color-brand-primary-hover)] shadow-[var(--rr-shadow-md)] hover:shadow-[var(--rr-shadow-lg)]"
          >
            Start Free Trial
          </Link>
          <Link
            href="#features"
            className="rounded-[var(--rr-radius-md)] border border-[var(--rr-color-stone)] px-[var(--rr-space-6)] py-[var(--rr-space-3)] text-[var(--rr-font-size-lg)] font-[var(--rr-font-weight-medium)] text-[var(--rr-color-stone)] transition-colors hover:border-[var(--rr-color-text-inverse)] hover:text-[var(--rr-color-text-inverse)]"
          >
            Learn More
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-[var(--rr-space-16)] grid gap-[var(--rr-space-8)] sm:grid-cols-3">
          <div className="text-center">
            <div className="text-[var(--rr-font-size-4xl)] font-[var(--rr-font-weight-semibold)] text-[var(--rr-color-text-inverse)]">80%</div>
            <div className="text-[var(--rr-font-size-sm)] text-[var(--rr-color-stone)]">Less time on reports</div>
          </div>
          <div className="text-center">
            <div className="text-[var(--rr-font-size-4xl)] font-[var(--rr-font-weight-semibold)] text-[var(--rr-color-text-inverse)]">3 clicks</div>
            <div className="text-[var(--rr-font-size-sm)] text-[var(--rr-color-stone)]">For any common action</div>
          </div>
          <div className="text-center">
            <div className="text-[var(--rr-font-size-4xl)] font-[var(--rr-font-weight-semibold)] text-[var(--rr-color-text-inverse)]">Real-time</div>
            <div className="text-[var(--rr-font-size-sm)] text-[var(--rr-color-stone)]">Commission tracking</div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto p-[var(--rr-space-6)] text-center text-[var(--rr-font-size-sm)] text-[var(--rr-color-stone)]">
        QuickClaims AI. Built by GalaxyCo.
      </footer>
    </div>
  );
}
