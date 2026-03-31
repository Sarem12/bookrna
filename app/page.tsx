import { cookies } from "next/headers";
import { HomeLibrary } from "@/components/home/HomeLibrary";
import { getAllBooks, getUserById } from "@/lib/service";

export default async function Home() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("session_token")?.value;
  const user = userId ? await getUserById(userId) : null;
  const books = await getAllBooks();

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[var(--background)]">
      <main className="w-full px-3 py-5 sm:px-5 sm:py-6 lg:px-6 lg:py-7">
        <section className="mb-6 space-y-2">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-[var(--muted)]">
            Welcome
          </p>
          <h2 className="font-brand text-3xl tracking-tight text-[var(--foreground)]">
            {user ? `${user.first} ${user.last}` : "Your library"}
          </h2>
          <p className="max-w-3xl text-sm leading-6 text-[var(--muted)]">
            Pick a grade, narrow by subject, and continue reading from the books that matter right now.
          </p>
        </section>

        <HomeLibrary books={books} />
      </main>
    </div>
  );
}
