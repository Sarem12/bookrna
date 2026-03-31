import { PrismaClient } from "@prisma/client";
import { prisma } from "./prisma";

// ==========================================
// 0. THE SCORING BRAIN (Uses Relators)
// ==========================================

function calculateScore(
    item: any, 
    relatorKey: string,
    userProfile: any[], 
    rejectedTagIds: string[] = []
): { score: number, tagCount: number } {
    let score = 0;
    const now = new Date().getTime();
    const relators = item[relatorKey] || [];
    const tagCount = Math.max(relators.length, 2);

    // 1. Freshness Boost
    const age = now - new Date(item.createdAt).getTime();
    if (age < (2 * 60 * 60 * 1000)) score += 20;

    for (const rel of relators) {
        if (rel.views > 0) {
            // 2. Global Quality Score (UPDATED)
            // Usage rate + (Likes - Dislikes weight)
            const usageRate = rel.usage / rel.views;
            const sentimentBalance = (rel.likes - (rel.dislikes * 1.5)) / rel.views;
            
            score += (2 * (usageRate + sentimentBalance));

            // 3. Flag Penalty (New)
            if (rel.flags > 5) score -= 50; 

            // 4. Personalization Logic
            const ut = userProfile.find(u => u.TagId === rel.TagId);
            if (ut) {
                let val = ut.likingLevel * 2; 
                if (rejectedTagIds.includes(rel.TagId)) val *= 0.1; 
                score += val;
            }
        }
    }
    return { score, tagCount };
}

function pickWinner<T>(scoredItems: { item: T, score: number, tagCount: number }[]): T | null {
    const validItems = scoredItems.filter(x => (x.score / x.tagCount) >= 0.8);
    if (validItems.length === 0) return null;
    validItems.sort((a, b) => b.score - a.score);
    return validItems[Math.floor(Math.random() * Math.min(validItems.length, 2))].item;
}

// ==========================================
// 1. ANALOGY
// ==========================================

export async function GetBestAnalogy(targetId: string, type: 'paragraph' | 'lesson', userId: string) {
    const userTags = await prisma.userTag.findMany({ where: { UserId: userId } });
    const candidates = await prisma.analogy.findMany({
        where: {
            ...(type === 'paragraph' ? { RealParagraphId: targetId } : { lessonId: targetId }),
            userActions: { none: { UserId: userId, skiped: true } }
        },
        include: { tagsAnalogy: true }
    });
    return pickWinner(candidates.map(item => ({ item, ...calculateScore(item, 'tagsAnalogy', userTags) })));
}

export async function ChangeToBestAnalogy(defaultId: string, userId: string) {
    const slot = await prisma.defaultAnalogy.findUnique({ 
        where: { id: defaultId },
        include: { activeInDefault: { include: { tagsAnalogy: true } } } 
    });
    if (!slot) return null;
    const rejTags = (slot.activeInDefault as any)?.tagsAnalogy.map((t: any) => t.TagId) || [];
    const userTags = await prisma.userTag.findMany({ where: { UserId: userId } });
    const candidates = await prisma.analogy.findMany({
        where: {
            OR: [{ RealParagraphId: slot.RealParagraphId }, { lessonId: slot.lessonId }],
            id: { not: slot.AnalogyId },
            userActions: { none: { UserId: userId, skiped: true } },
            activeInSlots: {
                is: null
            }
        },
        include: { tagsAnalogy: true }
    });
    return pickWinner(
        candidates.map(item => ({
            item,
            ...calculateScore(item, 'tagsAnalogy', userTags, rejTags)
        }))
    );
}

// ==========================================
// 2. PARAGRAPH
// ==========================================

export async function GetBestParagraph(realId: string, userId: string) {
    const userTags = await prisma.userTag.findMany({ where: { UserId: userId } });
    const candidates = await prisma.paragraph.findMany({
        where: { MasterParagraphId: realId, userActions: { none: { UserId: userId, skiped: true } } },
        include: { tagsParagraph: true }
    });
    return pickWinner(candidates.map(item => ({ item, ...calculateScore(item, 'tagsParagraph', userTags) })));
}

export async function ChangeToBestParagraph(defaultId: string, userId: string) {
    const slot = await prisma.defaultParagraph.findUnique({ 
        where: { id: defaultId },
        include: { activeInDefault: { include: { tagsParagraph: true } } }
    });
    if (!slot) return null;
    const rejTags = (slot.activeInDefault as any)?.tagsParagraph.map((t: any) => t.TagId) || [];
    const userTags = await prisma.userTag.findMany({ where: { UserId: userId } });
    const paragraphIdFilter = slot.ParagraphId ? { not: slot.ParagraphId } : undefined;

    const candidates = await prisma.paragraph.findMany({
        where: {
            MasterParagraphId: slot.RealParagraphId,
            id: paragraphIdFilter,
            userActions: { none: { UserId: userId, skiped: true } }
        },
        include: { tagsParagraph: true }
    });
    const winner = pickWinner(candidates.map(item => ({ item, ...calculateScore(item, 'tagsParagraph', userTags, rejTags) })));
    if (winner) await prisma.defaultParagraph.update({ where: { id: defaultId }, data: { ParagraphId: (winner as any).id } });
    return winner;
}

