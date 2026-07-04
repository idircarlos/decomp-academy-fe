import { ALL_LESSON_SOURCES } from "@/curriculum";
import { CHAPTERS, getChapter } from "@/curriculum/chapters";
import { TIERS, getTier } from "@/curriculum/tiers";
import { COURSES, COURSE_BY_ID, DEFAULT_COURSE } from "@/curriculum/courses";
import { LessonSource } from "./types";

const courseOrder = new Map(COURSES.map((c) => [c.id, c.order]));
// Chapter order restarts per course, so the lookup is keyed by "<course>/<chapter>".
const chapterOrder = new Map(CHAPTERS.map((c) => [`${c.course}/${c.id}`, c.order]));

// Canonical, fully-ordered lesson list (course order, then chapter order, then
// in-chapter order).
export const LESSONS: LessonSource[] = [...ALL_LESSON_SOURCES].sort((a, b) => {
  const co = (courseOrder.get(a.course) ?? 999) - (courseOrder.get(b.course) ?? 999);
  if (co) return co;
  const ca = chapterOrder.get(`${a.course}/${a.chapter}`) ?? 999;
  const cb = chapterOrder.get(`${b.course}/${b.chapter}`) ?? 999;
  if (ca !== cb) return ca - cb;
  return a.order - b.order;
});

// A lesson is addressed by (course, slug): slugs only need to be unique within
// their course, so the lookup key is composite. The build enforces per-course
// slug uniqueness, so this map never silently collides.
const lessonKey = (course: string, slug: string) => `${course}/${slug}`;
const byKey = new Map(LESSONS.map((l) => [lessonKey(l.course, l.slug), l]));

export function getLesson(course: string, slug: string): LessonSource | undefined {
  return byKey.get(lessonKey(course, slug));
}

/** Lessons belonging to a single course, in curriculum order. */
export function lessonsForCourse(courseId: string): LessonSource[] {
  return LESSONS.filter((l) => l.course === courseId);
}

export function lessonIndex(course: string, slug: string): number {
  return LESSONS.findIndex((l) => l.course === course && l.slug === slug);
}

// prev/next stay within the lesson's own course — the global list is already
// course-grouped, so we just clamp at the course boundary.
export function adjacentLessons(
  course: string,
  slug: string,
): {
  prev?: LessonSource;
  next?: LessonSource;
} {
  const i = lessonIndex(course, slug);
  if (i < 0) return {};
  const prev = i > 0 && LESSONS[i - 1].course === course ? LESSONS[i - 1] : undefined;
  const next =
    i < LESSONS.length - 1 && LESSONS[i + 1].course === course ? LESSONS[i + 1] : undefined;
  return { prev, next };
}

export interface ChapterWithLessons {
  id: string;
  title: string;
  blurb: string;
  order: number;
  tier: string;
  course: string;
  lessons: LessonSource[];
}

// Chapters with their lessons attached. Pass a courseId to restrict to one
// course. The lesson match is by (course, tier, chapter) because a chapter id is
// only unique within its tier — matching on chapter id alone would give two
// same-id chapters (e.g. each tier's "finale") each other's lessons.
export function chaptersWithLessons(courseId?: string): ChapterWithLessons[] {
  const chapters = courseId ? CHAPTERS.filter((c) => c.course === courseId) : CHAPTERS;
  return chapters.map((c) => ({
    ...c,
    lessons: LESSONS.filter(
      (l) => l.course === c.course && l.tier === c.tier && l.chapter === c.id,
    ),
  }));
}

export { CHAPTERS, getChapter, TIERS, getTier, COURSES, COURSE_BY_ID, DEFAULT_COURSE };
