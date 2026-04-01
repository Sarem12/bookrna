import { NextResponse } from "next/server";
import { getBookUnitNavigation } from "@/lib/service/book.service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ ID: string }> }
) {
  const { ID } = await params;
  const units = await getBookUnitNavigation(ID);

  return NextResponse.json({ units });
}