// ==========================================
// 3. SUMMERY
// ==========================================

export async function GetBestSummery(targetId: string, type: 'lesson' | 'unit', userId: string) {
    const userTags = await prisma.userTag.findMany({ where: { UserId: userId } });
    const candidates = await prisma.summery.findMany({
        where: { ...(type === 'lesson' ? { LessonId: targetId } : { UnitId: targetId }), userActions: { none: { UserId: userId, skiped: true } } },
        include: { tagsSummery: true }
    });
    return pickWinner(candidates.map(item => ({ item, ...calculateScore(item, 'tagsSummery', userTags) })));
}

export async function ChangeToBestSummery(defaultId: string, userId: string) {
    const slot = await prisma.defaultSummery.findUnique({ 
        where: { id: defaultId },
        include: { activeInDefault: { include: { tagsSummery: true } } }
    });
    if (!slot) return null;
    const rejTags = (slot.activeInDefault as any)?.tagsSummery.map((t: any) => t.TagId) || [];
    const userTags = await prisma.userTag.findMany({ where: { UserId: userId } });
    const candidates = await prisma.summery.findMany({
        where: { OR: [{ LessonId: slot.LessonId }, { UnitId: slot.UnitId }], id: { not: slot.SummeryId }, userActions: { none: { UserId: userId, skiped: true } } },
        include: { tagsSummery: true }
    });
    const winner = pickWinner(candidates.map(item => ({ item, ...calculateScore(item, 'tagsSummery', userTags, rejTags) })));
    if (winner) await prisma.defaultSummery.update({ where: { id: defaultId }, data: { SummeryId: (winner as any).id } });
    return winner;
}

// ==========================================
// 4. KEYWORDS
// ==========================================

export async function GetBestKeyWord(targetId: string, type: 'lesson' | 'paragraph', userId: string) {
    const userTags = await prisma.userTag.findMany({ where: { UserId: userId } });
    const candidates = await prisma.keyWords.findMany({
        where: { ...(type === 'lesson' ? { lessonId: targetId } : { RealParagraphId: targetId }), userActions: { none: { UserId: userId, skiped: true } } },
        include: { tagsKeyWords: true }
    });
    return pickWinner(candidates.map(item => ({ item, ...calculateScore(item, 'tagsKeyWords', userTags) })));
}

export async function ChangeToBestKeyWord(defaultId: string, userId: string) {
    const slot = await prisma.keyWordDefault.findUnique({ 
        where: { id: defaultId },
        include: { activeInDefault: { include: { tagsKeyWords: true } } }
    });
    if (!slot) return null;
    const rejTags = (slot.activeInDefault as any)?.tagsKeyWords.map((t: any) => t.TagId) || [];
    const userTags = await prisma.userTag.findMany({ where: { UserId: userId } });
    const candidates = await prisma.keyWords.findMany({
        where: { OR: [{ lessonId: slot.lessonId }, { RealParagraphId: slot.RealParagraphId }], id: { not: slot.KeyWordsId }, userActions: { none: { UserId: userId, skiped: true } } },
        include: { tagsKeyWords: true }
    });
    const winner = pickWinner(candidates.map(item => ({ item, ...calculateScore(item, 'tagsKeyWords', userTags, rejTags) })));
    if (winner) await prisma.keyWordDefault.update({ where: { id: defaultId }, data: { KeyWordsId: (winner as any).id } });
    return winner;
}

// ==========================================
// 5. NOTE
// ==========================================

export async function GetBestNote(lessonId: string, userId: string) {
    const userTags = await prisma.userTag.findMany({ where: { UserId: userId } });
    const candidates = await prisma.note.findMany({
        where: { LessonId: lessonId, userActions: { none: { UserId: userId, skiped: true } } },
        include: { tagsNote: true }
    });
    return pickWinner(candidates.map(item => ({ item, ...calculateScore(item, 'tagsNote', userTags) })));
}

export async function ChangeToBestNote(defaultId: string, userId: string) {
    const slot = await prisma.noteDefault.findUnique({ 
        where: { id: defaultId },
        include: { activeInDefault: { include: { tagsNote: true } } }
    });
    if (!slot) return null;
    const rejTags = (slot.activeInDefault as any)?.tagsNote.map((t: any) => t.TagId) || [];
    const userTags = await prisma.userTag.findMany({ where: { UserId: userId } });
    const candidates = await prisma.note.findMany({
        where: { LessonId: slot.LessonId, id: { not: slot.NoteId }, userActions: { none: { UserId: userId, skiped: true } } },
        include: { tagsNote: true }
    });
    const winner = pickWinner(candidates.map(item => ({ item, ...calculateScore(item, 'tagsNote', userTags, rejTags) })));
    if (winner) await prisma.noteDefault.update({ where: { id: defaultId }, data: { NoteId: (winner as any).id } });
    return winner;
}
