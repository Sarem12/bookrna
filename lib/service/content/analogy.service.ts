"use server"
import { ChangeToBestAnalogy, GetBestAnalogy } from "@/lib/analyzer";
import { generateContent } from "@/lib/gemini";
import { 
 stringifiedContent

} from "@/lib/types";
import { Prisma, PrismaClient ,RealParagraph} from "@prisma/client";
import {prisma} from "@/lib/prisma";

// import { 
//     user, lesson, realParagraph,
//     analogy as analogyd, analogyOut,
//     analogyDefault, analogyDefaultOut,
//     userAnalogy, userAnalogyOut,
//     tag, tagRelatorAnalogy, tagRelatorAnalogyOut
// } from "@/datarelated/data";

import { stringifyLesson, stringifyDefaultParagraph } from "@/lib/stringifiers";

function isUniqueConstraintError(error: unknown) {
    return (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
    );
}

/**
 * GET ANALOGY
 */
export async function GetAnalogy(UserId: string, contentId: string, type: 'lesson' | 'paragraph') {
    // 1. Check for existing record
    const analogyRecord = await GetBestAnalogy(UserId, type, contentId);

    if (analogyRecord) {
        const existingUserAction = await prisma.userAnalogy.findFirst({
            where: { UserId, AnalogyId: analogyRecord.id }
        });

        if (existingUserAction) {
            await prisma.userAnalogy.update({
                where: { id: existingUserAction.id },
                data: { onuse: true }
            });
        } else {
            await prisma.userAnalogy.create({
                data: {
                    UserId,
                    AnalogyId: analogyRecord.id,
                    status: 'neutral',
                    onuse: true
                }
            });
        }

        await prisma.analogy.update({
            where: { id: analogyRecord.id },
            data: { views: { increment: 1 }, usage: { increment: 1 } }
        });

        const fullAnalogy = await prisma.analogy.findUnique({
            where: { id: analogyRecord.id },
            include: { userActions: { where: { UserId } } }
        });
        if (!fullAnalogy) return { error: "Analogy not found" };
        return fullAnalogy;
    }

    // 2. Fetch User and Content
    const CurrentUser = await prisma.user.findUnique({ where: { id: UserId } });
    if (!CurrentUser) return { error: "User not found" };

    let stringified: stringifiedContent;
    const isLesson = type === 'lesson';

    if (isLesson) {
        const CurrentLesson = await prisma.lesson.findUnique({ 
            where: { id: contentId },
            include: { realParagraphs: true, SubLessons: true } // Kill Error 2345
        });
        if (!CurrentLesson) return { error: "Lesson not found" };
        stringified = await stringifyLesson(CurrentLesson);
    } else {
        const CurrentParagraph = await prisma.realParagraph.findUnique({ where: { id: contentId } });
        if (!CurrentParagraph) return { error: "Paragraph not found" };
        stringified = stringifyDefaultParagraph(CurrentParagraph as RealParagraph);
    }

    // 3. Generate AI Content
    const response = await generateContent({
        requestType: 'analogy',
        user: CurrentUser,
        target: stringified
    });

    if (response.error) throw new Error(response.error);

    // 4. CHECK FOR EXISTING SLOT (The "Rule")
    const existingSlot = await prisma.defaultAnalogy.findFirst({
        where: {
            UserId: UserId,
            [isLesson ? "lessonId" : "RealParagraphId"]: contentId
        }
    });

    // 5. Create the Analogy and link it correctly
    const finalAnalogy = await prisma.analogy.create({
        data: {
            content: response.content,
            logic: response.logic,
            [isLesson ? "lessonId" : "RealParagraphId"]: contentId,
            views: 1,
            usage: 1,
            
            // Link to existing pool if it exists
            ...(existingSlot ? { defaultAnalogyId: existingSlot.id } : {}),

            userActions: {
                create: {
                    UserId: UserId,
                    status: 'neutral',
                    onuse: true
                }
            }
        }
    });

    // 6. Handle the Slot (Create new or Update active)
    if (existingSlot) {
        await prisma.defaultAnalogy.update({
            where: { id: existingSlot.id },
            data: { AnalogyId: finalAnalogy.id, onuse: true } // Set new one as active
        });
    } else {
        await prisma.defaultAnalogy.create({
            data: {
                UserId: UserId,
                AnalogyId: finalAnalogy.id, // Mandatory 1:1 link
                [isLesson ? "lessonId" : "RealParagraphId"]: contentId,
                order: 0,
                onuse: true,
                // Add this first one to its own pool
                alternatives: { connect: { id: finalAnalogy.id } }
            }
        });
    }

    const savedAnalogy = await prisma.analogy.findUnique({
        where: { id: finalAnalogy.id },
        include: { userActions: { where: { UserId } } }
    });
    if (!savedAnalogy) return { error: "Analogy not found" };
    return savedAnalogy;
}

