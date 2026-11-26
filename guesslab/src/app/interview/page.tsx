import { Suspense } from "react";
import type { Metadata } from "next";
import { Interviewer } from "@/components/interview/Interviewer";

export const metadata: Metadata = { title: "AI interviewer" };

export default function InterviewPage() {
  return (
    <Suspense>
      <Interviewer />
    </Suspense>
  );
}
