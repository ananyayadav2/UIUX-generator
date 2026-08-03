import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { ScreenConfigTable } from "@/config/schema";
import { and, eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const { projectId, screenId, userInput, oldCode } = await req.json();

    // 1. The Edit Prompt (Exactly as the video does it, but with our strict image rule added)
    const prompt = `You are a Lead UI/UX Developer.
    Make changes in this code keeping the overall design and style the same. Do not change the core layout unless requested. 
    Make user requested changes: ${userInput}
    
    CRITICAL IMAGE RULE: Never use external image domains like images.unsplash.com or pravatar.cc. For EVERY <img> tag, you must strictly use 'https://placehold.co/600x400/2f2f2f/ffffff?text=Image' or base64 SVG data URIs. Failure to do so will break the application.
    
    Old code: 
    ${oldCode}`;

    // 2. Call the AI Model via OpenRouter (Matches the tutorial's logic)
    // NOTE: If you used a different method to call the AI in your 'generate-screen' route, 
    // you can swap this fetch block with that exact same logic.
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro", // You can change this to whatever model you are using
        messages: [{ role: "user", content: prompt }]
      })
    });

    const aiData = await response.json();
    let newCode = aiData.choices[0].message.content;

    // AI sometimes wraps the response in ```html markdown blocks. This cleans it up.
    newCode = newCode.replace(/```html/g, '').replace(/```/g, '');

    // 3. Update the existing screen in the Neon PostgreSQL Database
    const result = await db.update(ScreenConfigTable)
      .set({ code: newCode })
      .where(
        and(
          eq(ScreenConfigTable.projectId, projectId),
          eq(ScreenConfigTable.screenId, screenId)
        )
      )
      .returning();

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Error editing screen:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}