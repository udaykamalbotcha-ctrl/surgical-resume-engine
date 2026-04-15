"use server";

import pdf from "pdf-parse";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function parseResume(
  formData: FormData
): Promise<{ success: true; text: string } | { success: false; error: string }> {
  try {
    const file = formData.get("resume") as File | null;

    if (!file) {
      return { success: false, error: "No file provided." };
    }

    if (file.type !== "application/pdf") {
      return { success: false, error: "Only PDF files are supported." };
    }

    if (file.size > MAX_FILE_SIZE) {
      return { success: false, error: "File size must be under 10MB." };
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Requires node-native Buffer, bypasses fake worker errors in 1.1.1
    const result = await pdf(buffer);
    const text = result.text?.trim();

    if (!text || text.length === 0) {
      return { success: false, error: "Could not extract text from this PDF. It may be image-based." };
    }

    return { success: true, text };
  } catch (error) {
    console.error("Resume parse error:", error);
    return { success: false, error: "Failed to parse the PDF. Please try again." };
  }
}
