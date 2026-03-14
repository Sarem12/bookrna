import { GoogleGenerativeAI } from "@google/generative-ai";
import { lesson } from "../datarelated/data";
// 1. --- TYPES (Aligned with Prisma Schema) ---
export type PromptType = 'analogy' | 'keyword' | 'summary' | 'paragraph';

export type UserProfile = {
    gender: 'MALE' | 'FEMALE';
    age: number;
    tags: string[]; // These are the Tag names from your DB
};
export type stringifiedContent = {
    content: string;
    depth: number;
}
export type MasterParagraph = {
    content: string;
    lessonId: string;
};

export type Lesson = {
    index: number; // Position within the unit
    title: string;
    paragraphs: MasterParagraph[];
    sublessons: Lesson[]; 
    // Allow nested lessons for flexibility
};

export type Unit = {
    title: string;
    lessons: Lesson[];
};

// 2. --- SETUP ---
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const CURRENT_MODEL = "gemini-3.1-flash-lite-preview";

// 3. --- CORE FUNCTIONS ---
export  function stringifyLesson(Lesson: Lesson,index:string = Lesson.index.toString(),depth: number = 0): stringifiedContent{
      let text = `
       ${Lesson.title}\n` + Lesson.paragraphs.map(p => p.content).join("\n");
    if(Lesson.sublessons.length > 0) depth ++;
       for (const sub of Lesson.sublessons) {
        const subc= stringifyLesson(sub,`${index}.${sub.index}`, depth);
        text += `\n${subc.content}`;
        depth = Math.max(depth, subc.depth);
    }
    return { content: text, depth};
}

export function stringifyUnit(unit: Unit): stringifiedContent {
    let text = `Unit: ${unit.title}\n`;
    unit.lessons.forEach(lesson => {
        text += stringifyLesson(lesson).content + "\n";
    });
    return { content: text, depth: 10 };
}
export function stringifyMasterParagraph(paragraph: MasterParagraph):stringifiedContent {
    return { content: paragraph.content, depth: 0 };
}

export async function generateContent(payload: {
    user: UserProfile;
    target: stringifiedContent;
    requestType: PromptType;
}) {
    const model = genAI.getGenerativeModel({
        model: CURRENT_MODEL,
        generationConfig: { responseMimeType: "application/json" }
    });

    const textToProcess = 'content' in payload.target ? payload.target.content : JSON.stringify(payload.target);

    const jsonSchemas: Record<PromptType, string> = {
        summary: `{ "summary": "string" }`,
        paragraph: `{ "personalized": "string" }`,
        analogy: `{ "content": "string", "logic": "string", "interestContext": "string" }`,
        keyword: `{ "keywords": [{ "word": "string", "definition": "string" }] }`
    };
    
    let taskInstructions = "";
    switch (payload.requestType) {
        case 'paragraph':
            if(payload.target.depth > 0) throw new Error("Paragraph generation don't accept depth higher than 1")
            taskInstructions = `
                REWRITE the text so it makes sense to someone who understands: ${payload.user.tags.join(", ")}. 
                FOCUS on the logical flow: How is info stored? How is it moved? How is it used?
                STRICT RULES:
                1. DO NOT use misleading "tech-hybrid" words like "binary-encoded" or "storage module".
                2. Use natural, human language that explains the process as a logical system.
                3. No "is like" or "as" analogies. Just describe the operation directly.`;
            break;
            
        case 'keyword':

            taskInstructions = `
                IDENTIFY core terms.
                DEFINE them by explaining their functional role within a system. 
                Use the logic of ${payload.user.tags.join(", ")} to make the definition click.
                STRICT RULES:
                1. No "is like" or "think of". 
                2. If the user likes Computers, explain the term as a "Master Record" or "Instruction Set" rather than "Hard Drive".
                3. Keep it scientifically accurate but conceptually familiar.`;
            break;
            
        case 'analogy':
            if(payload.target.depth >1) throw new Error("Analogy don't accept depth higher than 1")
            taskInstructions = `
                Create a simple, conversational metaphor using ${payload.user.tags.join(", ")}. 
                Keep it grounded and easy to explain to a friend.`;
            break;
            
        case 'summary':
            taskInstructions = `Summarize this in 1-2 plain-English sentences that emphasize the logical flow of information.`;
            break;
    }

    const finalPrompt = `
        ACT AS: Bekam, a cognitive learning architect.
        USER_INTERESTS: ${payload.user.tags.join(", ")}
        
        TASK: ${taskInstructions}
        SOURCE_TEXT: "${textToProcess}"

        STRICT RULES:
        - Return ONLY JSON.
        - No conversational filler.
        - Absolute technical accuracy.

        OUTPUT_FORMAT: ${jsonSchemas[payload.requestType]}
    `;

    try {
        const result = await model.generateContent(finalPrompt);
        return JSON.parse(result.response.text());
    } catch (e) {
        console.error("Bekam AI Error:", e);
        return { error: "Failed to generate." };
    }
}
export async function getTagsFromAI(userBio: string, existingTags: string[]) {
  try {
    if (userBio.length < 10) return []; // Too short to have "main points"

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
      generationConfig: { 
        responseMimeType: "application/json",
        temperature: 0.3 // Slightly higher to catch more "variety" in hobbies
      }
    });

    const prompt = `
      USER_BIO: "${userBio}"
      EXISTING_DATABASE_TAGS: ${JSON.stringify(existingTags)}

      TASK: 
      Identify and extract all distinct interests, hobbies, or professional fields mentioned. 
      Do not follow a strict word-to-tag ratio—focus on capturing the "Main Points" of their identity.

      RULES:
      1. EXTRACT ALL: If they mention 5 different hobbies in 20 words, extract all 5.
      2. MAPPING: Convert specific titles to general categories (e.g., "Call of Duty" -> "Gaming", "Star Wars" -> "Sci-Fi").
      3. DATABASE SYNC: Use names from EXISTING_DATABASE_TAGS if they match the user's intent.
      4. MAX LIMIT: Cap the output at 10 tags total to prevent database clutter.
      5. OUTPUT: Return only a JSON array of strings.
    `;

    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text()) as string[];

  } catch (e) {
    console.error("Bekam Tagging Error:", e);
    return [];
  }
}

// runBiologyExperiment();