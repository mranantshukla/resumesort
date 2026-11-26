import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { GUESSTIMATES, getGuesstimate } from "@/content/guesstimates";
import { Workspace } from "@/components/workspace/Workspace";

export function generateStaticParams() {
  return GUESSTIMATES.map((g) => ({ id: g.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return { title: getGuesstimate(id)?.title ?? "Guesstimate" };
}

export default async function LearnPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const problem = getGuesstimate(id);
  if (!problem) notFound();
  return <Workspace problem={problem} />;
}
