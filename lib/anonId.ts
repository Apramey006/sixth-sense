"use client";
import { v4 as uuidv4 } from "uuid";

const KEY = "taste-reps:anon-id";

export function getAnonId(): string {
  if (typeof window === "undefined") return "";
  let id = window.localStorage.getItem(KEY);
  if (!id) {
    id = uuidv4();
    window.localStorage.setItem(KEY, id);
  }
  return id;
}

const COMPLETIONS_KEY = "taste-reps:completions";

type Completions = { daily: Record<string, true>; weekly: Record<string, true> };

function readCompletions(): Completions {
  if (typeof window === "undefined") return { daily: {}, weekly: {} };
  const raw = window.localStorage.getItem(COMPLETIONS_KEY);
  if (!raw) return { daily: {}, weekly: {} };
  try {
    return JSON.parse(raw) as Completions;
  } catch {
    return { daily: {}, weekly: {} };
  }
}

function writeCompletions(c: Completions) {
  window.localStorage.setItem(COMPLETIONS_KEY, JSON.stringify(c));
}

export function markCompleted(kind: "daily" | "weekly", key: string) {
  const c = readCompletions();
  c[kind][key] = true;
  writeCompletions(c);
}

export function isCompleted(kind: "daily" | "weekly", key: string): boolean {
  return Boolean(readCompletions()[kind][key]);
}
