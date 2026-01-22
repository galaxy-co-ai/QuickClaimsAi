export const dynamic = "force-dynamic";

import { getContractorClaims } from "@/actions/contractor-portal";
import { ContractorClaimsTable } from "@/components/contractor/contractor-claims-table";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ContractorClaimsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = typeof params.page === "string" ? parseInt(params.page) : 1;
  const status = typeof params.status === "string" ? params.status : undefined;
  const search = typeof params.search === "string" ? params.search : undefined;

  const { claims, pagination } = await getContractorClaims({
    page,
    status,
    search,
    limit: 25,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--rr-color-text-primary)]">My Claims</h1>
        <p className="text-[var(--rr-color-text-secondary)]">View and track your claims</p>
      </div>

      <ContractorClaimsTable
        claims={claims}
        pagination={pagination}
        currentFilters={{ status, search }}
      />
    </div>
  );
}
