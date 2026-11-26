import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SCHOOL } from "@/content/school";
import { ModuleView } from "@/components/school/ModuleView";

export function generateStaticParams() {
  return SCHOOL.map((m) => ({ module: m.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ module: string }> }): Promise<Metadata> {
  const { module } = await params;
  return { title: SCHOOL.find((m) => m.id === module)?.title ?? "School" };
}

export default async function ModulePage({ params }: { params: Promise<{ module: string }> }) {
  const { module } = await params;
  const m = SCHOOL.find((x) => x.id === module);
  if (!m) notFound();
  return <ModuleView module={m} />;
}
