import { Lesson, DefaultParagraph, stringifiedContent, Unit } from "./types";
import { lessonOut,lesson,paragraph } from "@/datarelated/data";
export  function stringifyLesson(Lesson: Lesson,index:string = Lesson.index.toString(),depth: number = 0): stringifiedContent{
    const paragraphs = (paragraph as DefaultParagraph[]).filter(p => p.LessonId === Lesson.id);
    let text = `
       ${Lesson.title}\n` + paragraphs.map(p => p.content).join("\n");
       const sublessons = (lesson as Lesson[]).filter(l => l.ParentLessonId === Lesson.id);
       if(sublessons.length > 0) depth ++;
       for (const sub of sublessons) {
        const subc= stringifyLesson(sub,`${index}.${sub.index}`, depth);
        text += `\n${subc.content}`;
        depth = Math.max(depth, subc.depth);
    }
    return { content: text, depth};
}

export function stringifyUnit(unit: Unit): stringifiedContent {
    let text = `Unit: ${unit.title}\n`;
 const lessonsInUnit = (lesson as Lesson[]).filter(l => l.unitId === unit.id) as Lesson[];
    lessonsInUnit.forEach(lesson => {
        text += stringifyLesson(lesson).content + "\n";
    });
    return { content: text, depth: 10 };
}
export function stringifyDefaultParagraph(paragraph: DefaultParagraph):stringifiedContent {
    return { content: paragraph.content, depth: 0 };
}