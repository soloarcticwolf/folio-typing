import { listDocumentsAction } from "@/actions/documents";
import DocsHome from "@/components/DocsHome";

export const dynamic = "force-dynamic";

const isFilter = (v: string | undefined): v is "all" | "owned" | "shared" =>
  v === "owned" || v === "shared" || v === "all";

export default async function DocsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter } = await searchParams;
  const { owned, shared } = await listDocumentsAction().catch(() => ({ owned: [], shared: [] }));
  return (
    <DocsHome owned={owned} shared={shared} initialFilter={isFilter(filter) ? filter : "all"} />
  );
}
