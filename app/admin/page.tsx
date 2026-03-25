import { getAllBooks } from "@/lib/service";
import { deleteBook } from "@/app/actions/book"; // You'll need to create this simple action
import AddBookModal from "@/components/admin/AddBookModal";
import Link from "next/link";

export default async function AdminPage() {
  const books = await getAllBooks();

  return (
    <div className="p-10 text-white bg-[#0f172a] min-h-screen">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-blue-400">Curriculum Manager</h1>
          <p className="text-slate-400 text-sm">Manage textbooks and AI content nodes.</p>
        </div>
        {/* Our Popup Component */}
        <AddBookModal />
      </header>

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-900/50 border-b border-slate-700">
            <tr>
              <th className="p-4 text-xs font-semibold text-slate-400 uppercase">Book Details</th>
              <th className="p-4 text-xs font-semibold text-slate-400 uppercase text-center">Grade</th>
              <th className="p-4 text-xs font-semibold text-slate-400 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {books.map((book) => (
              <tr key={book.id} className="hover:bg-slate-700/30 transition-colors">
                <td className="p-4">
                  <div className="font-bold text-slate-200">{book.subject}</div>
                  <div className="text-xs text-slate-500 font-mono">{book.id}</div>
                </td>
                <td className="p-4 text-center">
                  <span className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-xs border border-blue-500/20">
                    Grade {book.grade}
                  </span>
                </td>
                <td className="p-4 flex justify-end gap-3">
                  <Link 
                    href={`/admin/book/${book.id}`}
                    className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm transition-all"
                  >
                    Edit Units
                  </Link>
                  
                  {/* Delete Action */}
                  <form action={async () => { "use server"; await deleteBook(book.id); }}>
                    <button className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-4 py-2 rounded-lg text-sm transition-all border border-red-500/20">
                      Delete
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}