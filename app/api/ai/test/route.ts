import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST() {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents:
        "Say hello to Quizzzer and explain in one short sentence what you can do.",
    });

    return NextResponse.json({
      success: true,
      message: response.text,
    });
  } catch (error) {
    console.error("Gemini error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Gemini request failed.",
      },
      { status: 500 }
    );
  }
}