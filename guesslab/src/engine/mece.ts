import type { SegmentOption, SegmentPicker } from "./types";

export interface MeceResult {
  isMece: boolean;
  overlaps: { a: SegmentOption; b: SegmentOption; shared: string[] }[];
  missing: string[];
  chosen: SegmentOption[];
}

/**
 * A segmentation is MECE when every atom of the universe is covered exactly once.
 * Overlaps mean double counting; missing atoms mean an incomplete estimate.
 */
export function checkSegments(picker: SegmentPicker, pickedIds: string[]): MeceResult {
  const chosen = picker.options.filter((o) => pickedIds.includes(o.id));
  const overlaps: MeceResult["overlaps"] = [];
  for (let i = 0; i < chosen.length; i++) {
    for (let j = i + 1; j < chosen.length; j++) {
      const shared = chosen[i].covers.filter((c) => chosen[j].covers.includes(c));
      if (shared.length) overlaps.push({ a: chosen[i], b: chosen[j], shared });
    }
  }
  const covered = new Set(chosen.flatMap((c) => c.covers));
  const missing = picker.universe.map((u) => u.id).filter((id) => !covered.has(id));
  return { isMece: chosen.length > 0 && overlaps.length === 0 && missing.length === 0, overlaps, missing, chosen };
}

const PEOPLE_WORDS = [
  "student", "students", "worker", "workers", "professional", "professionals", "adult", "adults", "youth",
  "family", "families", "people", "users", "customers", "employees", "kids", "children", "seniors", "women", "men",
];

/**
 * Heuristic for learner-written segment labels in the Practice Arena: flags pairs that both describe groups of
 * people with an overlapping word, or a segment that names a broader group containing another.
 */
export function suspectOverlaps(labels: string[]): { a: string; b: string; reason: string }[] {
  const out: { a: string; b: string; reason: string }[] = [];
  const tokens = labels.map((l) => l.toLowerCase().split(/[^a-z0-9]+/).filter((t) => t.length > 2));
  for (let i = 0; i < labels.length; i++) {
    for (let j = i + 1; j < labels.length; j++) {
      const shared = tokens[i].filter((t) => tokens[j].includes(t) && !["per", "the", "and", "day", "per"].includes(t));
      const peopleI = tokens[i].some((t) => PEOPLE_WORDS.includes(t));
      const peopleJ = tokens[j].some((t) => PEOPLE_WORDS.includes(t));
      const timeWords = ["weekend", "weekday", "festival", "peak", "night"];
      const occasionI = tokens[i].some((t) => timeWords.includes(t));
      const occasionJ = tokens[j].some((t) => timeWords.includes(t));
      if (shared.length) {
        out.push({ a: labels[i], b: labels[j], reason: `Both mention “${shared[0]}”. Could the same person or item be counted in both?` });
      } else if (peopleI && peopleJ) {
        out.push({ a: labels[i], b: labels[j], reason: "Both are groups of people. Can someone belong to both (e.g., a student who also works)?" });
      } else if ((occasionI && peopleJ) || (occasionJ && peopleI)) {
        out.push({ a: labels[i], b: labels[j], reason: "One segment is a time or occasion and the other is a group of people. Those cut across each other and usually double count." });
      }
    }
  }
  return out;
}
