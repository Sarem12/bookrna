import { BookCard } from "@/components/BookCard";
import { getAllBooks } from "@/lib/service";

export default async function Home() {
  const books = await getAllBooks();

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[var(--background)]">
      <main className="w-full px-2 py-4 sm:px-4 sm:py-5 lg:px-5 lg:py-6">
        <section className="grid grid-cols-[repeat(auto-fill,minmax(320px,360px))] justify-start gap-5">
          {books.map((book) => (
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
      </main>
    </div>
  );
}
