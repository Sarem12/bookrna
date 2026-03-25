import { getAllBooks, getUserById } from "@/lib/service";
import { BookCard } from "@/components/BookCard";
import { cookies } from "next/headers";
import { Header } from "@/components/Header";
import { redirect } from "next/navigation";

export default async function Home() {
  try {
    const cookieStore = await cookies();
    const userid = cookieStore.get("bekam_user_id")?.value;

    if (!userid) {
      redirect("/login");
    }

    const [books, user] = await Promise.all([
      getAllBooks(),
      getUserById(userid)
    ]);

    // TYPE FIX: Guard clause ensures user is not null
    if (!user) {
      return (
        <div className="p-10 text-white bg-slate-900 min-h-screen">
          Profile not found. Please <a href="/login" className="underline">log in again</a>.
        </div>
      );
    }

    return (
      <div className="bg-slate-900 min-h-screen">
        <Header user={user} />
        
        <main className="p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Your Textbooks</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((book) => (
              <BookCard
                key={book.id}
                subject={book.subject}
                grade={book.grade}
                imageUrl={book.imgUrl || "/placeholder-book.jpg"}
                title={`${book.subject} - Grade ${book.grade}`}
              />
            ))}
          </div>
        </main>
      </div>
    );
  } catch (e: any) {
    return <div className="p-10 text-red-500 font-mono">BOOT_ERROR: {e.message}</div>;
  }
}