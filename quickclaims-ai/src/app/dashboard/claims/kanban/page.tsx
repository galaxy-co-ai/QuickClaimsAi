export const dynamic = "force-dynamic";

import Link from "next/link";
import { List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getClaimsForKanban } from "@/actions/claims";
import { KanbanBoard } from "@/components/claims/kanban-board";

export default async function KanbanPage() {
  const claims = await getClaimsForKanban();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--rr-color-text-primary)]">Claims Kanban</h1>
          <p className="text-[var(--rr-color-text-secondary)]">
            Drag and drop claims to update status
          </p>
        </div>
        <Link href="/dashboard/claims">
          <Button variant="outline">
            <List className="h-4 w-4 mr-2" />
            List View
          </Button>
        </Link>
      </div>

      <KanbanBoard initialClaims={claims} />
    </div>
  );
}
