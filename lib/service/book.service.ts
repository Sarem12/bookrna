"use server";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { GetParagraph } from "./content/paragraph.service";
import { FullBookContent } from "../types";

/**
 * GET ALL BOOKS
 * Fetches all books with a count of their units for the Home Page
 */
export async function getAllBooks() {
  try {
    return await prisma.book.findMany({
      select: {
        id: true,
        subject: true,
        grade: true,
        imgUrl: true,
        units: {
          select: { id: true }
        }
      },
      orderBy: { subject: "asc" }
    });
  } catch (error) {
    console.error("Error fetching books:", error);
    return [];
  }
}

/**
 * GET BOOK DETAILS
 * Fetches a single book and all its units/lessons when a user clicks it
 */
export async function getBookById(bookId: string) {
  return await prisma.book.findUnique({
    where: { id: bookId },
    include: {
      units: {
        include: {
          lessons: {
            orderBy: { index: "asc" }
          }
        }
      }
    }
  });
}

const bookContentInclude = (userId: string) =>
  ({
    lessons: {
      orderBy: { index: "asc" },
      include: {
        realParagraphs: {
          orderBy: { order: "asc" },
          include: {
            paragraphs: {
              where: { UserId: userId },
              include: {
                activeInDefault: true
              }
            },
            analogies: {
              where: {
                activeInSlots: {
                  is: { UserId: userId }
                }
              },
              include: {
                activeInSlots: true,
                userActions: {
                  where: { UserId: userId }
                }
              }
            },
            keywords: {
              where: {
                activeInSlots: {
                  is: { UserId: userId }
                }
              },
              include: {
                activeInSlots: true
              }
            }
          }
        },
        summeries: {
          where: {
            activeInSlots: {
              is: { UserId: userId }
            }
          },
          include: {
            activeInSlots: true
          }
        },
        notes: {
          where: {
            activeInSlots: {
              is: { UserId: userId }
            }
          },
          include: {
            activeInSlots: true
          }
        },
        analogies: {
          where: {
            activeInSlots: {
              is: { UserId: userId }
            }
          },
          include: {
            activeInSlots: true,
            userActions: {
              where: { UserId: userId }
            }
          }
        },
        keywords: {
          where: {
            activeInSlots: {
              is: { UserId: userId }
            }
          },
          include: { activeInSlots: true }
        },
        SubLessons: true
      }
    },
    summeries: {
      where: {
        activeInSlots: {
          is: { UserId: userId, onuse: true }
        }
      },
      include: {
        activeInSlots: true
      }
    }
  }) satisfies Prisma.UnitInclude;

const lessonContentInclude = (userId: string) =>
  ({
    unit: {
      select: {
        id: true,
        title: true,
        summeries: {
          where: {
            activeInSlots: {
              is: { UserId: userId, onuse: true }
            }
          },
          include: {
            activeInSlots: true
          }
        }
      }
    },
    realParagraphs: {
      orderBy: { order: "asc" },
      include: {
        paragraphs: {
          where: { UserId: userId },
          include: {
            activeInDefault: true
          }
        },
        analogies: {
          where: {
            activeInSlots: {
              is: { UserId: userId }
            }
          },
          include: {
            activeInSlots: true,
            userActions: {
              where: { UserId: userId }
            }
          }
        },
        keywords: {
          where: {
            activeInSlots: {
              is: { UserId: userId }
            }
          },
          include: {
            activeInSlots: true
          }
        }
      }
    },
    summeries: {
      where: {
        activeInSlots: {
          is: { UserId: userId }
        }
      },
      include: {
        activeInSlots: true
      }
    },
    notes: {
      where: {
        activeInSlots: {
          is: { UserId: userId }
        }
      },
      include: {
        activeInSlots: true
      }
    },
    analogies: {
      where: {
        activeInSlots: {
          is: { UserId: userId }
        }
      },
      include: {
        activeInSlots: true,
        userActions: {
          where: { UserId: userId }
        }
      }
    },
    keywords: {
      where: {
        activeInSlots: {
          is: { UserId: userId }
        }
      },
      include: { activeInSlots: true }
    }
  }) satisfies Prisma.LessonInclude;

export type BookContentUnit = Prisma.UnitGetPayload<{
  include: ReturnType<typeof bookContentInclude>;
}>;

export type BookContentLesson = Prisma.LessonGetPayload<{
  include: ReturnType<typeof lessonContentInclude>;
}> & {
  depth: number;
};

export type BookContentPage = {
  book: {
    id: string;
    subject: string;
    grade: number;
    imgUrl: string;
    totalUnits: number;
    totalLessons: number;
  };
  lessons: BookContentLesson[];
  nextCursor: number | null;
  hasMore: boolean;
};

