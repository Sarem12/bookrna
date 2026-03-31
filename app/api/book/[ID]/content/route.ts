import { NextResponse } from "next/server";
import { getBookContentPage } from "@/lib/service/book.service";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ ID: string }> }
) {
  const { ID } = await params;
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const rawCursor = searchParams.get("cursor");
  const cursor = rawCursor ? Number(rawCursor) : null;
  const limit = Number(searchParams.get("limit") ?? "1");

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  const result = await getBookContentPage(ID, userId, cursor, limit);

  if (!result) {
    return NextResponse.json({ error: "Book not found" }, { status: 404 });
  }

  return NextResponse.json(result);
}
