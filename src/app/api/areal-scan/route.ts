import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createServerClient } from "@/lib/supabase-server";

/* ══════════════════════════════════════════════════════════
   LIXUM AREAL SCAN API  v2
   POST /api/areal-scan
   1. Upload frames to Supabase Storage
   2. Analyse the best frame with Claude Haiku (vision)
   3. Return storage paths + AI dish identification
   ══════════════════════════════════════════════════════════ */

export const runtime    = "nodejs";
export const maxDuration = 45;

interface AiIngredient {
  name: string;
  weight: number;
  confidence: number;
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerClient();

    /* Auth */
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json() as { frames: string[]; coverage: number };
    const { frames, coverage } = body;

    if (!frames || !Array.isArray(frames) || frames.length === 0) {
      return NextResponse.json({ error: "No frames provided" }, { status: 400 });
    }

    const timestamp = Date.now();
    const scanId    = `${timestamp}`;
    const paths: string[] = [];

    /* ── 1. Upload frames to Supabase Storage ── */
    for (let i = 0; i < frames.length; i++) {
      const base64 = frames[i].replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64, "base64");
      const path   = `${user.id}/${scanId}/frame-${String(i).padStart(2, "0")}.jpg`;

      const { error } = await supabase.storage
        .from("areal-scans")
        .upload(path, buffer, { contentType: "image/jpeg", upsert: true });

      if (!error) paths.push(path);
    }

    /* ── 2. Claude Haiku vision on the middle frame ── */
    let dish_name: string | null      = null;
    let dish_confidence               = 0;
    let ai_ingredients: AiIngredient[] = [];

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (apiKey && frames.length > 0) {
      try {
        const client     = new Anthropic({ apiKey });
        const bestFrame  = frames[Math.floor(frames.length / 2)];
        const frameB64   = bestFrame.replace(/^data:image\/\w+;base64,/, "");

        const msg = await client.messages.create({
          model:      "claude-haiku-4-5-20251001",
          max_tokens: 450,
          messages: [{
            role: "user",
            content: [
              {
                type: "image",
                source: { type: "base64", media_type: "image/jpeg", data: frameB64 },
              },
              {
                type: "text",
                text: `Tu es AfriCalo Vision, spécialiste cuisine africaine. JSON strict uniquement.
Identifie le plat et les ingrédients visibles.
Format: {"dish_name":"nom ou null","confidence":0-100,"ingredients":[{"name":"","weight":0,"confidence":0}]}
Règles:
- dish_name null si confidence < 55
- max 8 ingrédients visibles
- weight en grammes estimés
- Aucun texte hors JSON`,
              },
            ],
          }],
        });

        const text = msg.content[0]?.type === "text" ? msg.content[0].text.trim() : "";

        /* Strip markdown fences if present */
        const mdMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
        const jsonText = mdMatch ? mdMatch[1].trim() : text;
        const start = jsonText.indexOf("{"), end = jsonText.lastIndexOf("}");
        const parsed = JSON.parse(start !== -1 && end !== -1 ? jsonText.slice(start, end + 1) : jsonText);

        const rawConf = Math.min(100, Math.max(0, Number(parsed.confidence) || 0));
        dish_name       = rawConf >= 55 && typeof parsed.dish_name === "string" ? parsed.dish_name.trim() : null;
        dish_confidence = rawConf;
        ai_ingredients  = Array.isArray(parsed.ingredients)
          ? (parsed.ingredients as Record<string, unknown>[]).slice(0, 8).map(i => ({
              name:       String(i.name || "inconnu").trim(),
              weight:     Math.max(5, Math.round(Number(i.weight) || 30)),
              confidence: Math.min(100, Math.max(0, Math.round(Number(i.confidence) || 50))),
            }))
          : [];
      } catch (aiErr) {
        console.warn("[areal-scan] Claude Haiku failed:", aiErr);
        /* Non-fatal — return without AI result */
      }
    }

    /* ── 3. Record scan session ── */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("scan_history").insert({
      user_id:            user.id,
      detected_dish:      dish_name ?? `Areal Scan 3D — ${paths.length} frames`,
      estimated_calories: 0,
      estimated_weight:   0,
      confidence_score:   dish_confidence / 100,
    });

    return NextResponse.json({
      paths,
      scanId,
      framesUploaded: paths.length,
      coverage,
      dish_name,
      dish_confidence,
      ai_ingredients,
    });
  } catch (err) {
    console.error("[areal-scan]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 },
    );
  }
}
