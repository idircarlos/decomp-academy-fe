import type { ObjDiffVM } from "@/lib/objdiff/client";
import type { GraderKind } from "@/lib/lessons/types";

export interface LessonDTO {
  slug: string;
  course: string;
  title: string;
  chapterId: string;
  chapterTitle: string;
  difficulty: number;
  concepts: string[];
  briefHtml: string;
  concept: boolean;
  symbol: string;
  starter: string;
  solution: string;
  context?: string;
  hints: string[];
  grader: GraderKind;
  prev: { slug: string; title: string } | null;
  next: { slug: string; title: string } | null;
}

export type Status = "idle" | "running" | "match" | "close" | "compileError" | "error";

export interface CheckState {
  status: Status;
  matchPercent?: number;
  vm?: ObjDiffVM;
  message?: string;
  firstEver?: boolean;
  noHints?: boolean;
}

export type Tab = "diff" | "objects" | "console";
