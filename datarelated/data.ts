import fs from 'fs';
import path from 'path';
import lessoni from "./database/lesson.json";
import useri from "./database/user.json";
import uniti from "./database/unit.json";
import tagi from "./database/tag.json";
export function Create(inp:any){
    return {data:inp.data,out:(newData:any)=>{
        try {
        // 1. Define the path to your file
        const filePath = path.join(process.cwd(), "database", `${inp.name}.json`);

        // 2. Convert the object to a formatted JSON string
        // The 'null, 2' keeps the JSON easy to read in your editor
        const jsonString = JSON.stringify(newData, null, 2);

        // 3. Sync the "Brain" (memory) to the "Paper" (disk)
        fs.writeFileSync(filePath, jsonString, 'utf-8');

        console.log("✅ lesson.json has been updated!");
    } catch (error) {
        console.error("❌ Failed to update lesson.json:", error);
    }
    }};
}

export const {data:lesson, out:lessonOut} = Create(lessoni);
export const {data:user, out:userOut} = Create(useri);
export const {data:unit, out:unitOut} = Create(uniti);
export const {data:tag, out:tagOut} = Create(tagi);
