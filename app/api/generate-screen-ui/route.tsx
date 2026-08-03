import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { ScreenConfigTable } from "@/config/schema";
import { and, eq } from "drizzle-orm";

function buildFallbackScreenHtml(screenName?: string, purpose?: string, screenDescription?: string) {
  const title = screenName || "Screen Preview";
  const subtitle = purpose || "A polished screen preview";
  const details = screenDescription || "This preview is generated to keep the canvas populated while the AI is producing a richer layout.";

  return `
    <div class="min-h-screen bg-slate-950 p-6 text-slate-100">
      <div class="mx-auto flex max-w-6xl flex-col gap-6 rounded-3xl border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">${title}</p>
            <h1 class="mt-2 text-3xl font-semibold">${subtitle}</h1>
          </div>
          <button class="rounded-full bg-cyan-500 px-4 py-2 text-sm font-medium text-slate-950">Action</button>
        </div>

        <div class="grid gap-4 lg:grid-cols-[2fr_1fr]">
          <div class="rounded-2xl border border-white/10 bg-slate-900/80 p-5">
            <p class="text-sm text-slate-400">Overview</p>
            <p class="mt-3 text-lg leading-7 text-slate-200">${details}</p>
            <div class="mt-6 grid gap-3 sm:grid-cols-3">
              <div class="rounded-xl bg-slate-800 p-3">
                <p class="text-xs uppercase tracking-[0.3em] text-slate-500">Metric</p>
                <p class="mt-2 text-xl font-semibold">84%</p>
              </div>
              <div class="rounded-xl bg-slate-800 p-3">
                <p class="text-xs uppercase tracking-[0.3em] text-slate-500">Trend</p>
                <p class="mt-2 text-xl font-semibold">+12%</p>
              </div>
              <div class="rounded-xl bg-slate-800 p-3">
                <p class="text-xs uppercase tracking-[0.3em] text-slate-500">Status</p>
                <p class="mt-2 text-xl font-semibold">Healthy</p>
              </div>
            </div>
          </div>

          <div class="rounded-2xl border border-white/10 bg-slate-900/80 p-5">
            <p class="text-sm text-slate-400">Highlights</p>
            <div class="mt-4 space-y-3">
              <div class="rounded-xl border border-white/10 bg-white/5 p-3">Responsive layout</div>
              <div class="rounded-xl border border-white/10 bg-white/5 p-3">Tailwind styling</div>
              <div class="rounded-xl border border-white/10 bg-white/5 p-3">Ready for refinement</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export async function POST(req: NextRequest) {
  try {
    const { projectId, screenId, userInput, oldCode, screenName, purpose, screenDescription } = await req.json();

    if (!projectId || !screenId) {
      return NextResponse.json({ error: "Missing projectId or screenId" }, { status: 400 });
    }

    const prompt = `You are a Lead UI/UX Developer.
Create a polished single-screen HTML snippet for the requested UI.

Requirements:
- Return only the HTML snippet.
- Do not include markdown fences, commentary, or explanations.
- Use Tailwind CSS classes.
- Keep it modern, responsive, and self-contained.
- If imagery is needed, use https://placehold.co/600x400/2f2f2f/ffffff?text=Image.
- Preserve the overall style and layout intent.

Screen name: ${screenName || "Untitled Screen"}
Purpose: ${purpose || "Provide a polished UI"}
Description: ${screenDescription || "Create a clear and attractive screen layout"}
User request: ${userInput || "Generate a complete UI for this screen"}
Current code:
${oldCode || ""}`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "UIUX Mockup Generator"
      },
      body: JSON.stringify({
        model: "openrouter/free",
        messages: [{ role: "user", content: prompt }]
      })
    });

    const aiData = await response.json();

    if (aiData.error) {
      console.error("🚨 OPENROUTER API ERROR:", aiData.error);
      return NextResponse.json({ error: aiData.error.message || "AI Provider Error" }, { status: 500 });
    }

    if (!aiData.choices || aiData.choices.length === 0) {
      console.error("🚨 UNEXPECTED AI RESPONSE:", aiData);
      return NextResponse.json({ error: "Invalid response from AI provider." }, { status: 500 });
    }

    const rawContent = aiData?.choices?.[0]?.message?.content;
    let newCode = typeof rawContent === "string" ? rawContent : "";
    newCode = String(newCode ?? "")
      .replace(/```html/g, "")
      .replace(/```/g, "")
      .trim();

    const looksLikePlaceholder = !newCode || /undefined|i notice|old code|requested changes|provide both|python/i.test(newCode);
    if (looksLikePlaceholder) {
      newCode = buildFallbackScreenHtml(screenName, purpose, screenDescription);
    }

    const result = await db.update(ScreenConfigTable)
      .set({ code: newCode })
      .where(
        and(
          eq(ScreenConfigTable.projectId, projectId),
          eq(ScreenConfigTable.screenId, screenId)
        )
      )
      .returning();

    return NextResponse.json({ success: true, code: newCode, result });
  } catch (error) {
    console.error("Error editing screen:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}