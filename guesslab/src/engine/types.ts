// Core data model for GuessLab. Content files (src/content) are plain data that follow these types;
// the engine (src/engine) is pure logic; components only render and dispatch.

export type Difficulty = "beginner" | "intermediate" | "advanced";

export type Category =
  | "population"
  | "consumption"
  | "revenue"
  | "supply-side"
  | "demand-side"
  | "capacity"
  | "infrastructure"
  | "digital-product"
  | "marketplace"
  | "operations";

/** How trustworthy a number is. Every statistic shown to learners carries one of these. */
export type Reliability = "verified" | "official-estimate" | "secondary" | "illustrative";

export interface SourceRef {
  name: string;
  geography: string;
  date: string;
  unit: string;
  reliability: Reliability;
  note?: string;
}

/** An assumption the learner can edit. Percent-type values are stored as fractions (0.65 = 65%). */
export interface Variable {
  id: string;
  label: string;
  /** Unit string understood by engine/units.ts, e.g. "cup/person/day", "%", "INR/plate". */
  unit: string;
  /** Friendly unit shown to learners when the engine unit is awkward. */
  displayUnit?: string;
  value: number;
  min: number;
  max: number;
  step: number;
  /** Values outside this range trigger an assumption-validation warning. */
  plausible: [number, number];
  reliability: Reliability;
  source?: SourceRef;
  /** How a learner could derive this number in an interview. */
  derive: string;
  /** Short nudge shown when the value looks off. */
  hint?: string;
}

export type NodeKind = "var" | "product" | "sum" | "divide" | "min";

export interface TreeNode {
  id: string;
  label: string;
  kind: NodeKind;
  varId?: string;
  children?: TreeNode[];
  /** Expected unit of this node's result; used for unit-consistency checks. */
  unit?: string;
  note?: string;
  /** Custom nodes added by the learner are marked so the UI can style and remove them. */
  custom?: boolean;
  /** For learner-added nodes: literal value and unit instead of a Variable. */
  literal?: { value: number; unit: string };
}

export interface Approach {
  id: string;
  name: string;
  direction: "top-down" | "bottom-up";
  side: "demand" | "supply" | "unconventional";
  summary: string;
  tree: TreeNode;
}

/** Guidance that every stage carries (spec section 2). */
export interface StageGuide {
  task: string;
  ask: string[];
  why: string;
  info: string[];
  derive: string;
  formula?: string;
  mistakes: string[];
  /** Progressive hints, gentlest first. */
  hints: string[];
  /** Questions the Socratic coach asks instead of answering. */
  socratic: string[];
  /** Full reasoning, revealed only after the learner completes the stage. */
  explanation: string;
}

export interface ChoiceOption {
  id: string;
  text: string;
  correct?: boolean;
  /** Marks a defensible answer that differs from the model's (methodology difference, not an error). */
  alternative?: boolean;
  feedback: string;
}

export interface ChoiceQuestion {
  id: string;
  prompt: string;
  options: ChoiceOption[];
}

export interface ScopeField {
  id: string;
  label: string;
  options: ChoiceOption[];
}

export interface ClarifyingQuestion {
  id: string;
  text: string;
  quality: "strong" | "okay" | "weak";
  why: string;
  /** What the interviewer says if asked. */
  answer: string;
}

export interface SegmentOption {
  id: string;
  label: string;
  /** Atoms of the universe this segment covers. Two options sharing an atom double-count. */
  covers: string[];
  feedback: string;
}

export interface SegmentPicker {
  prompt: string;
  /** Every atom must be covered exactly once for a MECE split. */
  universe: { id: string; label: string }[];
  options: SegmentOption[];
}

export interface CalcStep {
  nodeId: string;
  prompt: string;
  hint: string;
}

export interface SanityCheck {
  label: string;
  explain: string;
  source?: SourceRef;
}

export interface RubricDimension {
  id: SkillId;
  label: string;
  weight: number;
  criteria: string[];
}

export type SkillId =
  | "clarifying"
  | "structuring"
  | "assumptions"
  | "math"
  | "intuition"
  | "communication";

