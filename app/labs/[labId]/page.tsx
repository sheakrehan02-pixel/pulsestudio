import { LABS } from "@/lib/labs";
import LabPageClient from "./LabPageClient";

export function generateStaticParams() {
  return LABS.map((lab) => ({ labId: lab.id }));
}

export default async function LabPage({
  params,
}: {
  params: Promise<{ labId: string }>;
}) {
  const { labId } = await params;
  return <LabPageClient labId={labId} />;
}
