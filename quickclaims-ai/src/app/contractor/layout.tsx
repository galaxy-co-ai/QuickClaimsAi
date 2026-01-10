export const dynamic = "force-dynamic";

import { ContractorSidebar } from "@/components/layout/contractor-sidebar";
import { Header } from "@/components/layout/header";

export default function ContractorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <ContractorSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-slate-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