/**
 * CHANGE ANALOGY
 */
export async function ChangeAnalogy(DefaultAnalogyId: string, userId: string) {
    try {
    const def = await prisma.defaultAnalogy.findUnique({ where: { id: DefaultAnalogyId } });
    if (!def) return { error: "Default Analogy not found" };

    // 1. Mark current as skipped
    await prisma.userAnalogy.updateMany({
        where: { UserId: userId, AnalogyId: def.AnalogyId },
        data: { skiped: true, onuse: false }
    });

    // 2. Try DB alternative
    const best = await ChangeToBestAnalogy(DefaultAnalogyId, userId);
    if (best) {
        // ADDED AWAIT HERE - Crucial for the database to actually save
        await prisma.analogy.update({
            where: { id: best.id },
            data: { views: { increment: 1 }, usage: { increment: 1 } }
        });
        let switchedToBest = true;
        try {
            await prisma.defaultAnalogy.update({
                where: { id: DefaultAnalogyId },
                data: { AnalogyId: best.id, onuse: true }
            });
        } catch (error) {
            if (!isUniqueConstraintError(error)) {
                throw error;
            }
            switchedToBest = false;
        }

        if (switchedToBest) {
            const existingUserAction = await prisma.userAnalogy.findFirst({
                where: { UserId: userId, AnalogyId: best.id }
            });

            if (existingUserAction) {
                await prisma.userAnalogy.update({
                    where: { id: existingUserAction.id },
                    data: { onuse: true }
                });
            } else {
                await prisma.userAnalogy.create({
                    data: {
                        UserId: userId,
                        AnalogyId: best.id,
                        status: 'neutral',
                        onuse: true
                    }
                });
            }

            const savedBest = await prisma.analogy.findUnique({
                where: { id: best.id },
                include: { userActions: { where: { UserId: userId } } }
            });
            if (!savedBest) return { error: "Analogy not found" };
            return savedBest;
        }
    }

    // 3. 🔥 NO reuse → generate directly
    const CurrentUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!CurrentUser) return { error: "User not found" };

    const type = def.lessonId ? 'lesson' : 'paragraph';
    const contentId = (def.lessonId || def.RealParagraphId) as string;

    let stringified: any; // Use your stringifiedContent type
    const contentIdKey = def.lessonId ? "lessonId" : "RealParagraphId";

    if (type === 'lesson') {
        const CurrentLesson = await prisma.lesson.findUnique({ 
            where: { id: contentId },
            include: { realParagraphs: true, SubLessons: true } // Fixes potential Error 2345
        });
        if (!CurrentLesson) return { error: "Lesson not found" };
        stringified = await stringifyLesson(CurrentLesson);
    } else {
        const CurrentParagraph = await prisma.realParagraph.findUnique({ where: { id: contentId } });
        if (!CurrentParagraph) return { error: "Paragraph not found" };
        stringified = await stringifyDefaultParagraph(CurrentParagraph);
    }

    const response = await generateContent({
        requestType: 'analogy',
        user: CurrentUser,
        target: stringified
    });

    if (response.error) return response;

    // 4. Create in DB and Link to Slot
    // We let Prisma generate the ID automatically
    const createdAnalogy = await prisma.analogy.create({
        data: {
            content: response.content,
            logic: response.logic,
            [contentIdKey]: contentId,
            views: 1,
            usage: 1,
            defaultAnalogyId: DefaultAnalogyId, // Link to the Pool
            userActions: {
                create: {
                    UserId: userId,
                    status: 'neutral',
                    onuse: true
                }
            }
        }
    });

    // 5. Update the Slot to point to the new ID
    await prisma.defaultAnalogy.update({
        where: { id: DefaultAnalogyId },
        data: { AnalogyId: createdAnalogy.id, onuse: true }
    });

    const savedCreated = await prisma.analogy.findUnique({
        where: { id: createdAnalogy.id },
        include: { userActions: { where: { UserId: userId } } }
    });
    if (!savedCreated) return { error: "Analogy not found" };
    return savedCreated;
    } catch (error) {
        console.error("ChangeAnalogy failed", error);
        return { error: "Unable to regenerate analogy right now." };
    }
}

