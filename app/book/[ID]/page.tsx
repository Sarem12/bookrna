"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { Analogy } from "@/components/InfoCards/Analogy";
import { Paragraph } from "@/components/InfoCards/Paragraph";
import { LoadingScreen } from "@/components/LoadingScreen";
import { authUtils } from "@/lib/localdata";
import type { BookContentLesson, BookContentPage } from "@/lib/service/book.service";

type BookHeader = BookContentPage["book"];

type LessonUnitGroup = {
  id: string;
  title: string;
  summeries: BookContentLesson["unit"]["summeries"];
  lessons: BookContentLesson[];
};

const LESSON_PAGE_SIZE = 1;

function mergeLessonsIntoUnits(currentUnits: LessonUnitGroup[], incomingLessons: BookContentLesson[]) {
  const unitMap = new Map(currentUnits.map((unit) => [unit.id, { ...unit, lessons: [...unit.lessons] }]));

  for (const lesson of incomingLessons) {
    const unitId = lesson.unit.id;
    const existingUnit = unitMap.get(unitId);

    if (!existingUnit) {
      unitMap.set(unitId, {
        id: unitId,
        title: lesson.unit.title,
        summeries: lesson.unit.summeries,
        lessons: [lesson]
      });
      continue;
    }

    if (!existingUnit.lessons.some((existingLesson) => existingLesson.id === lesson.id)) {
      existingUnit.lessons.push(lesson);
    }
  }

  return Array.from(unitMap.values());
}

function getLessonDepthStyles(depth: number) {
  const cappedDepth = Math.min(depth, 3);

  switch (cappedDepth) {
    case 0:
      return {
        wrapper: "pl-0",
        title: "text-2xl sm:text-[1.9rem]",
        subtitle: "text-base",
        content: "text-[1rem]"
      };
    case 1:
      return {
        wrapper: "pl-4 sm:pl-8 border-l border-[var(--border)]",
        title: "text-xl sm:text-[1.45rem]",
        subtitle: "text-[15px]",
        content: "text-[15px]"
      };
    case 2:
      return {
        wrapper: "pl-6 sm:pl-10 border-l border-[var(--border)]",
        title: "text-lg sm:text-[1.2rem]",
        subtitle: "text-sm",
        content: "text-sm"
      };
    default:
      return {
        wrapper: "pl-7 sm:pl-12 border-l border-[var(--border)]",
        title: "text-base sm:text-lg",
        subtitle: "text-sm",
        content: "text-sm"
      };
  }
}

async function parseJsonResponse(response: Response) {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text) as BookContentPage | { error: string };
  } catch (error) {
    console.error("Book page JSON parse failed:", text, error);
    return { error: "Invalid server response" };
  }
}

