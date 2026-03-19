import { ChangeToBestAnalogy, GetBestAnalogy } from "@/lib/analyzer";
import { generateContent } from "@/lib/gemini";
import { Lesson, stringifiedContent,User } from "@/lib/types";
import { stringifyLesson, stringifyDefaultParagraph, stringifyUnit } from "@/lib/stringifiers";
import { userOut,user, lesson,analogy as analogyd,analogyDefault,
    analogyDefaultOut,analogyOut,
    userAnalogy,
    userAnalogyOut,
    tag,
    universalTag,
    tagRelatorAnalogy,
    tagRelatorAnalogyOut,
    paragraph,
    masterParagraph
} from "@/datarelated/data";
import { Analogy, DefaultAnalogy,DefaultParagraph,Tag,TagRelatorAnalogy,UserAnalogy } from "@/lib/types";
export async function GetAnalogy(UserId: string, contentId: string, type: 'lesson' | 'paragraph') {
    const analogy = await GetBestAnalogy(UserId, type, contentId);
    
    if (analogy === null) {
        const CurrentUser = user.find(u => u.id === UserId) as User;
        if (!CurrentUser) return { error: "User not found" };

        let stringified: stringifiedContent;
        let contentIdKey: "lessonId" | "ParagraphId";

        // 1. Prepare Content Based on Type
        if (type === 'lesson') {
            const CurrentLesson = (lesson as Lesson[]).find(l => l.id === contentId);
            if (!CurrentLesson) return { error: "Lesson not found" };
            stringified = stringifyLesson(CurrentLesson);
            contentIdKey = "lessonId";
        } else  {
            const CurrentParagraph = (masterParagraph as DefaultParagraph[]).find(p => p.id === contentId);
            if (!CurrentParagraph) return { error: "Paragraph not found" };
            stringified = stringifyDefaultParagraph(CurrentParagraph);
            contentIdKey = "ParagraphId";
        }

        // 2. Generate AI Content
        const response = await generateContent({
            requestType: 'analogy',
            user: CurrentUser,
            target: stringified
        });

        if (response.error) return response;

        // 3. Setup IDs
        const timestamp = Date.now();
        const analogyId = `ana-${timestamp}`;
        const defaultanalogyId = `defana-${timestamp}`;

        // 4. Map Tags Safely (Prevents crashes if AI hallucinated a tag name)
        const analogytags: TagRelatorAnalogy[] = (response.tagsUsed || [])
            .map((ta: string) => {
                const specificTag = (tag as Tag[]).find(t => t.name.toLowerCase() === ta.toLowerCase());
                if (!specificTag) return null;
                return {
                    id: `tagrel-${timestamp}-${Math.random()}`,
                    TagId: specificTag.id,
                    AnalogyId: analogyId,
                    likes: 0, dislikes: 0, views: 0, usage: 0, flags: 0,
                };
            })
            .filter(Boolean) as TagRelatorAnalogy[];

        // 5. Create Objects
        const newAnalogy: Analogy = {
            id: analogyId,
            content: response.content,
            logic: response.logic,
            [contentIdKey]: contentId,
            likes: 0, dislikes: 0, views: 1, usage: 1, flags: 0,
            defaultAnalogyId: defaultanalogyId,
            createdAt: new Date().toISOString(),
        } as Analogy;

        const defaultAnalogy: DefaultAnalogy = {
            id: defaultanalogyId,
            content: response.content,
            logic: response.logic,
            [contentIdKey]: contentId,
            likes: 0, dislikes: 0, views: 1, usage: 1, flags: 0,
            AnalogyId: analogyId,
            UserId: UserId,
            createdAt: new Date().toISOString(),
            order: 0
        } as DefaultAnalogy;

        const useranalogy: UserAnalogy = {
            id: `userana-${timestamp}`,
            UserId: UserId,
            AnalogyId: analogyId,
            flaged: false,
            onuse: true,
            status: 'neutral',
            lastSeenAt: new Date().toISOString(),
            skiped: false
        };

        // 6. Persistence
        analogyd.push(newAnalogy);
        analogyDefault.push(defaultAnalogy);
        userAnalogy.push(useranalogy);
        tagRelatorAnalogy.push(...analogytags);

        analogyOut(analogyd);
        analogyDefaultOut(analogyDefault);
        userAnalogyOut(userAnalogy);
        tagRelatorAnalogyOut(tagRelatorAnalogy);

        return response; 
    } 

    return analogy;

}
export async function ChangeAnalogy(DefaultAnalogyId: string, userId: string) {
    const defAnalogyRecord = (analogyDefault as DefaultAnalogy[]).find(da => da.id === DefaultAnalogyId);
    if (!defAnalogyRecord) return { error: "Default Analogy record not found" };

    // 1. Mark the current one as skipped immediately using the reference
    const currentUA = (userAnalogy as UserAnalogy[]).find(ua => 
        ua.UserId === userId && 
        ua.AnalogyId === defAnalogyRecord.AnalogyId
    );
    
    if (currentUA) {
        currentUA.skiped = true;
        currentUA.onuse = false; // Optional: mark it as no longer the active one
    }

    // 2. Try to find an existing better one in the database first
    const analogy = await ChangeToBestAnalogy(DefaultAnalogyId, userId);
  


    // 3. If ChangeToBestAnalogy returns a match, we just return that
    if (analogy !== null) return analogy;

    // 4. If no better one exists, generate a NEW one via AI
    const CurrentUser = user.find(u => u.id === userId) as User;
    if (!CurrentUser) return { error: "User not found" };

    // Determine type based on what ID exists in the default record
    const type = defAnalogyRecord.lessonId ? 'lesson' : 'paragraph';
    const contentId = (defAnalogyRecord.lessonId || defAnalogyRecord.ParagraphId) as string;

    let stringified: any;
    let contentIdKey: "lessonId" | "ParagraphId";

    if (type === 'lesson') {
        const CurrentLesson = (lesson as Lesson[]).find(l => l.id === contentId);
        if (!CurrentLesson) return { error: "Lesson not found" };
        stringified = stringifyLesson(CurrentLesson);
        contentIdKey = "lessonId";
    } else {
        const CurrentParagraph = (masterParagraph as DefaultParagraph[]).find(p => p.id === contentId);
        if (!CurrentParagraph) return { error: "Paragraph not found" };
        stringified = stringifyDefaultParagraph(CurrentParagraph);
        contentIdKey = "ParagraphId";
    }

    const response = await generateContent({
        requestType: 'analogy',
        user: CurrentUser,
        target: stringified
    });

    if (response.error) return response;

    const timestamp = Date.now();
    const analogyId = `ana-${timestamp}`;
    const newDefaultId = `defana-${timestamp}`;

    // Tag Mapping
    const analogytags: TagRelatorAnalogy[] = (response.tagsUsed || [])
        .map((ta: string) => {
            const specificTag = (tag as Tag[]).find(t => t.name.toLowerCase() === ta.toLowerCase());
            if (!specificTag) return null;
            return {
                id: `tagrel-${timestamp}-${Math.random()}`,
                TagId: specificTag.id,
                AnalogyId: analogyId,
                likes: 0, dislikes: 0, views: 0, usage: 0, flags: 0,
            };
        })
        .filter(Boolean) as TagRelatorAnalogy[];

    const newAnalogy: Analogy = {
        id: analogyId,
        content: response.content,
        logic: response.logic,
        [contentIdKey]: contentId,
        likes: 0, dislikes: 0, views: 1, usage: 1, flags: 0,
        defaultAnalogyId: newDefaultId,
        createdAt: new Date().toISOString(),
    } as Analogy;

    const newDefaultAnalogy: DefaultAnalogy = {
        id: newDefaultId,
        content: response.content,
        logic: response.logic,
        [contentIdKey]: contentId,
        likes: 0, dislikes: 0, views: 1, usage: 1, flags: 0,
        AnalogyId: analogyId,
        UserId: userId,
        createdAt: new Date().toISOString(),
        order: (defAnalogyRecord.order || 0) + 1 // Increment order for cycling
    } as DefaultAnalogy;

    const useranalogy: UserAnalogy = {
        id: `userana-${timestamp}`,
        UserId: userId,
        AnalogyId: analogyId,
        flaged: false,
        onuse: true,
        status: 'neutral',
        lastSeenAt: new Date().toISOString(),
        skiped: false
    };

    // Save
    analogyd.push(newAnalogy);
    analogyDefault.push(newDefaultAnalogy);
    userAnalogy.push(useranalogy);
    tagRelatorAnalogy.push(...analogytags);

    analogyOut(analogyd);
    analogyDefaultOut(analogyDefault);
    userAnalogyOut(userAnalogy);
    tagRelatorAnalogyOut(tagRelatorAnalogy);

    return response;
}
export async function LikeEventAnalogy(UserId: string, AnalogyId: string,) {
const target:UserAnalogy|undefined = (userAnalogy as UserAnalogy[]).find(ua => ua.UserId === UserId && ua.AnalogyId === AnalogyId);
if (!target) return { error: "UserAnalogy not found" };
const wasdisliked = target.status === 'disliked';
if (target.status !== 'liked'){
target.status = 'liked';
const analogy = (analogyd as Analogy[]).find(a => a.id === AnalogyId);
if (analogy) {analogy.likes += 1; if (wasdisliked) analogy.dislikes = Math.max(0, analogy.dislikes - 1);}
const defaultAnalogy = (analogyDefault as DefaultAnalogy[]).find(da => da.AnalogyId === AnalogyId);
if (defaultAnalogy) {defaultAnalogy.likes += 1; if (wasdisliked) defaultAnalogy.dislikes = Math.max(0, defaultAnalogy.dislikes - 1);}
const tagRelations = (tagRelatorAnalogy as TagRelatorAnalogy[]).filter(tra => tra.AnalogyId === AnalogyId);
tagRelations.forEach(tr => {tr.likes += 1; if (wasdisliked) tr.dislikes = Math.max(0, tr.dislikes - 1);});
}
else{
target.status = 'neutral';
const analogy = (analogyd as Analogy[]).find(a => a.id === AnalogyId);
if (analogy) analogy.likes -= 1; 
const defaultAnalogy = (analogyDefault as DefaultAnalogy[]).find(da => da.AnalogyId === AnalogyId);
if (defaultAnalogy) defaultAnalogy.likes -= 1;
const tagRelations = (tagRelatorAnalogy as TagRelatorAnalogy[]).filter(tra => tra.AnalogyId === AnalogyId);
tagRelations.forEach(tr => tr.likes -= 1);
}
userAnalogyOut(userAnalogy);
analogyOut(analogyd);
analogyDefaultOut(analogyDefault);
tagRelatorAnalogyOut(tagRelatorAnalogy);
return { success: true,
          newStatus: target.status,
          likeCount: (analogyd as Analogy[]).find(a => a.id === AnalogyId)?.likes || 0,
          dislikeCount: (analogyd as Analogy[]).find(a => a.id === AnalogyId)?.dislikes || 0,
          
 };

}                                                                             
export async function DislikeEventAnalogy(UserId: string, AnalogyId: string) {
    const target: UserAnalogy | undefined = (userAnalogy as UserAnalogy[]).find(ua => ua.UserId === UserId && ua.AnalogyId === AnalogyId);
    if (!target) return { error: "UserAnalogy not found" };

    const wasliked = target.status === 'liked';

    if (target.status !== 'disliked') {
        target.status = 'disliked';
        const analogy = (analogyd as Analogy[]).find(a => a.id === AnalogyId);
        if (analogy) {
            analogy.dislikes += 1;
            if (wasliked) analogy.likes = Math.max(0, analogy.likes - 1);
        }
        const defaultAnalogy = (analogyDefault as DefaultAnalogy[]).find(da => da.AnalogyId === AnalogyId);
        if (defaultAnalogy) {
            defaultAnalogy.dislikes += 1;
            if (wasliked) defaultAnalogy.likes = Math.max(0, defaultAnalogy.likes - 1);
        }
        const tagRelations = (tagRelatorAnalogy as TagRelatorAnalogy[]).filter(tra => tra.AnalogyId === AnalogyId);
        tagRelations.forEach(tr => {
            tr.dislikes += 1;
            if (wasliked) tr.likes = Math.max(0, tr.likes - 1);
        });
    } else {
        target.status = 'neutral';
        const analogy = (analogyd as Analogy[]).find(a => a.id === AnalogyId);
        if (analogy) analogy.dislikes = Math.max(0, analogy.dislikes - 1);
        const defaultAnalogy = (analogyDefault as DefaultAnalogy[]).find(da => da.AnalogyId === AnalogyId);
        if (defaultAnalogy) defaultAnalogy.dislikes = Math.max(0, defaultAnalogy.dislikes - 1);
        const tagRelations = (tagRelatorAnalogy as TagRelatorAnalogy[]).filter(tra => tra.AnalogyId === AnalogyId);
        tagRelations.forEach(tr => tr.dislikes = Math.max(0, tr.dislikes - 1));
    }

    userAnalogyOut(userAnalogy);
    analogyOut(analogyd);
    analogyDefaultOut(analogyDefault);
    tagRelatorAnalogyOut(tagRelatorAnalogy);

    return {
        success: true,
        newStatus: target.status,
        likeCount: (analogyd as Analogy[]).find(a => a.id === AnalogyId)?.likes || 0,
        dislikeCount: (analogyd as Analogy[]).find(a => a.id === AnalogyId)?.dislikes || 0,
    };
}
export async function FlagEventAnalogy(UserId: string, AnalogyId: string) {
    const target: UserAnalogy | undefined = (userAnalogy as UserAnalogy[]).find(ua => ua.UserId === UserId && ua.AnalogyId === AnalogyId);
    if (!target) return { error: "UserAnalogy not found" };

    target.flaged = !target.flaged;
    const change = target.flaged ? 1 : -1;

    const analogy = (analogyd as Analogy[]).find(a => a.id === AnalogyId);
    if (analogy) analogy.flags = Math.max(0, analogy.flags + change);

    const defaultAnalogy = (analogyDefault as DefaultAnalogy[]).find(da => da.AnalogyId === AnalogyId);
    if (defaultAnalogy) defaultAnalogy.flags = Math.max(0, defaultAnalogy.flags + change);

    const tagRelations = (tagRelatorAnalogy as TagRelatorAnalogy[]).filter(tra => tra.AnalogyId === AnalogyId);
    tagRelations.forEach(tr => tr.flags = Math.max(0, tr.flags + change));

    userAnalogyOut(userAnalogy);
    analogyOut(analogyd);
    analogyDefaultOut(analogyDefault);
    tagRelatorAnalogyOut(tagRelatorAnalogy);

    return { success: true, flagged: target.flaged };
}
















