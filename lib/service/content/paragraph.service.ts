"use server"
import { PrismaClient } from "@prisma/client";
import { generateContent } from "@/lib/gemini";
import { stringifyDefaultParagraph } from "@/lib/stringifiers";
import { GetBestParagraph, ChangeToBestParagraph } from "@/lib/analyzer";

import {prisma} from "@/lib/prisma";
export async function GetParagraph(UserId: string, RealParagraphId: string) {
    // 1. Check if the user already has a preferred version in the DB
    const paragraphRecord = await GetBestParagraph(RealParagraphId, UserId);

    if (paragraphRecord) {
        const existingUserAction = await prisma.userParagraph.findFirst({
            where: { UserId, ParagraphId: paragraphRecord.id }
        });

        if (existingUserAction) {
            await prisma.userParagraph.update({
                where: { id: existingUserAction.id },
                data: { onuse: true, skiped: false }
            });
        } else {
            await prisma.userParagraph.create({
                data: {
                    UserId,
                    ParagraphId: paragraphRecord.id,
                    status: "neutral",
                    onuse: true,
                    skiped: false
                }
            });
        }

        await prisma.paragraph.update({
            where: { id: paragraphRecord.id },
            data: { views: { increment: 1 } }
        });
        return { content: paragraphRecord.content, id: paragraphRecord.id };
    }

    // 2. Fetch User and the static Source Text
    const CurrentUser = await prisma.user.findUnique({ where: { id: UserId } });
    if (!CurrentUser) return { error: "User not found" };

    const source = await prisma.realParagraph.findUnique({ 
        where: { id: RealParagraphId } 
    });
    if (!source) return { error: "RealParagraph source not found" };

    // 3. Generate AI content based on the RealParagraph text
    const response = await generateContent({
        requestType: 'paragraph',
        user: CurrentUser,
        target: stringifyDefaultParagraph(source)
    });

    if (response.error) throw new Error(response.error);

    // 4. Create the new AI Paragraph and link it to the RealParagraph
    const paragraphText = (typeof response.content === "string" && response.content.trim())
        ? response.content
        : (typeof (response as any).personalized === "string" && (response as any).personalized.trim())
            ? (response as any).personalized
            : "";

    if (!paragraphText) return { error: "Paragraph generation failed" };

    const result = await prisma.$transaction(async (tx) => {
        // Find or create the Slot (DefaultParagraph)
        let slot = await tx.defaultParagraph.findFirst({
            where: { UserId, RealParagraphId }
        });

        if (!slot) {
            slot = await tx.defaultParagraph.create({
                data: {
                    UserId,
                    RealParagraphId,
                    LessonId: source.LessonId,
                    order: 0
                }
            });
        }

        // Create paragraph using the valid slot id (required by FK)
        const newParagraph = await tx.paragraph.create({
            data: {
                content: paragraphText,
                LessonId: source.LessonId,
                MasterParagraphId: RealParagraphId,
                defaultParagraphId: slot.id,
                views: 1,
                usage: 1
            }
        });

        await tx.defaultParagraph.update({
            where: { id: slot.id },
            data: { ParagraphId: newParagraph.id }
        });

        return { ...response, id: newParagraph.id, __slotId: slot.id, __newParagraphId: newParagraph.id };
    });

    // Do tags and userParagraph after tx so we avoid transaction timeout in long loops
    const tags = (response.tagsUsed as string[] || []).filter(Boolean);
    for (const tagName of tags) {
        const tagRecord = await prisma.tag.upsert({
            where: { name: tagName },
            update: {},
            create: { name: tagName }
        });

        await prisma.tagRelatorParagraph.create({
            data: {
                TagId: tagRecord.id,
                ParagraphId: result.__newParagraphId
            }
        });
    }

    await prisma.userParagraph.create({
        data: {
            UserId,
            ParagraphId: result.__newParagraphId,
            onuse: true,
            status: "neutral",
            skiped: false
        }
    });

    return { ...response, content: paragraphText, id: result.__newParagraphId };
}

