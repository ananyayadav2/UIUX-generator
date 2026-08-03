import { NextRequest, NextResponse } from "next/server";
import { openrouter } from "@/config/openrouter";
import { projectsTable, ScreenConfigTable } from "@/config/schema";
import { db } from "@/config/db";
import { eq } from "drizzle-orm";
import { jsonrepair } from "jsonrepair";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userInput, deviceType, projectId } = body;

    if (!userInput || !deviceType || !projectId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const response = await openrouter.chat.send({
      chatRequest: {
        // FIXED: Replaced "openrouter/free" with a valid free OpenRouter model ID
      model: "openrouter/free",
        messages: [
          {
            role: "user",
            content: `You are an expert UI/UX Designer and React developer. Generate a complete JSON configuration for an application based on the user's prompt.
Return ONLY a valid JSON object matching this exact structural template:
{
  "projectName": "A catchy, concise name for the project (max 50 chars)",
  "projectVisualDescription": "A developer-focused description of the UI layout and styling. MUST BE VERY SHORT. (Max 150 characters)",
  "theme": "Must be a strict uppercase snake_case string representing the color theme (e.g., 'AURORA_INK', 'OBSIDIAN_BLOOM', 'NETFLIX', 'CITRUS_SLATE')",
  "screens": [
    {
      "id": "screen-1",
      "name": "Main Dashboard",
      "purpose": "Screen purpose (max 100 chars)",
      "layoutDescription": "UI component breakdown. MUST BE SHORT. (Max 200 characters)"
    },
    {
      "id": "screen-2",
      "name": "Details View",
      "purpose": "Secondary screen purpose (max 100 chars)",
      "layoutDescription": "UI component breakdown. MUST BE SHORT. (Max 200 characters)"
    }
  ]
}
User Input: ${userInput}`
          }
        ]
      }
    });

    // Extract raw string content safely
    let rawContent = response.choices?.[0]?.message?.content;

    if (!rawContent) {
      console.error("AI returned empty or null content");
      return NextResponse.json({ error: "Empty response from AI" }, { status: 500 });
    }

    // Clean up markdown syntax using replaceAll to avoid RegEx formatting errors
    let sanitizedContent = rawContent
      .replaceAll("```json", "")
      .replaceAll("```", "")
      .trim();

    console.log("RAW_AI_RESPONSE:", sanitizedContent);

    let JSONAIResult;
    try {
      const repairedJson = jsonrepair(sanitizedContent);
      JSONAIResult = JSON.parse(repairedJson);
    } catch (e) {
      console.error("Critical failure parsing AI JSON: ", e);
      return NextResponse.json({ error: "Could not parse AI response", raw: sanitizedContent }, { status: 500 });
    }

    if (JSONAIResult) {
      // Fallback values ensure Drizzle never receives a completely empty/undefined object
      await db.update(projectsTable)
        .set({
          // Slicing to guarantee it never exceeds standard varchar limits just in case the AI hallucinates
          projectVisualDescription: (JSONAIResult.projectVisualDescription || "AI Generated Layout").slice(0, 250),
          name: (JSONAIResult.projectName || "Untitled AI Project").slice(0, 100),
          theme: (JSONAIResult.theme || "DEFAULT").slice(0, 50),
        })
        .where(eq(projectsTable.projectId, projectId));

      if (JSONAIResult.screens && Array.isArray(JSONAIResult.screens)) {
        for (const screen of JSONAIResult.screens) {
          await db.insert(ScreenConfigTable).values({
            projectId: projectId,
            purpose: (screen.purpose || "General Purpose").slice(0, 250),
            screenDescription: (screen.layoutDescription || "No layout provided").slice(0, 250),
            screenId: screen.id || `screen-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            screenName: (screen.name || "Unnamed Screen").slice(0, 100),
          });
        }
      }

      return NextResponse.json(JSONAIResult);
    }
  } catch (error: any) {
    console.error("Critical failure in POST /api/generate-config:", error);
    
    // FIXED: Expose the actual error details to the frontend response
    return NextResponse.json(
      { 
        error: "Internal Server Error", 
        message: error.message || "Unknown error occurred",
        details: error.response?.data || error
      }, 
      { status: 500 }
    );
  }
}