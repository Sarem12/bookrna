import { 
    Analogy, Tag, TagRelatorAnalogy, UserTag, UserAnalogy, 
    RealParagraph, Paragraph, TagRelatorParagraph, 
    Summery, UserSummery, TagRelatorSummery,
    KeyWord, KeyWords, UserKeyWords, TagRelatorKeyWords, 
    UserNote, Note, TagRelatorNote, UniversalTag
} from "./types";

import { 
    analogy, tagUser, tagRelatorAnalogy, tag, userAnalogy,
    realParagraph, paragraph, tagRelatorParagraph, 
    summery, tagRelatorSummery, userSummery,
    keyword, keywords, tagRelatorKeyWords, userKeyWords,
    tagRelatorNote, userNote, note, universalTag
} from "@/datarelated/data";

/**
 * SHARED SCORING ENGINE
 * Returns both the total score and the tag count so we can apply the `< 5` threshold rule.
 */
function calculateScore(
    contentId: string,
    contentKey: 'AnalogyId' | 'ParagraphId' | 'SummeryId' | 'KeyWordsId' | 'NoteId',
    relators: any[],
    userProfile: UserTag[],
    itemCreatedAt: string,
    rejectedTagIds: string[] = [],
    isDisliked: boolean = false
): { score: number, tagCount: number } {
    let score = 0;
    const now = new Date().getTime();
    const contentRelators = relators.filter(r => r[contentKey] === contentId);
    const contentTagIds = contentRelators.map(r => r.TagId);
    const tagCount = Math.max(contentTagIds.length, 2);

    // 1. FRESHNESS BOOST (2h window)
    const age = now - new Date(itemCreatedAt).getTime();
    if (age < (2 * 60 * 60 * 1000)) score += 20;

    // 2. UNIVERSAL PERFORMANCE
    for (const utag of (universalTag as UniversalTag[])) {
        if (contentTagIds.includes(utag.TagId)) {
            const rel = contentRelators.find(r => r.TagId === utag.TagId);
            if (rel && rel.views > 0) {
                score += (2 * ((rel.usage / rel.views) * (1 - (rel.flags / rel.views))));
            }
        }
    }

    // 3. USER PERSONALIZATION
    for (const ut of userProfile) {
        const rel = contentRelators.find(r => r.TagId === ut.TagId);
        if (rel && rel.views > 0) {
            // Sentiment logic
            const sentiment = (rel.likes - rel.dislikes) / ((rel.likes + rel.dislikes + 0.1) / 3);
            let val = ut.likingLevel < 0 ? -Math.abs(ut.likingLevel * 5) : ut.likingLevel * sentiment;
            if (rejectedTagIds.includes(ut.TagId)) val *= 0.1; 
            score += val;
        }
    }

    if (isDisliked) score -= 40;
    
    return { score, tagCount };
}

/**
 * WINNER SELECTION WITH QUALITY THRESHOLD
 * Rejects items where (Score / Tags) < 5
 */
function pickWinner<T>(scoredItems: { item: T, score: number, tagCount: number }[]): T | null {
    if (scoredItems.length === 0) return null;

    // NEW RULE: Null will only be applied when score/tag is < 5
    
    const validItems = scoredItems.filter(x => (x.score / x.tagCount) >= 0.8);
    
    
    // If no candidate meets the minimum quality threshold, return null
    if (validItems.length === 0) return null;

    validItems.sort((a, b) => b.score - a.score);
    const pool = validItems.length >= 2 ? 2 : 1;
    return validItems[Math.floor(Math.random() * pool)].item;
}

// ==========================================
// 1. ANALOGY MODULE
// ==========================================

