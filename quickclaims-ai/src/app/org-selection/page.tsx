"use client";

import { OrganizationList } from "@clerk/nextjs";

export default function OrgSelectionPage() {
  return (
    <div className="flex h-screen overflow-auto items-center justify-center bg-[var(--rr-color-sand-light)]">
      <div className="w-full max-w-md space-y-6 p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[var(--rr-color-text-primary)]">
            Select Your Organization
          </h1>
          <p className="mt-2 text-[var(--rr-color-text-secondary)]">
            Choose an organization to continue or create a new one.
          </p>
        </div>

        <OrganizationList
          hidePersonal
          afterSelectOrganizationUrl="/dashboard"
          afterCreateOrganizationUrl="/dashboard"
        />
      </div>
    </div>
  );
}