async function linkResolvedParagraphToUserSlot(userId: string, rp: { id: string; LessonId: string }, resolvedParagraphId: string) {
  const existingSlot = await prisma.defaultParagraph.findFirst({
    where: { UserId: userId, RealParagraphId: rp.id },
    include: { activeInDefault: true }
  });

  if (existingSlot) {
    if (existingSlot.ParagraphId !== resolvedParagraphId) {
      await prisma.defaultParagraph.update({
        where: { id: existingSlot.id },
        data: {
          ParagraphId: resolvedParagraphId,
          onuse: true
        }
      });
    }
    return;
  }

  try {
    await prisma.defaultParagraph.create({
      data: {
        UserId: userId,
        RealParagraphId: rp.id,
        LessonId: rp.LessonId,
        ParagraphId: resolvedParagraphId,
        order: 0,
        onuse: true
      }
    });
  } catch (error: any) {
    // The paragraph may already have been linked during generation or by a concurrent request.
    if (error?.code !== "P2002") {
      throw error;
    }
  }
}

async function ensureRealParagraphDefaults(units: BookContentUnit[], userId: string) {
  return await Promise.all(
    units.map(async (unit) => ({
      ...unit,
      lessons: await Promise.all(
        unit.lessons.map(async (lesson) => ({
          ...lesson,
          realParagraphs: await Promise.all(
            lesson.realParagraphs.map(async (rp) => {
              const activeParagraph = rp.paragraphs?.find((entry: any) => entry.activeInDefault)?.activeInDefault;
              if (activeParagraph) {
                return rp;
              }

              const resolvedParagraph = await GetParagraph(userId, rp.id);
              if ((resolvedParagraph as any)?.error || !resolvedParagraph?.id) {
                return rp;
              }

              await linkResolvedParagraphToUserSlot(userId, { id: rp.id, LessonId: rp.LessonId }, resolvedParagraph.id);

              const hydratedSlot = await prisma.defaultParagraph.findFirst({
                where: { UserId: userId, RealParagraphId: rp.id },
                include: { activeInDefault: true }
              });

              return {
                ...rp,
                paragraphs: hydratedSlot ? [hydratedSlot] : rp.paragraphs
              };
            })
          )
        }))
      )
    }))
  );
}

async function incrementLoadedContentViews(units: BookContentUnit[]) {
  const paragraphIds = units.flatMap((unit) =>
    unit.lessons.flatMap((lesson) =>
      lesson.realParagraphs
        .map((rp) => rp.paragraphs?.find((entry: any) => entry.activeInDefault)?.activeInDefault?.id)
        .filter((id): id is string => Boolean(id))
    )
  );

  const analogyIds = units.flatMap((unit) =>
    unit.lessons.flatMap((lesson) => [
      ...lesson.analogies.map((analogy) => analogy.id),
      ...lesson.realParagraphs.flatMap((rp) => rp.analogies.map((analogy) => analogy.id))
    ])
  );

  const updates = [
    ...paragraphIds.map((id) =>
      prisma.paragraph.update({
        where: { id },
        data: { views: { increment: 1 } }
      })
    ),
    ...analogyIds.map((id) =>
      prisma.analogy.update({
        where: { id },
        data: { views: { increment: 1 } }
      })
    )
  ];

  if (updates.length > 0) {
    await prisma.$transaction(updates);
  }
}

async function ensureLessonParagraphDefaults(lessons: BookContentLesson[], userId: string) {
  return await Promise.all(
    lessons.map(async (lesson) => ({
      ...lesson,
      realParagraphs: await Promise.all(
        lesson.realParagraphs.map(async (rp) => {
          const activeParagraph = rp.paragraphs?.find((entry: any) => entry.activeInDefault)?.activeInDefault;
          if (activeParagraph) {
            return rp;
          }

          const resolvedParagraph = await GetParagraph(userId, rp.id);
          if ((resolvedParagraph as any)?.error || !resolvedParagraph?.id) {
            return rp;
          }

          await linkResolvedParagraphToUserSlot(userId, { id: rp.id, LessonId: rp.LessonId }, resolvedParagraph.id);

          const hydratedSlot = await prisma.defaultParagraph.findFirst({
            where: { UserId: userId, RealParagraphId: rp.id },
            include: { activeInDefault: true }
          });

          return {
            ...rp,
            paragraphs: hydratedSlot ? [hydratedSlot] : rp.paragraphs
          };
        })
      )
    }))
  );
}