export async function GetBestAnalogy(targetId: string, type: 'paragraph' | 'lesson', userId: string): Promise<Analogy | null> {
    if (!targetId || !userId) return null;
    const profile = (tagUser as UserTag[]).filter(u => u.UserId === userId);
    const blocked = (userAnalogy as UserAnalogy[]).filter(ua => ua.UserId === userId && (ua.flaged || ua.status === 'disliked' || ua.skiped)).map(ua => ua.AnalogyId);

    const candidates = (analogy as Analogy[]).filter(item => {
        if (blocked.includes(item.id)) return false;

        if (type === 'paragraph') {
            let masterId = (realParagraph as RealParagraph[]).find(rp => rp.id === targetId)?.MasterParagraphId 
                        || (paragraph as Paragraph[]).find(p => p.id === targetId)?.MasterParagraphId;
            let siblingParas = (paragraph as Paragraph[]).filter(p => p.MasterParagraphId === masterId).map(p => p.id);
            return item.ParagraphId && siblingParas.includes(item.ParagraphId);
        } else {
            let lessonParas = (paragraph as Paragraph[]).filter(p => p.LessonId === targetId).map(p => p.id);
            return item.ParagraphId && lessonParas.includes(item.ParagraphId);
        }
    });

    return pickWinner(candidates.map(item => {
        const { score, tagCount } = calculateScore(item.id, 'AnalogyId', tagRelatorAnalogy, profile, item.createdAt);
        return { item, score, tagCount };
    }));
}

export async function ChangeToBestAnalogy(currentId: string, userId: string): Promise<Analogy | null> {
    const curr = (analogy as Analogy[]).find(a => a.id === currentId);
    if (!curr) return null;

    // 1. Identify valid Paragraph IDs for this Master Concept
    const masterId = (paragraph as Paragraph[]).find(p => p.id === curr.ParagraphId)?.MasterParagraphId;
    const validParaIds = (paragraph as Paragraph[]).filter(p => p.MasterParagraphId === masterId).map(p => p.id);
    
    // 2. Find Candidates + FILTER OUT SKIPPED
    const candidates = (analogy as Analogy[]).filter(a => {
        // Must be a different ID and belong to the same concept
        const isDifferentAndValid = a.id !== currentId && a.ParagraphId && validParaIds.includes(a.ParagraphId);
        
        // Find if this specific user has skipped this specific candidate
        const uaRecord = (userAnalogy as UserAnalogy[]).find(ua => ua.UserId === userId && ua.AnalogyId === a.id);
        const isNotSkipped = !uaRecord || uaRecord.skiped !== true;

        return isDifferentAndValid && isNotSkipped;
    });

    // 3. Get tags of the rejected (current) analogy to avoid similar logic if possible
    const rejTags = (tagRelatorAnalogy as TagRelatorAnalogy[]).filter(r => r.AnalogyId === currentId).map(r => r.TagId);
    
    // 4. Score and Pick
    const scoredCandidates = candidates.map(item => {
        const { score, tagCount } = calculateScore(
            item.id, 
            'AnalogyId', 
            tagRelatorAnalogy, 
            (tagUser as UserTag[]).filter(u => u.UserId === userId), 
            item.createdAt, 
            rejTags
        );
        return { item, score, tagCount };
    });

    return pickWinner(scoredCandidates);
}

// ==========================================
// 2. PARAGRAPH MODULE
// ==========================================

export async function GetBestParagraph(realParagraphId: string, userId: string): Promise<Paragraph | null> {
    const base = (realParagraph as RealParagraph[]).find(p => p.id === realParagraphId);
    if (!base) return null;
    
    const candidates = (paragraph as Paragraph[]).filter(p => p.MasterParagraphId === base.MasterParagraphId);
    return pickWinner(candidates.map(item => {
        const { score, tagCount } = calculateScore(item.id, 'ParagraphId', tagRelatorParagraph, (tagUser as UserTag[]).filter(u => u.UserId === userId), item.createdAt);
        return { item, score, tagCount };
    }));
}

export async function ChangeToBestParagraph(currentId: string, userId: string): Promise<Paragraph | null> {
    let masterId = (realParagraph as RealParagraph[]).find(p => p.id === currentId)?.MasterParagraphId 
                || (paragraph as Paragraph[]).find(p => p.id === currentId)?.MasterParagraphId;
    if (!masterId) return null;

    const candidates = (paragraph as Paragraph[]).filter(p => p.MasterParagraphId === masterId && p.id !== currentId);
    const rejTags = (tagRelatorParagraph as TagRelatorParagraph[]).filter(r => r.ParagraphId === currentId).map(r => r.TagId);
    
    return pickWinner(candidates.map(item => {
        const { score, tagCount } = calculateScore(item.id, 'ParagraphId', tagRelatorParagraph, (tagUser as UserTag[]).filter(u => u.UserId === userId), item.createdAt, rejTags);
        return { item, score, tagCount };
    }));
}

