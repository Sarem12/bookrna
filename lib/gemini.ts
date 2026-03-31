import { GoogleGenerativeAI } from "@google/generative-ai";
import { PromptType, stringifiedContent } from "./types";
import { ProbabilityManager } from "./apiprobablitymanager";
import { UserTag,Tag,UniversalTag } from "./types";
import { PrismaClient,Lesson,User } from "@prisma/client";
// import { userTag,tag,universalTag } from "@/datarelated/data";
import { prisma } from "./prisma";
const probablityEngine = new ProbabilityManager([
    process.env.GEMINI_API_KEY!,
    process.env.GEMINI_API_KEY_2!,
    process.env.GEMINI_API_KEY_3!,
]);

const CURRENT_MODEL = "gemini-3.1-flash-lite-preview";



export async function generateContent(payload: {
    user: User;
    target: stringifiedContent;
    requestType: PromptType;
}, attempt = 1): Promise<any> {
    
    const activeKey = probablityEngine.getKey();
    if (!activeKey) return { error: "CRITICAL: All API keys exhausted." };

    const genAI = new GoogleGenerativeAI(activeKey);
    const model = genAI.getGenerativeModel({
        model: CURRENT_MODEL,
        generationConfig: { responseMimeType: "application/json" }
    });

    const textToProcess = 'content' in payload.target ? payload.target.content : JSON.stringify(payload.target);
const usertags = await prisma.userTag.findMany({
    where: { UserId: payload.user.id },
    include: {
        tag: true // This tells Prisma to "Join" the Tag table automatically
    }
});

// Now just map the names out of the joined data
const userInterests = usertags
    .map(ut => ut.tag.name)
    .filter(Boolean) as string[];
    

const universalInterests = (await prisma.universalTag.findMany({
    include: { tag: true }
})).map(ut => ut.tag.name) as string[];
// const allinterests = Array.from(new Set([...userInterests, ...universalInterests]));
  const jsonSchemas: Record<PromptType, string> = {
    summary: `{ "summary": "string", "tagsUsed": ["string"] }`,
    paragraph: `{ "personalized": "string", "tagsUsed": ["string"] }`,
    analogy: `{ "content": "string", "logic": "string", "interestContext": "string", "tagsUsed": ["string"] }`,
    keyword: `{ "keywords": [{ "word": "string", "definition": "string" }], "tagsUsed": ["string"] }`, // Added tagsUsed
    note: `{ "content": "string", "tagsUsed": ["string"] }` // Added tagsUsed
}

    let taskInstructions = "";
    switch (payload.requestType) {
        case 'paragraph':
            if(payload.target.depth > 0) throw new Error("Paragraph generation doesn't accept depth > 1")
            taskInstructions = `
                REWRITE the text into a clear, step-by-step explanation using markdown **bolding** for key terms.
        
                STRICT RULES:
                1. NO ANALOGIES: Absolutely no "It is like" or "Think of this as."
                2. NO INTEREST VOCABULARY: Do not use words like "game," "computer," "code," "loot," or "space." 
                3. SYSTEM LOGIC: Use the functional logic of USER_INTERESTS & UNIVERSAL_INTERESTS to organize the flow (input -> process -> output) but use neutral, professional science language, make a better flow from the old one.
                4. WORD CHOICE: Use clear words like "transformed," "processed," or "assigned."
                5. PHYSICAL STEPS: Use "part" for "apparatus," "small bags" for "vesicles," and "sending out" for "secretion." 
                6. SCIENTIFIC NAMES: You MUST keep the core terms (e.g., Golgi apparatus) so the lesson remains accurate.
                7. TONE: Write a direct, factual note. No "chill" or "mentor" personality.
                8. NO SUMMERY: Do not add a summary at the end. Just the step-by-step explanation.
                      - also do not summery the paparapgh simply only rewrite it in a more clear way with better flow and with the rules above.
                9. FORMATTING: Do NOT add numbers (1., 2.) or bullets. Write flowing sentences.`;
                console.log("passed");
                
            break;
            
        case 'keyword':
            taskInstructions = `
                Pick the main terms. Define them by their JOB in the system.
        
                STRICT RULES:
                1. NO METAPHORS: Do not use "game," "computer," "code," etc.
                2. SYSTEM ROLE: Explain what the part DOES (e.g., "The part that sorts items").
                3. SIMPLE LANGUAGE: Use words a 10-year-old knows. 
                   - "made" instead of "synthesized"
                   - "moving" instead of "transport"
                4. ACCURACY: Keep the core scientific term as the keyword.`;
            break;
            
        case 'analogy':
            if(payload.target.depth > 1) throw new Error("Analogy doesn't accept depth > 1")
            taskInstructions = `
               1. CREATE: One simple metaphor for the given text process using the logic of: USER_INTERESTS & UNIVERSAL_INTERESTS.
        2. CONTENT: Keep the explanation to 2 sentences.
        3. LOGIC: Explain how the process and the interest share the same functional steps.
        4. CONTEXT: Identify which specific interest you used (e.g., "Gaming" or "Physics").
        5. TAGS: List the tags you used from the user's interests exactly the same name with out case changes.

        STRICT RULES:
        - The "content" must explain the science through the lens of the interest.
        - The "tagsUsed" MUST be a subset of the user interests provided.`;
            break;
            
        case 'summary':
            taskInstructions = `
                Summarize the main process in 10 simple words or less.
                STRICT RULES:
                1. NO INTEREST WORDS: Do not use "game," "computer," etc.
                2. SYSTEM FLOW: Focus only on how items move or change.
                3. VOCABULARY: Use the simplest possible action words.`;
            break;
    
        case 'note':
            if(payload.target.depth > 0) throw new Error("Note generation doesn't accept depth > 1")
            taskInstructions = `
                Write a concise note that captures the core ideas of the text just like a teacher would.
                STRICT RULES:
                1. NO INTEREST WORDS: Do not use "game," "computer," etc.
                2. FOCUS: Capture the core concept or function in a single, clear sentence.
                3. TONE: Write a direct, factual note. No "chill" or "mentor" personality.
                4. FORMATTING: Do NOT add numbers (1., 2.) or bullets. Write a flowing sentence.
                5. SYSTEM LOGIC: Use the functional logic of USER_INTERESTS & UNIVERSAL_INTERESTS to organize the flow (input -> process -> output) but use neutral, professional science language.
                `;
            break;
    }

    const finalPrompt = `
        ACT AS: A Plain English Science Guide.
        USER_INTERESTS: ${userInterests.join(", ")}
        UNIVERSAL_INTERESTS: ${universalInterests.join(", ")}
        TASK: ${taskInstructions}
        SOURCE_TEXT: "${textToProcess}"

        STRICT RULES:
        - Return ONLY JSON.
        - NO "textbook" language. No slang. Just clear, simple facts.
        - priority of USER_INTERESTS over UNIVERSAL_INTERESTS if there's overlap in logic.
        - tagsUsed Must only include tags that are used in the ${payload.requestType} you generated and should have teh exact same name with no Case changes.
        OUTPUT_FORMAT: ${jsonSchemas[payload.requestType]}
    `;

    try {
        const result = await model.generateContent(finalPrompt);
      const responseText = result.response.text();


const jsonMatch = responseText.match(/\{[\s\S]*\}/);
const cleanJson = jsonMatch ? jsonMatch[0] : responseText;

return JSON.parse(cleanJson);
    } catch (e: any) {
        if (e.status === 429 || e.message?.includes("429")) {
            probablityEngine.disableKey(activeKey);
            if (attempt < 3) return generateContent(payload, attempt + 1);
        }
        return { error: "Failed to generate content." };
    }
}