export interface Guesstimate {
  id: string;
  title: string;
  prompt: string;
  context: string;
  categories: Category[];
  difficulty: Difficulty;
  minutes: number;
  objectives: string[];
  prerequisites: string[];
  /** e.g. "cups of chai per day" */
  metric: string;
  answerUnit: string;
  answerUnitLabel: string;
  attribution?: string;
  variables: Variable[];
  /** Shares that must add up (e.g. heavy + light users = 100%). Breaking one double counts or leaves a gap. */
  constraints?: { vars: string[]; sum: number; message: string }[];
  approaches: Approach[];
  /** The approach used in the calculation stage. Others are for comparison/triangulation. */
  primaryApproach: string;
  stages: {
    understanding: { guide: StageGuide; checks: ChoiceQuestion[]; scope: ScopeField[] };
    clarifying: { guide: StageGuide; maxPicks: number; questions: ClarifyingQuestion[] };
    structuring: { guide: StageGuide; picker: SegmentPicker };
    assumptions: { guide: StageGuide };
    calculation: { guide: StageGuide; steps: CalcStep[] };
    sensitivity: { guide: StageGuide; prompt: string };
    final: { guide: StageGuide; sanity: SanityCheck[]; referenceRange: [number, number]; segmentationPhrase: string };
    evaluation: { guide: StageGuide; rubric: RubricDimension[] };
  };
}

export const STAGE_ORDER = [
  "understanding",
  "clarifying",
  "structuring",
  "assumptions",
  "calculation",
  "sensitivity",
  "final",
  "evaluation",
] as const;
export type StageId = (typeof STAGE_ORDER)[number];

export const STAGE_LABELS: Record<StageId, string> = {
  understanding: "Problem understanding",
  clarifying: "Clarifying questions",
  structuring: "Problem structuring",
  assumptions: "Assumptions",
  calculation: "Calculation",
  sensitivity: "Sensitivity analysis",
  final: "Final answer",
  evaluation: "Evaluation",
};

export const SKILL_LABELS: Record<SkillId, string> = {
  clarifying: "Clarifying questions",
  structuring: "Structuring",
  assumptions: "Assumptions",
  math: "Mathematical accuracy",
  intuition: "Business intuition",
  communication: "Communication",
};

/** Everything the learner has done on one guesstimate. Serializable for save and resume. */
export interface SessionState {
  problemId: string;
  startedAt: number;
  updatedAt: number;
  stage: StageId;
  completed: StageId[];
  understanding: { answers: Record<string, string>; scope: Record<string, string> };
  clarifying: { picked: string[]; asked: boolean };
  structuring: { picked: string[]; checks: number; passedOnCheck: number | null; approach: string; comparedApproaches: boolean };
  values: Record<string, number>;
  tree: { excluded: string[]; custom: Record<string, TreeNode[]> };
  assumptions: { confirmed: string[]; derivationsViewed: string[] };
  calculation: { entries: Record<string, number>; attempts: Record<string, number>; correct: string[]; revealed: string[] };
  sensitivity: { answer: string | null; correct: boolean | null };
  final: { text: string; generated: boolean };
  hintsUsed: Record<string, number>;
  notes: string;
  evaluation: EvaluationResult | null;
}

export type FeedbackType = "factual" | "alternative" | "methodology" | "strength";

export interface FeedbackItem {
  type: FeedbackType;
  skill: SkillId;
  text: string;
}

export interface EvaluationResult {
  scores: Record<SkillId, number>;
  overall: number;
  feedback: FeedbackItem[];
  answer: number;
  withinReference: "inside" | "near" | "far";
  minutes: number;
  mistakes: string[];
}

/** A finished attempt of any kind, used by the Performance page. */
export interface AttemptRecord {
  id: string;
  kind: "guided" | "practice" | "interview" | "school";
  problemId: string;
  title: string;
  at: number;
  minutes: number;
  scores: Partial<Record<SkillId, number>>;
  overall: number;
  mistakes: string[];
}
