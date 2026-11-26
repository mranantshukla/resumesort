import type { RubricDimension, SourceRef } from "@/engine/types";

export const STANDARD_RUBRIC: RubricDimension[] = [
  { id: "clarifying", label: "Clarifying questions", weight: 15, criteria: ["Defines the metric and unit", "Asks questions that change the answer", "Doesn't ask the interviewer for facts you should assume"] },
  { id: "structuring", label: "Structuring", weight: 25, criteria: ["Segments are mutually exclusive", "Segments are collectively exhaustive", "Structure matches the metric's unit"] },
  { id: "assumptions", label: "Assumptions", weight: 20, criteria: ["Each number is stated and justified", "Numbers sit in a defensible range", "Verified data separated from guesses"] },
  { id: "math", label: "Mathematical accuracy", weight: 15, criteria: ["Correct arithmetic", "Consistent units", "Powers of ten tracked (lakh, crore)"] },
  { id: "intuition", label: "Business intuition", weight: 10, criteria: ["Identifies the key driver", "Cross-checks with a second method", "Answer is in a sensible range"] },
  { id: "communication", label: "Communication", weight: 15, criteria: ["Clear structure", "Range, not just a point", "States limitations"] },
];

export const SRC = {
  unWpp2022: {
    name: "UN World Population Prospects 2022",
    geography: "India",
    date: "2023 estimate",
    unit: "people",
    reliability: "official-estimate",
    note: "India's 2023 population estimated at about 142.9 crore. Use 140–145 crore in interviews.",
  } satisfies SourceRef,
  census2011Urban: {
    name: "Census of India 2011",
    geography: "India",
    date: "2011",
    unit: "% of population",
    reliability: "verified",
    note: "Urban share 31.1% in 2011; it has risen since, commonly estimated at 35–37%.",
  } satisfies SourceRef,
  teaBoard: {
    name: "Tea Board of India (domestic consumption estimates)",
    geography: "India",
    date: "recent years",
    unit: "kg of tea per year",
    reliability: "secondary",
    note: "Domestic tea consumption is commonly cited at roughly 1.1–1.2 billion kg a year. Verify the latest figure before quoting it.",
  } satisfies SourceRef,
  eternalQ2Fy27: {
    name: "Eternal Ltd Q2 FY27 results, as reported by Business Standard and others",
    geography: "India",
    date: "Quarter ended Sep 2026 (reported 21 Oct 2026)",
    unit: "₹ crore per quarter",
    reliability: "secondary",
    note: "Food delivery NOV about ₹11,445 crore in the quarter. Check the official shareholder letter before quoting.",
  } satisfies SourceRef,
  screens: {
    name: "Industry reports on Indian cinema screen count",
    geography: "India",
    date: "2023–2025",
    unit: "screens",
    reliability: "secondary",
    note: "India has roughly 9,000–10,000 active cinema screens. Figures vary by source and year.",
  } satisfies SourceRef,
};
