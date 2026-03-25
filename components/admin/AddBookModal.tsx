"use client";

import { useState } from "react";
import { createBook } from "@/app/actions/book";

interface UnitData {
  title: string;
  lessons: {
    title: string;
    index: number;
    realParagraphs: {
      content: string;
      order: number;
    }[];
  }[];
}

export default function AddBookModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [units, setUnits] = useState<UnitData[]>([]);

  const addUnit = () => {
    setUnits([...units, { title: "", lessons: [] }]);
  };

  const updateUnit = (index: number, title: string) => {
    const newUnits = [...units];
    newUnits[index].title = title;
    setUnits(newUnits);
  };

  const removeUnit = (index: number) => {
    setUnits(units.filter((_, i) => i !== index));
  };

  const addLesson = (unitIndex: number) => {
    const newUnits = [...units];
    newUnits[unitIndex].lessons.push({
      title: "",
      index: newUnits[unitIndex].lessons.length + 1,
      realParagraphs: []
    });
    setUnits(newUnits);
  };

  const updateLesson = (unitIndex: number, lessonIndex: number, title: string) => {
    const newUnits = [...units];
    newUnits[unitIndex].lessons[lessonIndex].title = title;
    setUnits(newUnits);
  };

  const removeLesson = (unitIndex: number, lessonIndex: number) => {
    const newUnits = [...units];
    newUnits[unitIndex].lessons = newUnits[unitIndex].lessons.filter((_, i) => i !== lessonIndex);
    setUnits(newUnits);
  };

  const addParagraph = (unitIndex: number, lessonIndex: number) => {
    const newUnits = [...units];
    newUnits[unitIndex].lessons[lessonIndex].realParagraphs.push({
      content: "",
      order: newUnits[unitIndex].lessons[lessonIndex].realParagraphs.length + 1
    });
    setUnits(newUnits);
  };

  const updateParagraph = (unitIndex: number, lessonIndex: number, paragraphIndex: number, content: string) => {
    const newUnits = [...units];
    newUnits[unitIndex].lessons[lessonIndex].realParagraphs[paragraphIndex].content = content;
    setUnits(newUnits);
  };

  const removeParagraph = (unitIndex: number, lessonIndex: number, paragraphIndex: number) => {
    const newUnits = [...units];
    newUnits[unitIndex].lessons[lessonIndex].realParagraphs = 
      newUnits[unitIndex].lessons[lessonIndex].realParagraphs.filter((_, i) => i !== paragraphIndex);
    setUnits(newUnits);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-bold text-sm transition-all shadow-lg"
      >
        + Add New Book
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Create New Book</h2>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form 
              action={async (formData) => {
                const bookData = {
                  subject: formData.get("subject") as string,
                  grade: parseInt(formData.get("grade") as string),
                  imgUrl: formData.get("imgUrl") as string || "/images/default.jpg",
                  units: units.filter(unit => unit.title.trim() !== "")
                };
                await createBook(bookData);
                setIsOpen(false);
                setUnits([]);
              }} 
              className="p-6 space-y-6"
            >
              {/* Book Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Book Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs uppercase text-slate-400 mb-1 font-semibold">Subject Name</label>
                    <input name="subject" required className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-blue-500" placeholder="e.g. Biology" />
                  </div>
                  <div>
                    <label className="block text-xs uppercase text-slate-400 mb-1 font-semibold">Grade Level</label>
                    <input name="grade" type="number" required className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-blue-500" placeholder="10" />
                  </div>
                  <div>
                    <label className="block text-xs uppercase text-slate-400 mb-1 font-semibold">Cover Image URL</label>
                    <input name="imgUrl" required className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-blue-500" placeholder="/images/biology.jpg" />
                  </div>
                </div>
              </div>

              {/* Units Section */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-white">Units</h3>
                  <button type="button" onClick={addUnit} className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-sm">+ Add Unit</button>
                </div>
                
                {units.map((unit, unitIndex) => (
                  <div key={unitIndex} className="bg-slate-900 p-4 rounded-lg border border-slate-700">
                    <div className="flex justify-between items-center mb-3">
                      <input
                        value={unit.title}
                        onChange={(e) => updateUnit(unitIndex, e.target.value)}
                        placeholder="Unit Title"
                        required
                        className="flex-1 bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white outline-none focus:border-blue-500 mr-2"
                      />
                      <button type="button" onClick={() => removeUnit(unitIndex)} className="text-red-400 hover:text-red-300">Remove</button>
                    </div>

                    {/* Lessons for this unit */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <h4 className="text-sm font-semibold text-slate-300">Lessons</h4>
                        <button type="button" onClick={() => addLesson(unitIndex)} className="bg-green-600 hover:bg-green-500 text-white px-2 py-1 rounded text-xs">+ Add Lesson</button>
                      </div>
                      
                      {unit.lessons.map((lesson, lessonIndex) => (
                        <div key={lessonIndex} className="bg-slate-800 p-3 rounded border border-slate-600">
                          <div className="flex justify-between items-center mb-2">
                            <input
                              value={lesson.title}
                              onChange={(e) => updateLesson(unitIndex, lessonIndex, e.target.value)}
                              placeholder="Lesson Title"
                              required
                              className="flex-1 bg-slate-700 border border-slate-500 rounded px-2 py-1 text-white outline-none focus:border-blue-500 mr-2 text-sm"
                            />
                            <button type="button" onClick={() => removeLesson(unitIndex, lessonIndex)} className="text-red-400 hover:text-red-300 text-sm">Remove</button>
                          </div>

                          {/* Paragraphs for this lesson */}
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <h5 className="text-xs font-semibold text-slate-400">Paragraphs</h5>
                              <button type="button" onClick={() => addParagraph(unitIndex, lessonIndex)} className="bg-purple-600 hover:bg-purple-500 text-white px-2 py-1 rounded text-xs">+ Add Paragraph</button>
                            </div>
                            
                            {lesson.realParagraphs.map((paragraph, paragraphIndex) => (
                              <div key={paragraphIndex} className="flex gap-2">
                                <textarea
                                  value={paragraph.content}
                                  onChange={(e) => updateParagraph(unitIndex, lessonIndex, paragraphIndex, e.target.value)}
                                  placeholder="Paragraph content..."
                                  required
                                  className="flex-1 bg-slate-700 border border-slate-500 rounded px-2 py-1 text-white outline-none focus:border-blue-500 text-sm "
                                />
                                <button type="button" onClick={() => removeParagraph(unitIndex, lessonIndex, paragraphIndex)} className="text-red-400 hover:text-red-300 text-xs self-start">×</button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setIsOpen(false)} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg font-semibold">Cancel</button>
                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg font-semibold">Save Book</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}