/**
 * LIKE EVENT
 */
export async function LikeEventAnalogy(UserId: string, AnalogyId: string) {
    // 1. Find the current status
    const currentAction = await prisma.userAnalogy.findFirst({
        where: { UserId, AnalogyId }
    });

    if (!currentAction) return { error: "UserAnalogy not found" };

    const wasDisliked = currentAction.status === 'disliked';
    const isCurrentlyLiked = currentAction.status === 'liked';
    
    // Determine new status and the math change
    const newStatus = isCurrentlyLiked ? 'neutral' : 'liked';
    const likeChange = isCurrentlyLiked ? -1 : 1;
    const dislikeChange = (wasDisliked && !isCurrentlyLiked) ? -1 : 0;

    // 2. Run everything in a Transaction (Safe & Atomic)
    await prisma.$transaction([
        // Update the User's personal status
        prisma.userAnalogy.update({
            where: { id: currentAction.id },
            data: { status: newStatus }
        }),

        // Update the Global Analogy Stats
        prisma.analogy.update({
            where: { id: AnalogyId },
            data: { 
                likes: { increment: likeChange },
                dislikes: { increment: dislikeChange }
            }
        }),

        // Update Tag Stats (This handles all tags linked to this analogy)
        prisma.tagRelatorAnalogy.updateMany({
            where: { AnalogyId },
            data: { 
                likes: { increment: likeChange },
                // Note: Ensure your schema has the 'dislikes' field on TagRelatorAnalogy
                // If not, you can remove this line
                dislikes: { increment: dislikeChange } 
            }
        })
    ]);

    return { success: true, newStatus };
}

/**
 * DISLIKE EVENT
 */
export async function DislikeEventAnalogy(UserId: string, AnalogyId: string) {
    const currentAction = await prisma.userAnalogy.findFirst({
        where: { UserId, AnalogyId }
    });

    if (!currentAction) return { error: "UserAnalogy not found" };

    const wasLiked = currentAction.status === 'liked';
    const isCurrentlyDisliked = currentAction.status === 'disliked';
    
    const newStatus = isCurrentlyDisliked ? 'neutral' : 'disliked';
    const dislikeChange = isCurrentlyDisliked ? -1 : 1;
    const likeChange = (wasLiked && !isCurrentlyDisliked) ? -1 : 0;

    await prisma.$transaction([
        prisma.userAnalogy.update({
            where: { id: currentAction.id },
            data: { status: newStatus }
        }),
        prisma.analogy.update({
            where: { id: AnalogyId },
            data: { 
                dislikes: { increment: dislikeChange },
                likes: { increment: likeChange }
            }
        }),
        prisma.tagRelatorAnalogy.updateMany({
            where: { AnalogyId },
            data: { 
                dislikes: { increment: dislikeChange },
                likes: { increment: likeChange }
            }
        })
    ]);

    return { success: true, newStatus };
}

export async function FlagEventAnalogy(UserId: string, AnalogyId: string) {
    const currentAction = await prisma.userAnalogy.findFirst({
        where: { UserId, AnalogyId }
    });

    if (!currentAction) return { error: "UserAnalogy not found" };

    // Toggle the boolean
    const newFlagStatus = !currentAction.flaged;
    const change = newFlagStatus ? 1 : -1;

    await prisma.$transaction([
        prisma.userAnalogy.update({
            where: { id: currentAction.id },
            data: { flaged: newFlagStatus }
        }),
        prisma.analogy.update({
            where: { id: AnalogyId },
            data: { flags: { increment: change } }
        }),
        prisma.tagRelatorAnalogy.updateMany({
            where: { AnalogyId },
            data: { flags: { increment: change } }
        })
    ]);

    return { success: true, flagged: newFlagStatus };
}

export async function RemoveAnalogy(UserId: string, AnalogyId: string) {
    const currentAction = await prisma.userAnalogy.findFirst({
        where: { UserId, AnalogyId }
    });

    if (!currentAction) return { error: "UserAnalogy not found" };

    await prisma.userAnalogy.update({
        where: { id: currentAction.id },
        data: { onuse: false }
    });

    return { success: true };
}
