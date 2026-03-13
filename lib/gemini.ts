import { Type } from "@google/genai";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
type PromptType = 'analogy'|'keyword'|'summary'|'paragraph';
type User = {
    gender: 'male'|'female';
    age: number;
    tag: string[];

}
type Unit = {
    title: string;
    paragraphs: Paragraph[];
} 
type Lesson = {
    title: string;
    unit? : Unit;
    Paragraphs: Paragraph[];
    ParentLesson?: Lesson;
    ChildLessons?: Lesson[];
}
type Paragraph = {
    content: string;
    unit?: Unit;
    lesson?: Lesson;
}
export async function generateContent(payload: {
    user: User;           
    target: Paragraph | Lesson | Unit; 
    requestType: PromptType;
}) {
    const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        generationConfig: { responseMimeType: "application/json" }
    });

    // Clean the data: We stringify but limit depth if needed
    const rawContext = JSON.stringify(payload.target);
    const userContext = JSON.stringify(payload.user);

    let jsonSchema = "";
    switch (payload.requestType) {
        case 'summary':   jsonSchema = `{ "summary": "string" }`; break;
        case 'paragraph': jsonSchema = `{ "personalized": "string" }`; break;
        case 'analogy':   jsonSchema = `{ "content": "string", "logic": "string" }`; break;
        case 'keyword':   jsonSchema = `{ "word": "string", "definition": "string" }`; break;
    }

    const finalPrompt = `
        ACT AS: Bekam, a recursive textbook personalizer.
        USER DATA: ${userContext}
        CONTENT DATA: ${rawContext}
        TASK: Generate a "${payload.requestType}" based strictly on the provided CONTENT DATA, personalized for the USER DATA.
        STRICT JSON FORMAT: ${jsonSchema}
    `;

    try {
        const result = await model.generateContent(finalPrompt);
        return JSON.parse(result.response.text());
    } catch (e) {
        console.error("Bekam AI Error:", e);
        return { error: "Failed to generate personalized content." };
    }
}
async function getTagsFromAI(userBio: string, existingTags: string[]) {
    try {
        if (userBio.length < 30 || userBio.length > 500) {
            throw new Error("Bio length invalid (30-500 chars).");
        }

        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.5-flash-lite",
            generationConfig: { responseMimeType: "application/json" }
        });

        const prompt = `
            USER_BIO: "${userBio}"
            EXISTING_TAGS: ${JSON.stringify(existingTags)}

            TASK: Extract 3-5 tags representing this person's interests (games, movies, hobbies, etc.).
            RULES:
            1. Use EXISTING_TAGS first to avoid duplicates (e.g., use "Gaming" instead of "video games").
            2. For movies/games, use the GENRE (e.g., "Interstellar" -> "Sci-Fi").
            3. Always use Title Case (e.g., "Action", not "action").
            4. Return ONLY a JSON array of strings.
        `;

        const result = await model.generateContent(prompt);
        return JSON.parse(result.response.text()) as string[];
    } catch (e) {
        console.error("Tag Extraction Error:", e);
        return [];
    }
}