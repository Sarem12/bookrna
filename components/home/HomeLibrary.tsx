"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { BookCard } from "@/components/BookCard";

type HomeLibraryBook = {
  id: string;
  subject: string;
  grade: number;
  imgUrl: string;
};

type HomeLibraryProps = {
  books: HomeLibraryBook[];
};

export function HomeLibrary({ books }: HomeLibraryProps) {
  const [selectedGrades, setSelectedGrades] = useState<string[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [gradeMenuOpen, setGradeMenuOpen] = useState(false);
  const [subjectMenuOpen, setSubjectMenuOpen] = useState(false);
  const gradeMenuRef = useRef<HTMLDivElement | null>(null);
  const subjectMenuRef = useRef<HTMLDivElement | null>(null);

  const gradeOptions = useMemo(() => {
    return [...new Set(books.map((book) => `Grade ${book.grade}`))].sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true })
    );
  }, [books]);

  const subjectOptions = useMemo(() => {
    return [...new Set(books.map((book) => book.subject))].sort((a, b) => a.localeCompare(b));
  }, [books]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (gradeMenuRef.current && !gradeMenuRef.current.contains(event.target as Node)) {
        setGradeMenuOpen(false);
      }

      if (subjectMenuRef.current && !subjectMenuRef.current.contains(event.target as Node)) {
        setSubjectMenuOpen(false);
      }
    };

    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      const gradeLabel = `Grade ${book.grade}`;
      const matchesGrade =
        selectedGrades.length === 0 || selectedGrades.includes(gradeLabel);
      const matchesSubject =
        selectedSubjects.length === 0 || selectedSubjects.includes(book.subject);

      return matchesGrade && matchesSubject;
    });
  }, [books, selectedGrades, selectedSubjects]);

  const toggleValue = (
    value: string,
    selectedValues: string[],
    setSelectedValues: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setSelectedValues((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value]
    );
  };

  const renderSummary = (selectedValues: string[], emptyLabel: string) => {
    if (selectedValues.length === 0) return emptyLabel;
    if (selectedValues.length === 1) return selectedValues[0];
    return `${selectedValues.length} selected`;
  };

  const MenuButton = ({
    summary,
    open,
    onClick
  }: {
    summary: string;
    open: boolean;
    onClick: () => void;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex min-w-[180px] items-center justify-between rounded-xl border px-3.5 py-2.5 text-left transition ${
        open
          ? "border-[var(--border-strong)] bg-[color-mix(in_srgb,var(--surface-elevated)_72%,transparent)]"
          : "border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_45%,transparent)] hover:bg-[color-mix(in_srgb,var(--surface-elevated)_60%,transparent)]"
      }`}
    >
      <span className="text-sm font-medium text-[var(--foreground)]">{summary}</span>
      <ChevronDown
        className={`h-4 w-4 text-[var(--muted)] transition ${open ? "rotate-180" : ""}`}
      />
    </button>
  );

  const CheckboxOption = ({
    label,
    checked,
    onClick
  }: {
    label: string;
    checked: boolean;
    onClick: () => void;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition hover:bg-[var(--surface-elevated)]"
    >
      <span
        className={`flex h-4 w-4 items-center justify-center rounded-[5px] border transition ${
          checked
            ? "border-[var(--button-bg)] bg-[var(--button-bg)]"
            : "border-[var(--border-strong)] bg-transparent"
        }`}
      >
        <span
          className={`h-1.5 w-1.5 rounded-full bg-[var(--button-fg)] transition ${
            checked ? "opacity-100" : "opacity-0"
          }`}
        />
      </span>
      <span className={checked ? "text-[var(--foreground)]" : "text-[var(--muted)]"}>
        {label}
      </span>
    </button>
  );

  return (
    <div className="space-y-4">
      <section className="rounded-[20px]  bg-transparent px-1 py-1">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-start gap-2.5">
            <div className="relative" ref={gradeMenuRef}>
              <MenuButton
                summary={renderSummary(selectedGrades, "Grades")}
                open={gradeMenuOpen}
                onClick={() => {
                  setGradeMenuOpen((current) => !current);
                  setSubjectMenuOpen(false);
                }}
              />

              {gradeMenuOpen && (
                <div className="absolute left-0 top-[calc(100%+0.45rem)] z-20 w-[240px] rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-2 shadow-xl">
                  {gradeOptions.map((grade) => (
                    <CheckboxOption
                      key={grade}
                      label={grade}
                      checked={selectedGrades.includes(grade)}
                      onClick={() => toggleValue(grade, selectedGrades, setSelectedGrades)}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="relative" ref={subjectMenuRef}>
              <MenuButton
                summary={renderSummary(selectedSubjects, "Subjects")}
                open={subjectMenuOpen}
                onClick={() => {
                  setSubjectMenuOpen((current) => !current);
                  setGradeMenuOpen(false);
                }}
              />

              {subjectMenuOpen && (
                <div className="absolute left-0 top-[calc(100%+0.45rem)] z-20 w-[240px] rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-2 shadow-xl">
                  {subjectOptions.map((subject) => (
                    <CheckboxOption
                      key={subject}
                      label={subject}
                      checked={selectedSubjects.includes(subject)}
                      onClick={() => toggleValue(subject, selectedSubjects, setSelectedSubjects)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {(selectedGrades.length > 0 || selectedSubjects.length > 0) && (
            <div className="flex flex-wrap gap-2">
              {selectedGrades.map((grade) => (
                <button
                  key={grade}
                  type="button"
                  onClick={() => toggleValue(grade, selectedGrades, setSelectedGrades)}
                  className="rounded-full border border-[var(--border)] bg-[color-mix(in_srgb,var(--surface-elevated)_72%,transparent)] px-3 py-1 text-xs text-[var(--foreground)] transition hover:border-[var(--border-strong)]"
                >
                  {grade}
                </button>
              ))}

              {selectedSubjects.map((subject) => (
                <button
                  key={subject}
                  type="button"
                  onClick={() => toggleValue(subject, selectedSubjects, setSelectedSubjects)}
                  className="rounded-full border border-[var(--border)] bg-[color-mix(in_srgb,var(--surface-elevated)_72%,transparent)] px-3 py-1 text-xs text-[var(--foreground)] transition hover:border-[var(--border-strong)]"
                >
                  {subject}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="grid grid-cols-[repeat(auto-fill,minmax(320px,360px))] justify-start gap-5">
        {filteredBooks.map((book) => (
          <BookCard
            key={book.id}
            subject={book.subject}
            grade={book.grade}
            imageUrl={book.imgUrl || ""}
            title={`${book.subject} - Grade ${book.grade}`}
            id={book.id}
          />
        ))}
      </section>
    </div>
  );
}
