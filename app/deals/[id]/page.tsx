import { notFound } from "next/navigation";
import { getDeal, deals } from "@/lib/data";
import { DealHeader } from "@/components/DealHeader";
import { DealTabs } from "@/components/DealTabs";

export function generateStaticParams() {
  return deals.map((d) => ({ id: d.id }));
}

export default async function DealPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const deal = getDeal(id);
  if (!deal) notFound();
  return (
    <>
      <DealHeader deal={deal} />
      <DealTabs deal={deal} />
    </>
  );
}