/**
 * CHANGE PARAGRAPH (Triggered when user clicks "Change" or "Re-generate")
 */
export async function ChangeParagraph(DefaultParagraphId: string, userId: string) {
    const slot = await prisma.defaultParagraph.findUnique({ where: { id: DefaultParagraphId } });
    if (!slot) return { error: "Slot not found" };

    // 1. Mark current version as skipped for this user
    if (slot.ParagraphId) {
        await prisma.userParagraph.updateMany({
            where: { UserId: userId, ParagraphId: slot.ParagraphId },
            data: { skiped: true, onuse: false }
        });
    }

    // 2. Try to find another high-scoring Paragraph linked to this RealParagraph
    const best = await ChangeToBestParagraph(DefaultParagraphId, userId);
    
    if (best) {
        await prisma.paragraph.update({
            where: { id: best.id },
            data: { views: { increment: 1 } }
        });
        await prisma.defaultParagraph.update({
            where: { id: DefaultParagraphId },
            data: { ParagraphId: best.id }
        });

        const existingUserAction = await prisma.userParagraph.findFirst({
            where: { UserId: userId, ParagraphId: best.id }
        });

        if (existingUserAction) {
            await prisma.userParagraph.update({
                where: { id: existingUserAction.id },
                data: { onuse: true, skiped: false }
            });
        } else {
            await prisma.userParagraph.create({
                data: {
                    UserId: userId,
                    ParagraphId: best.id,
                    status: "neutral",
                    onuse: true,
                    skiped: false
                }
            });
        }

        return best;
    }

    // 3. If no good alternatives exist, generate a brand new one
    const source = await prisma.realParagraph.findUnique({ where: { id: slot.RealParagraphId } });
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!source || !user) return { error: "Source or User context missing" };

    const response = await generateContent({
        requestType: 'paragraph',
        user: user,
        target: stringifyDefaultParagraph(source)
    });

    if (response.error) return response;

    const paragraphText = (typeof response.content === "string" && response.content.trim())
      ? response.content
      : (typeof (response as any).personalized === "string" && (response as any).personalized.trim())
        ? (response as any).personalized
        : "";

    if (!paragraphText) return { error: "Paragraph generation failed" };

    const created = await prisma.paragraph.create({
        data: {
            content: paragraphText,
            LessonId: slot.LessonId,
            MasterParagraphId: slot.RealParagraphId,
            defaultParagraphId: DefaultParagraphId, // Links to the pool
            userActions: { create: { UserId: userId, onuse: true } }
        }
    });

    await prisma.defaultParagraph.update({
        where: { id: DefaultParagraphId },
        data: { ParagraphId: created.id }
    });

    return { ...response, content: paragraphText, id: created.id };
}


export async function LikeEventParagraph(UserId: string, ParagraphId: string) {
    return await prisma.$transaction(async (tx) => {
        // 1. Get the user's specific record for this AI paragraph
        const userAction = await tx.userParagraph.findFirst({
            where: { UserId, ParagraphId }
        });

        if (!userAction) {
            // If it doesn't exist, create it so we can track the like
            await tx.userParagraph.create({
                data: { UserId, ParagraphId, status: 'liked', onuse: true }
            });

            await tx.paragraph.update({
                where: { id: ParagraphId },
                data: { likes: { increment: 1 } }
            });

            await tx.tagRelatorParagraph.updateMany({
                where: { ParagraphId },
                data: { likes: { increment: 1 } }
            });

            return { success: true, newStatus: "liked" };
        }

        const isCurrentlyLiked = userAction.status === 'liked';
        const wasDisliked = userAction.status === 'disliked';
        
        // Toggle: If already liked, go to neutral. Otherwise, go to liked.
        const newStatus = isCurrentlyLiked ? 'neutral' : 'liked';
        const change = isCurrentlyLiked ? -1 : 1;

        // 2. Update User Action status
        await tx.userParagraph.update({
            where: { id: userAction.id },
            data: { status: newStatus }
        });

        // 3. Update Global Paragraph Stats
        await tx.paragraph.update({
            where: { id: ParagraphId },
            data: { 
                likes: { increment: change },
                // If we are moving from Disliked -> Liked, remove the dislike
                dislikes: (wasDisliked && !isCurrentlyLiked) ? { decrement: 1 } : undefined
            }
        });

        // 4. Update Tag Relators (So the "Scoring Brain" learns what tags are popular)
        await tx.tagRelatorParagraph.updateMany({
            where: { ParagraphId },
            data: { 
                likes: { increment: change },
                dislikes: (wasDisliked && !isCurrentlyLiked) ? { decrement: 1 } : undefined
            }
        });

        return { success: true, newStatus };
    });
}

