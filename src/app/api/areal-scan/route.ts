import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

/* ══════════════════════════════════════════════════════════
   LIXUM AREAL SCAN API
   POST /api/areal-scan
   - Receives 10-12 JPEG frames (base64) captured during 3D rotation
   - Uploads each frame to Supabase Storage bucket "areal-scans"
   - Returns the storage paths for downstream AI processing
   ══════════════════════════════════════════════════════════ */

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();

    /* Auth check */
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json() as { frames: string[]; coverage: number };
    const { frames, coverage } = body;

    if (!frames || !Array.isArray(frames) || frames.length === 0) {
      return NextResponse.json({ error: "No frames provided" }, { status: 400 });
    }

    const timestamp = Date.now();
    const scanId    = `${timestamp}`;
    const paths: string[] = [];

    /* Upload each frame to Supabase Storage */
    for (let i = 0; i < frames.length; i++) {
      const frame   = frames[i];
      const base64  = frame.replace(/^data:image\/\w+;base64,/, "");
      const buffer  = Buffer.from(base64, "base64");
      const path    = `${user.id}/${scanId}/frame-${String(i).padStart(2, "0")}.jpg`;

      const { error } = await supabase.storage
        .from("areal-scans")
        .upload(path, buffer, { contentType: "image/jpeg", upsert: true });

      if (!error) {
        paths.push(path);
      }
      /* Continue even if one frame fails */
    }

    /* Record the scan session in scan_history */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("scan_history").insert({
      user_id:       user.id,
      detected_dish: `Areal Scan 3D — ${paths.length} frames`,
      estimated_calories: 0,         /* filled in after AI processing */
      estimated_weight:   0,
      confidence_score:   coverage / 100,
    });

    return NextResponse.json({ paths, scanId, framesUploaded: paths.length, coverage });
  } catch (err) {
    console.error("[areal-scan]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