export default function BookPage() {
  const params = useParams();
  const bookId = params.ID as string;
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const [book, setBook] = useState<BookHeader | null>(null);
  const [units, setUnits] = useState<LessonUnitGroup[]>([]);
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userId = useMemo(() => authUtils.getId(), []);

  const fetchLessons = useCallback(
    async (cursor?: number | null) => {
      if (!bookId || !userId) {
        setError("User not authenticated");
        setLoading(false);
        return;
      }

      const isFirstLoad = cursor == null;
      if (isFirstLoad) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      try {
        const searchParams = new URLSearchParams({
          userId,
          limit: String(LESSON_PAGE_SIZE)
        });

        if (cursor != null) {
          searchParams.set("cursor", String(cursor));
        }

        const response = await fetch(`/api/book/${bookId}/content?${searchParams.toString()}`);
        const result = await parseJsonResponse(response);

        if (!result || !response.ok || "error" in result) {
          setError(result && "error" in result ? result.error : "Failed to load book content");
          return;
        }

        setBook(result.book);
        setUnits((current) => mergeLessonsIntoUnits(isFirstLoad ? [] : current, result.lessons));
        setNextCursor(result.nextCursor);
        setHasMore(result.hasMore);
        setError(null);
      } catch (err) {
        setError("Failed to load book content");
        console.error(err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [bookId, userId]
  );

  useEffect(() => {
    setBook(null);
    setUnits([]);
    setNextCursor(null);
    setHasMore(true);
    setError(null);

    if (bookId) {
      void fetchLessons();
    }
  }, [bookId, fetchLessons]);

  useEffect(() => {
    if (!hasMore || nextCursor == null || loading || loadingMore) {
      return;
    }

    const sentinel = loadMoreRef.current;
    if (!sentinel) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void fetchLessons(nextCursor);
        }
      },
      { rootMargin: "240px 0px" }
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [fetchLessons, hasMore, loading, loadingMore, nextCursor]);

  if (loading && units.length === 0) {
    return <LoadingScreen fullPage label="Loading book" />;
  }

  if (error && units.length === 0) {
    return <div className="px-5 py-8 text-[var(--danger-fg)] sm:px-6 lg:px-8">Error: {error}</div>;
  }

  if (!book) {
    return <div className="px-5 py-8 text-[var(--muted)] sm:px-6 lg:px-8">Book not found</div>;
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[var(--background)]v px-50">
      <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <section className="mb-8 rounded-[28px] border border-[var(--border)] bg-[var(--surface)] px-6 py-6 sm:px-8">
          <h1 className="font-ui text-3xl text-[var(--foreground)] sm:text-4xl">
            {book.subject} - Grade {book.grade}
          </h1>
        </section>

        <div className="space-y-6">
          {units.map((unit) => (
            <section key={unit.id} className="border-b border-[var(--border)] pb-10 last:border-b-0 last:pb-0">
              <h2 className="font-ui text-2xl text-[var(--foreground)] sm:text-3xl">{unit.title}</h2>

              {unit.summeries
                .filter((summary) => summary.activeInSlots?.onuse === true)
                .map((summary) => (
                  <div key={summary.id} className="mt-4 max-w-4xl text-[var(--foreground)]">
                    <ReactMarkdown>{summary.content}</ReactMarkdown>
                  </div>
                ))}

              <div className="mt-8 space-y-10">
                {unit.lessons.map((lesson) => {
                  const depthStyles = getLessonDepthStyles(lesson.depth);

                  return (
                    <div key={lesson.id} className={depthStyles.wrapper}>
                      <h3 className={`font-ui text-[var(--foreground)] ${depthStyles.title}`}>{lesson.title}</h3>

                      {lesson.summeries
                        .filter((summary) => summary.activeInSlots?.onuse === true)
                        .map((summary) => (
                          <div key={summary.id} className={`mt-4 max-w-4xl text-[var(--foreground)] ${depthStyles.content}`}>
                            <ReactMarkdown>{summary.content}</ReactMarkdown>
                          </div>
                        ))}

                      {lesson.notes
                        .filter((note) => note.activeInSlots?.onuse === true)
                        .map((note) => (
                          <div key={note.id} className={`mt-4 max-w-4xl text-[var(--foreground)] ${depthStyles.content}`}>
                            <ReactMarkdown>{note.content}</ReactMarkdown>
                          </div>
                        ))}

                      <div className="mt-4 space-y-4">
                        {lesson.analogies
                          .filter((analogy) => analogy.activeInSlots?.onuse === true)
                          .map((analogy) => (
                            <Analogy key={analogy.id} analogy={analogy as any} />
                          ))}
                      </div>

                      {lesson.keywords
                        .filter((keyword) => keyword.activeInSlots?.onuse === true)
                        .map((keyword: any) => (
                          <div key={keyword.id} className={`mt-4 max-w-3xl text-[var(--muted)] ${depthStyles.subtitle}`}>
                            <ReactMarkdown>{keyword.content || keyword.id}</ReactMarkdown>
                          </div>
                        ))}

                      <div className="mt-5 space-y-6">
                        {lesson.realParagraphs.map((rp) => {
                          const chosenParagraph = rp.paragraphs?.[0]?.activeInDefault;

                          return (
                            <div key={rp.id} className="max-w-4xl">
                              <Paragraph
                                paragraph={{
                                  id: rp.id,
                                  content: chosenParagraph?.content || rp.content || "No paragraph content available"
                                }}
                              />

                              <div className="mt-4 space-y-4">
                                {rp.analogies
                                  .filter((analogy) => analogy.activeInSlots?.onuse === true)
                                  .map((analogy: any) => (
                                    <Analogy key={analogy.id} analogy={analogy} />
                                  ))}
                              </div>

                              {lesson.notes
                                .filter((note) => note.activeInSlots?.onuse === true)
                                .map((note: any) => (
                                  <div key={`note-${note.id}`} className={`mt-4 text-[var(--foreground)] ${depthStyles.content}`}>
                                    <ReactMarkdown>{note.content}</ReactMarkdown>
                                  </div>
                                ))}

                              {rp.keywords
                                ?.filter((keyword) => keyword.activeInSlots?.onuse === true)
                                .map((keyword: any) => (
                                  <div key={keyword.id} className={`mt-4 text-[var(--muted)] ${depthStyles.subtitle}`}>
                                    <ReactMarkdown>{keyword.content || "No keyword text"}</ReactMarkdown>
                                  </div>
                                ))}

                              {lesson.summeries
                                ?.filter((summary) => summary.activeInSlots?.onuse === true)
                                .map((summary: any) => (
                                  <div key={`summary-${summary.id}`} className={`mt-4 text-[var(--foreground)] ${depthStyles.content}`}>
                                    <ReactMarkdown>{summary.content}</ReactMarkdown>
                                  </div>
                                ))}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        {error && units.length > 0 && <div className="mt-6 text-sm text-[var(--danger-fg)]">Error: {error}</div>}

        {hasMore && <div ref={loadMoreRef} className="h-10" aria-hidden="true" />}

        {loadingMore && (
          <div className="flex items-center justify-center py-6">
            <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--muted)]" />
              <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--muted)] [animation-delay:120ms]" />
              <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--muted)] [animation-delay:240ms]" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