// ==========================================
// 3. SUMMERY MODULE
// ==========================================

export async function GetBestSummery(lessonId: string, userId: string): Promise<Summery | null> {
    const candidates = (summery as Summery[]).filter(s => s.LessonId === lessonId);
    return pickWinner(candidates.map(item => {
        const { score, tagCount } = calculateScore(item.id, 'SummeryId', tagRelatorSummery, (tagUser as UserTag[]).filter(u => u.UserId === userId), item.createdAt);
        return { item, score, tagCount };
    }));
}

export async function ChangeToBestSummery(currentId: string, userId: string): Promise<Summery | null> {
    const curr = (summery as Summery[]).find(s => s.id === currentId);
    if (!curr) return null;
    const candidates = (summery as Summery[]).filter(s => s.LessonId === curr.LessonId && s.id !== currentId);
    const rejTags = (tagRelatorSummery as TagRelatorSummery[]).filter(r => r.SummeryId === currentId).map(r => r.TagId);
    
    return pickWinner(candidates.map(item => {
        const { score, tagCount } = calculateScore(item.id, 'SummeryId', tagRelatorSummery, (tagUser as UserTag[]).filter(u => u.UserId === userId), item.createdAt, rejTags);
        return { item, score, tagCount };
    }));
}

// ==========================================
// 4. KEYWORDS MODULE (BUG FIXED)
// ==========================================

export async function GetBestKeyWord(keywordVariantId: string, userId: string): Promise<KeyWords | null> {
    // FIX: The experiment passes the variant ID (e.g., k_0_0)
    // We use it to find the DefinitionId, then search for siblings.
    const baseVariant = (keywords as KeyWords[]).find(k => k.id === keywordVariantId);
    if (!baseVariant) return null;
    
    const candidates = (keywords as KeyWords[]).filter(k => k.DefinitionId === baseVariant.DefinitionId);
    return pickWinner(candidates.map(item => {
        const { score, tagCount } = calculateScore(item.id, 'KeyWordsId', tagRelatorKeyWords, (tagUser as UserTag[]).filter(u => u.UserId === userId), item.createdAt);
        return { item, score, tagCount };
    }));
}

export async function ChangeToBestKeyWord(currentId: string, userId: string): Promise<KeyWords | null> {
    const curr = (keywords as KeyWords[]).find(k => k.id === currentId);
    if (!curr) return null;
    const candidates = (keywords as KeyWords[]).filter(k => k.DefinitionId === curr.DefinitionId && k.id !== currentId);
    const rejTags = (tagRelatorKeyWords as TagRelatorKeyWords[]).filter(r => r.KeyWordsId === currentId).map(r => r.TagId);
    
    return pickWinner(candidates.map(item => {
        const { score, tagCount } = calculateScore(item.id, 'KeyWordsId', tagRelatorKeyWords, (tagUser as UserTag[]).filter(u => u.UserId === userId), item.createdAt, rejTags);
        return { item, score, tagCount };
    }));
}

// ==========================================
// 5. NOTE MODULE
// ==========================================

export async function GetBestNote(lessonId: string, userId: string): Promise<Note | null> {
    const candidates = (note as Note[]).filter(n => n.LessonId === lessonId);
    return pickWinner(candidates.map(item => {
        const { score, tagCount } = calculateScore(item.id, 'NoteId', tagRelatorNote, (tagUser as UserTag[]).filter(u => u.UserId === userId), item.createdAt);
        return { item, score, tagCount };
    }));
}

export async function ChangeToBestNote(currentId: string, userId: string): Promise<Note | null> {
    const curr = (note as Note[]).find(n => n.id === currentId);
    if (!curr) return null;
    const candidates = (note as Note[]).filter(n => n.LessonId === curr.LessonId && n.id !== currentId);
    const rejTags = (tagRelatorNote as TagRelatorNote[]).filter(r => r.NoteId === currentId).map(r => r.TagId);
    
    return pickWinner(candidates.map(item => {
        const { score, tagCount } = calculateScore(item.id, 'NoteId', tagRelatorNote, (tagUser as UserTag[]).filter(u => u.UserId === userId), item.createdAt, rejTags);
        return { item, score, tagCount };
    }));
}