/**
 * DISLIKE EVENT FOR PARAGRAPH
 */
export async function DislikeEventParagraph(UserId: string, ParagraphId: string) {
    return await prisma.$transaction(async (tx) => {
        let userAction = await tx.userParagraph.findFirst({
            where: { UserId, ParagraphId }
        });

        if (!userAction) {
            await tx.userParagraph.create({
                data: {
                    UserId,
                    ParagraphId,
                    status: "disliked",
                    onuse: true
                }
            });

            await tx.paragraph.update({
                where: { id: ParagraphId },
                data: { dislikes: { increment: 1 } }
            });

            await tx.tagRelatorParagraph.updateMany({
                where: { ParagraphId },
                data: { dislikes: { increment: 1 } }
            });

            return { success: true, newStatus: "disliked" };
        }

        const isCurrentlyDisliked = userAction.status === 'disliked';
        const wasLiked = userAction.status === 'liked';
        
        const newStatus = isCurrentlyDisliked ? 'neutral' : 'disliked';
        const change = isCurrentlyDisliked ? -1 : 1;

        await tx.userParagraph.update({
            where: { id: userAction.id },
            data: { status: newStatus }
        });

        await tx.paragraph.update({
            where: { id: ParagraphId },
            data: { 
                dislikes: { increment: change },
                likes: (wasLiked && !isCurrentlyDisliked) ? { decrement: 1 } : undefined
            }
        });

        await tx.tagRelatorParagraph.updateMany({
            where: { ParagraphId },
            data: { 
                dislikes: { increment: change },
                likes: (wasLiked && !isCurrentlyDisliked) ? { decrement: 1 } : undefined
            }
        });

        return { success: true, newStatus };
    });
}

/**
 * FLAG EVENT FOR PARAGRAPH
 */
export async function FlagEventParagraph(UserId: string, ParagraphId: string) {
    return await prisma.$transaction(async (tx) => {
        let userAction = await tx.userParagraph.findFirst({
            where: { UserId, ParagraphId }
        });

        if (!userAction) {
            await tx.userParagraph.create({
                data: {
                    UserId,
                    ParagraphId,
                    status: "neutral",
                    onuse: true,
                    flaged: true
                }
            });

            await tx.paragraph.update({
                where: { id: ParagraphId },
                data: { flags: { increment: 1 } }
            });

            await tx.tagRelatorParagraph.updateMany({
                where: { ParagraphId },
                data: { flags: { increment: 1 } }
            });

            return { success: true, flagged: true };
        }

        const newFlagState = !userAction.flaged;
        const change = newFlagState ? 1 : -1;

        await tx.userParagraph.update({
            where: { id: userAction.id },
            data: { flaged: newFlagState }
        });

        // Update Global Stats
        await tx.paragraph.update({
            where: { id: ParagraphId },
            data: { flags: { increment: change } }
        });

        // Update Tag Relators
        await tx.tagRelatorParagraph.updateMany({
            where: { ParagraphId },
            data: { flags: { increment: change } }
        });

        return { success: true, flagged: newFlagState };
    });
}
