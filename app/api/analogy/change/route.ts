import { NextResponse } from "next/server";
import { ChangeAnalogy } from "@/lib/service/content/analogy.service";

export async function POST(request: Request) {
  try {
    const { userId, defaultAnalogyId } = await request.json();
    if (!userId || !defaultAnalogyId) {
      return NextResponse.json({ error: "Missing userId or defaultAnalogyId" }, { status: 400 });
    }

    const result = await ChangeAnalogy(defaultAnalogyId, userId);
    if ((result as any).error) {
      return NextResponse.json({ error: (result as any).error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("POST /api/analogy/change failed", error);
    return NextResponse.json({ error: "Unable to regenerate analogy right now." }, { status: 500 });
  }
}
