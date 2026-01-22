import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex h-screen overflow-auto flex-col items-center justify-center bg-[var(--rr-color-sand-light)]">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-[var(--rr-color-text-primary)]">404</h1>
        <h2 className="mt-4 text-2xl font-semibold text-[var(--rr-color-text-secondary)]">
          Page Not Found
        </h2>
        <p className="mt-2 text-[var(--rr-color-text-secondary)]">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-block rounded-lg bg-[var(--rr-color-brand-primary)] px-6 py-3 text-sm font-medium text-white hover:bg-[var(--rr-color-brand-primary-hover)] transition-colors"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
