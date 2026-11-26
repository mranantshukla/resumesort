import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PRACTICE, getPractice } from "@/content/practice";
import { Arena } from "@/components/practice/Arena";

export function generateStaticParams() {
  return PRACTICE.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return { title: getPractice(id)?.title ?? "Practice" };
}

export default async function PracticePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const problem = getPractice(id);
  if (!problem) notFound();
  return <Arena problem={problem} />;
}
