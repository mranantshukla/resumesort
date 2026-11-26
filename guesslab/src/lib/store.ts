"use client";

// Local-first persistence. Everything a learner does is saved in this browser via a small
// external store, so sessions resume after a reload. The StorageAdapter interface is where a
// Supabase-backed adapter plugs in later (see supabase/schema.sql).

import { useSyncExternalStore } from "react";
import type { AttemptRecord, SessionState } from "@/engine/types";
import type { PracticeAttempt } from "@/engine/practiceEval";
import type { InterviewState } from "@/engine/interviewer";

export interface StorageAdapter {
  read(): Partial<AppData> | null;
  write(data: AppData): void;
}

export interface AppData {
  version: 1;
  sessions: Record<string, SessionState>;
  attempts: AttemptRecord[];
  practiceDrafts: Record<string, PracticeAttempt>;
  interview: InterviewState | null;
  school: Record<string, boolean>;
  sqlDrafts: Record<string, string>;
}

const KEY = "guesslab:v1";

const EMPTY: AppData = { version: 1, sessions: {}, attempts: [], practiceDrafts: {}, interview: null, school: {}, sqlDrafts: {} };

export const localStorageAdapter: StorageAdapter = {
  read() {
    try {
      const raw = window.localStorage.getItem(KEY);
      return raw ? (JSON.parse(raw) as Partial<AppData>) : null;
    } catch {
      return null;
    }
  },
  write(data) {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(data));
    } catch {
      /* storage full or blocked: the session still works in memory */
    }
  },
};

let adapter: StorageAdapter = localStorageAdapter;
let state: AppData = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function ensureLoaded() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  const saved = adapter.read();
  if (saved) state = { ...EMPTY, ...saved, version: 1 };
}

function emit() {
  listeners.forEach((l) => l());
}

export function setAdapter(a: StorageAdapter) {
  adapter = a;
  loaded = false;
  ensureLoaded();
  emit();
}

export function getData(): AppData {
  ensureLoaded();
  return state;
}

export function update(fn: (d: AppData) => AppData) {
  ensureLoaded();
  state = fn(state);
  adapter.write(state);
  emit();
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

/** React hook: returns [data, ready]. `ready` is false during server render and the first client paint. */
export function useAppData(): [AppData, boolean] {
  const data = useSyncExternalStore(subscribe, getData, () => EMPTY);
  const ready = useSyncExternalStore(
    subscribe,
    () => loaded,
    () => false,
  );
  return [data, ready];
}

export const actions = {
  saveSession(s: SessionState) {
    update((d) => ({ ...d, sessions: { ...d.sessions, [s.problemId]: { ...s, updatedAt: Date.now() } } }));
  },
  resetSession(problemId: string) {
    update((d) => {
      const sessions = { ...d.sessions };
      delete sessions[problemId];
      return { ...d, sessions };
    });
  },
  recordAttempt(a: AttemptRecord) {
    update((d) => ({ ...d, attempts: [...d.attempts.filter((x) => x.id !== a.id), a] }));
  },
  saveDraft(id: string, draft: PracticeAttempt) {
    update((d) => ({ ...d, practiceDrafts: { ...d.practiceDrafts, [id]: draft } }));
  },
  clearDraft(id: string) {
    update((d) => {
      const practiceDrafts = { ...d.practiceDrafts };
      delete practiceDrafts[id];
      return { ...d, practiceDrafts };
    });
  },
  saveInterview(i: InterviewState | null) {
    update((d) => ({ ...d, interview: i }));
  },
  markSchool(id: string, done: boolean) {
    update((d) => ({ ...d, school: { ...d.school, [id]: done } }));
  },
  saveSql(id: string, sql: string) {
    update((d) => ({ ...d, sqlDrafts: { ...d.sqlDrafts, [id]: sql } }));
  },
  resetAll() {
    update(() => EMPTY);
  },
};