export async function getTagsFromAI(userBio: string, existingTags: string[], attempt = 1): Promise<any> {
    const activeKey = probablityEngine.getKey();
    if (!activeKey || userBio.length < 10) return [];

    try {
        const genAI = new GoogleGenerativeAI(activeKey);
        const model = genAI.getGenerativeModel({
            model: CURRENT_MODEL,
            generationConfig: { responseMimeType: "application/json", temperature: 0.1 }
        });

        const prompt = `
        Extract the user's main interests and learning preference tags from this text:
        "${userBio}"

        EXISTING_TAGS:
        ${JSON.stringify(existingTags)}

        RULES:
        - Prefer exact existing tags when they fit.
        - If an important tag does not already exist, create a short new tag name with 1 to 3 words.
        - Return only useful tags, no sentences.
        - Return between 1 and 6 tags.
        - Return JSON only.

        OUTPUT:
        ["tag one", "tag two"]
        `;

        const result = await model.generateContent(prompt);
        const cleanJson = result.response.text().replace(/```json|```/g, "").trim();
        return (JSON.parse(cleanJson) as string[])
            .map((tag) => String(tag).trim())
            .filter(Boolean);

    } catch (e: any) {
        if (e.status === 429 || e.message?.includes("429")) {
            probablityEngine.disableKey(activeKey); 
            if (attempt < 3) return getTagsFromAI(userBio, existingTags, attempt + 1);
        }
        return [];
    }
}
