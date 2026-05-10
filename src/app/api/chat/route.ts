import { NextRequest, NextResponse } from "next/server";
import { queryDocument } from "@/lib/rag";

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "No message provided" }, { status: 400 });
    }

    const result = await queryDocument(message);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Chat error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
