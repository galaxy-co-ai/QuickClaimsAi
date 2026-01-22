import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex h-screen overflow-auto items-center justify-center bg-gradient-to-br from-[var(--rr-color-sand)] via-[var(--rr-color-sand-light)] to-[var(--rr-color-sand)]">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-[var(--rr-color-text-primary)]">QuickClaims AI</h1>
          <p className="mt-2 text-[var(--rr-color-stone)]">
            Claims supplement management for Rise Roofing
          </p>
        </div>
        <SignIn
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-xl",
            },
          }}
        />
      </div>
    </div>
  );
}
