import fs from 'fs';
import path from 'path';

// --- FOUNDATION IMPORTS ---
import analogyDefaulti from "./database/analogyDefault.json";
import analogyi from "./database/analogy.json";
import lessoni from "./database/lesson.json";
import masterParagraphi from "./database/masterParagrpah.json";
import paragraphi from "./database/paragraph.json";
import realParagraphi from "./database/realParagraph.json";
import summeryi from "./database/summery.json";
import tagi from "./database/tag.json";
import tagUseri from "./database/tagUser.json";
import uniti from "./database/unit.json";
import useri from "./database/user.json";
import keywordi from "./database/keyword.json";
import keywordsi from "./database/keywords.json";
import universalTagi from "./database/universalTag.json";
import notei from "./database/note.json";

// --- USER INTERACTION IMPORTS ---
import userAnalogyi from "./database/userAnalogy.json";
import userSummeryi from "./database/userSummery.json";
import userKeyWordsi from "./database/userKeyWords.json";
import userNotei from "./database/userNote.json";

// --- TAG RELATOR IMPORTS (Separate files for performance) ---
import tagRelatorAnalogyi from "./database/tagRelatorAnalogy.json";
import tagRelatorParagraphi from "./database/tagRelatorParagraph.json";
import tagRelatorSummeryi from "./database/tagRelatorSummery.json";
import tagRelatorKeyWordsi from "./database/tagRelatorKeyWords.json";
import tagRelatorNotei from "./database/tagRelatorNote.json";

import usertagi from "./database/userTag.json";
// --- FACTORY FUNCTION ---
export function Create(inp: any) {
    return {
        // This 'data' will now include views, usage, flags, and createdAt
        data: inp.data as Record<string, any>[], 
        out: (newData: any) => {
            try {
                const filePath = path.join(process.cwd(), "database", `${inp.name}.json`);
                const jsonString = JSON.stringify({ name: inp.name, data: newData }, null, 2);
                fs.writeFileSync(filePath, jsonString, 'utf-8');
                console.log(`✅ ${inp.name}.json updated with performance stats!`);
            } catch (error) {
                console.error(`❌ Failed to update ${inp.name}.json:`, error);
            }
        }
    };
}

// --- CORE ENTITIES ---
export const { data: analogyDefault, out: analogyDefaultOut } = Create(analogyDefaulti);
export const { data: analogy, out: analogyOut } = Create(analogyi);
export const { data: lesson, out: lessonOut } = Create(lessoni);
export const { data: masterParagraph, out: masterParagraphOut } = Create(masterParagraphi);
export const { data: paragraph, out: paragraphOut } = Create(paragraphi);
export const { data: realParagraph, out: realParagraphOut } = Create(realParagraphi);
export const { data: summery, out: summeryOut } = Create(summeryi);
export const { data: tag, out: tagOut } = Create(tagi);
export const { data: tagUser, out: tagUserOut } = Create(tagUseri);
export const { data: unit, out: unitOut } = Create(uniti);
export const { data: user, out: userOut } = Create(useri);
export const { data: note, out: noteOut } = Create(notei);
export const { data: keyword, out: keywordOut } = Create(keywordi);
export const { data: keywords, out: keywordsOut } = Create(keywordsi);
export const { data: universalTag, out: universalTagOut } = Create(universalTagi);

// --- USER TRACKING ---
export const { data: userAnalogy, out: userAnalogyOut } = Create(userAnalogyi);
export const { data: userSummery, out: userSummeryOut } = Create(userSummeryi);
export const { data: userKeyWords, out: userKeyWordsOut } = Create(userKeyWordsi);
export const { data: userNote, out: userNoteOut } = Create(userNotei);

// --- PERFORMANCE RELATORS ---
export const { data: tagRelatorAnalogy, out: tagRelatorAnalogyOut } = Create(tagRelatorAnalogyi);
export const { data: tagRelatorParagraph, out: tagRelatorParagraphOut } = Create(tagRelatorParagraphi);
export const { data: tagRelatorSummery, out: tagRelatorSummeryOut } = Create(tagRelatorSummeryi);
export const { data: tagRelatorKeyWords, out: tagRelatorKeyWordsOut } = Create(tagRelatorKeyWordsi);
export const { data: tagRelatorNote, out: tagRelatorNoteOut } = Create(tagRelatorNotei);
export const { data: userTag, out: userTagOut } = Create(usertagi);