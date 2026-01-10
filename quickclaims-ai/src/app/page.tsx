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
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="container mx-auto flex items-center justify-between p-6">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
            <span className="text-lg font-bold text-white">QC</span>
          </div>
          <span className="text-xl font-semibold text-white">QuickClaims AI</span>
        </div>
        <nav className="flex items-center gap-4">
          <Link
            href="/sign-in"
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:text-white"
          >
            Sign In
          </Link>
          <Link
            href="/sign-up"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            Get Started
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <main className="container mx-auto flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-600/20 px-4 py-2 text-sm text-blue-400">
          <span className="h-2 w-2 rounded-full bg-blue-400" />
          Built for Rise Roofing Supplements
        </div>

        <h1 className="mb-6 max-w-4xl text-5xl font-bold tracking-tight text-white sm:text-6xl">
          Claims Supplement Management,{" "}
          <span className="text-blue-400">Simplified</span>
        </h1>

        <p className="mb-8 max-w-2xl text-lg text-slate-400">
          Stop wasting hours on Excel spreadsheets. QuickClaims AI automates
          calculations, tracks commissions in real-time, and generates billing
          reports with three clicks or less.
        </p>

        <div className="flex items-center gap-4">
          <Link
            href="/sign-up"
            className="rounded-lg bg-blue-600 px-6 py-3 text-lg font-medium text-white transition-colors hover:bg-blue-700"
          >
            Start Free Trial
          </Link>
          <Link
            href="#features"
            className="rounded-lg border border-slate-600 px-6 py-3 text-lg font-medium text-slate-300 transition-colors hover:border-slate-500 hover:text-white"
          >
            Learn More
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-16 grid gap-8 sm:grid-cols-3">
          <div className="text-center">
            <div className="text-4xl font-bold text-white">80%</div>
            <div className="text-sm text-slate-400">Less time on reports</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-white">3 clicks</div>
            <div className="text-sm text-slate-400">For any common action</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-white">Real-time</div>
            <div className="text-sm text-slate-400">Commission tracking</div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto p-6 text-center text-sm text-slate-500">
        © 2026 Rise Roofing Supplements. Built by GalaxyCo.
      </footer>
    </div>
  );
}
