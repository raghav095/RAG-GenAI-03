import { NextRequest, NextResponse } from "next/server";
import { indexDocument } from "@/lib/rag";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as Blob;
    const fileName = formData.get("fileName") as string;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    console.log(`[API Upload] Received file: ${fileName}, Size: ${file.size} bytes`);

    const result = await indexDocument(file, fileName);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Upload API Error:", error);
    return NextResponse.json(
      { error: error.message || "Unknown error occurred during upload" },
      { status: 500 }
    );
  }
}

