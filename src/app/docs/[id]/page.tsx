import Link from "next/link";
import { FileSearch } from "lucide-react";
import { getDocumentAction } from "@/actions/documents";
import { DocWorkspace } from "@/components/DocWorkspace";
import { EmptyState } from "@/components/ui/primitives";
import { Button } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

export default async function DocPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let data;
  try {
    data = await getDocumentAction(id);
  } catch {
    return (
      <div className="mx-auto w-full max-w-[640px] px-4 py-16">
        <EmptyState
          icon={<FileSearch size={20} />}
          title="Document not found"
          message="It may have been deleted, or you don't have access to it."
          action={
            <Link href="/docs">
              <Button variant="secondary" size="sm">
                Back to documents
              </Button>
            </Link>
          }
        />
      </div>
    );
  }
  return <DocWorkspace doc={data.doc} role={data.role} />;
}
