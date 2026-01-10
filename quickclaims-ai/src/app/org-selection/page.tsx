"use client";

import { OrganizationList } from "@clerk/nextjs";

export default function OrgSelectionPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="w-full max-w-md space-y-6 p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">
            Select Your Organization
          </h1>
          <p className="mt-2 text-slate-600">
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