async function incrementLoadedLessonViews(lessons: BookContentLesson[]) {
  const paragraphIds = lessons.flatMap((lesson) =>
    lesson.realParagraphs
      .map((rp) => rp.paragraphs?.find((entry: any) => entry.activeInDefault)?.activeInDefault?.id)
      .filter((id): id is string => Boolean(id))
  );

  const analogyIds = lessons.flatMap((lesson) => [
    ...lesson.analogies.map((analogy) => analogy.id),
    ...lesson.realParagraphs.flatMap((rp) => rp.analogies.map((analogy) => analogy.id))
  ]);

  const updates = [
    ...paragraphIds.map((id) =>
      prisma.paragraph.update({
        where: { id },
        data: { views: { increment: 1 } }
      })
    ),
    ...analogyIds.map((id) =>
      prisma.analogy.update({
        where: { id },
        data: { views: { increment: 1 } }
      })
    )
  ];

  if (updates.length > 0) {
    await prisma.$transaction(updates);
  }
}

type LessonManifestItem = {
  id: string;
  depth: number;
  unitId: string;
};

function flattenLessonTree(
  lessons: Array<{ id: string; unitId: string; ParentLessonId: string | null; index: number }>
) {
  const byParent = new Map<string | null, Array<{ id: string; unitId: string; ParentLessonId: string | null; index: number }>>();

  for (const lesson of lessons) {
    const key = lesson.ParentLessonId ?? null;
    const bucket = byParent.get(key) ?? [];
    bucket.push(lesson);
    byParent.set(key, bucket);
  }

  for (const bucket of byParent.values()) {
    bucket.sort((a, b) => a.index - b.index || a.id.localeCompare(b.id));
  }

  const result: LessonManifestItem[] = [];

  const visit = (parentId: string | null, depth: number) => {
    const children = byParent.get(parentId) ?? [];
    for (const child of children) {
      result.push({ id: child.id, depth, unitId: child.unitId });
      visit(child.id, depth + 1);
    }
  };

  visit(null, 0);
  return result;
}

async function getBookLessonManifest(bookId: string) {
  const units = await prisma.unit.findMany({
    where: { BookId: bookId },
    orderBy: { id: "asc" },
    select: {
      id: true,
      lessons: {
        select: {
          id: true,
          unitId: true,
          ParentLessonId: true,
          index: true
        }
      }
    }
  });

  return units.flatMap((unit) => flattenLessonTree(unit.lessons));
}

export async function getBookContentPage(
  bookId: string,
  userId: string,
  cursor?: number | null,
  limit = 1
): Promise<BookContentPage | null> {
  const safeLimit = Math.max(1, Math.min(limit, 3));

  const book = await prisma.book.findUnique({
    where: { id: bookId },
    select: {
      id: true,
      subject: true,
      grade: true,
      imgUrl: true,
      _count: {
        select: {
          units: true
        }
      }
    }
  });

  if (!book) {
    return null;
  }

  const manifest = await getBookLessonManifest(bookId);
  const startIndex = typeof cursor === "number" && Number.isFinite(cursor) ? cursor : 0;
  const visibleManifest = manifest.slice(startIndex, startIndex + safeLimit);
  const nextIndex = startIndex + visibleManifest.length;
  const hasMore = nextIndex < manifest.length;

  const lessonRecords = visibleManifest.length
    ? await prisma.lesson.findMany({
        where: {
          id: { in: visibleManifest.map((item) => item.id) }
        },
        include: lessonContentInclude(userId)
      })
    : [];

  const lessonMap = new Map(lessonRecords.map((lesson) => [lesson.id, lesson]));
  const lessons = visibleManifest
    .map((item) => {
      const lesson = lessonMap.get(item.id);
      if (!lesson) return null;

      return {
        ...lesson,
        depth: item.depth
      } satisfies BookContentLesson;
    })
    .filter((lesson): lesson is BookContentLesson => Boolean(lesson));

  const hydratedLessons = await ensureLessonParagraphDefaults(lessons, userId);

  await incrementLoadedLessonViews(hydratedLessons);

  return {
    book: {
      id: book.id,
      subject: book.subject,
      grade: book.grade,
      imgUrl: book.imgUrl,
      totalUnits: book._count.units,
      totalLessons: manifest.length
    },
    lessons: hydratedLessons,
    nextCursor: hasMore ? nextIndex : null,
    hasMore
  };
}

export async function getFullBookContent(bookId: string, userId: string): Promise<FullBookContent | null> {
  const book = await prisma.book.findUnique({
    where: { id: bookId },
    include: {
      units: {
        include: bookContentInclude(userId)
      }
    }
  });

  if (!book) return null;

  book.units = (await ensureRealParagraphDefaults(book.units as BookContentUnit[], userId)) as any;

  await incrementLoadedContentViews(book.units as BookContentUnit[]);

  return book;
}
