"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { checkScanLimit, incrementScanCount } from "@/utils/scan-limits";
import { updateDailySummary } from "@/utils/daily-summary";
import { compressImageForScan, generateImageHash } from "@/utils/image-compression";
import { scanFood } from "@/lib/vision-pipeline";
import ScanAnimation from "@/components/scan/ScanAnimation";
import ScanResultCard from "@/components/scan/ScanResult";
import CorrectionForm from "@/components/scan/CorrectionForm";
import type { VisionDetectionResult, ScanPipelineResult } from "@/types/vision-pipeline";

type ScanStep = "idle" | "preview" | "scanning" | "result" | "correction" | "limit";

function guessMealType(): "breakfast" | "lunch" | "dinner" | "snack" {
  const hour = new Date().getHours();
  if (hour < 10) return "breakfast";
  if (hour < 15) return "lunch";
  if (hour < 21) return "dinner";
  return "snack";
}

interface HomeScanWidgetProps {
  userId: string;
  locale: "fr" | "en";
  onMealAdded?: () => void;
}

export default function HomeScanWidget({
  userId,
  locale,
  onMealAdded,
}: HomeScanWidgetProps) {
  const router = useRouter();
  const supabase = createClient();
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<ScanStep>("idle");
  const [imagePreview, setImagePreview] = useState("");
  const [imageBase64, setImageBase64] = useState("");
  const [imageHash, setImageHash] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState("image/jpeg");
  const [pipelineResult, setPipelineResult] = useState<ScanPipelineResult | null>(null);
  const [scanId, setScanId] = useState("");
  const [scansUsed, setScansUsed] = useState(0);
  const [scansRemaining, setScansRemaining] = useState(3);
  const [error, setError] = useState("");

  const loadLimits = useCallback(async () => {
    if (!userId) return;
    const limits = await checkScanLimit(supabase, userId);
    setScansUsed(limits.scansUsed);
    setScansRemaining(limits.scansRemaining);
    if (!limits.canScan) {
      setStep("limit");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    loadLimits();
  }, [loadLimits]);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);

    try {
      const compressed = await compressImageForScan(file, {
        maxSize: 1024,
        quality: 0.75,
      });
      setImageBase64(compressed.base64);
      setMimeType(compressed.mimeType);
      setStep("preview");

      // Generate image hash for learning system (async, non-blocking)
      generateImageHash(compressed.base64).then(setImageHash);
    } catch {
      setError(
        locale === "fr"
          ? "Impossible de traiter l'image. Reessayez."
          : "Could not process the image. Try again."
      );
    }
  }

  async function handleScan() {
    if (!imageBase64) return;

    setStep("scanning");
    setError("");

    try {
      // Phase 1: Call vision API
      const response = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64, mimeType }),
      });

      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        const text = await response.text();
        const statusMsg = `HTTP ${response.status}`;
        const bodyMsg = text.trim().slice(0, 150) || "corps vide";
        throw new Error(`Erreur serveur (${statusMsg}): ${bodyMsg}`);
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Erreur HTTP ${response.status}`);
      }

      const detectionResult: VisionDetectionResult = data;

      // Handle insufficient image quality
      if (detectionResult.image_quality === "insufficient") {
        throw new Error(
          locale === "fr"
            ? "Image de qualite insuffisante (floue, sombre ou coupee). Reprenez la photo avec un meilleur eclairage."
            : "Insufficient image quality (blurry, dark or cropped). Retake the photo with better lighting."
        );
      }

      // Phases 2-4: Run full pipeline
      const result = await scanFood(supabase, detectionResult);

      // Save to scan history
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: scan } = await (supabase as any)
        .from("scan_history")
        .insert({
          user_id: userId,
          detected_dish: result.detected_meal_name,
          estimated_calories: result.nutrition.total_kcal,
          estimated_weight: result.nutrition.total_weight,
          confidence_score: result.confidence_score,
        })
        .select("id")
        .single();

      if (scan?.id) setScanId(scan.id);

      await incrementScanCount(supabase, userId);

      setPipelineResult(result);
      setScansUsed((prev) => prev + 1);
      setScansRemaining((prev) => Math.max(0, prev - 1));
      setStep("result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors du scan");
      setStep("preview");
    }
  }

  async function handleAddMeal() {
    if (!pipelineResult) return;

    const { nutrition, detected_meal_name, ingredients } = pipelineResult;
    const today = new Date().toISOString().split("T")[0];
    const ingredientNames = ingredients.map((i) => i.original_detected_name).join(", ");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("meals").insert({
      user_id: userId,
      name: detected_meal_name,
      meal_type: guessMealType(),
      calories: Math.round(nutrition.total_kcal),
      protein: Math.round(nutrition.total_protein * 10) / 10,
      carbs: Math.round(nutrition.total_carbs * 10) / 10,
      fat: Math.round(nutrition.total_fat * 10) / 10,
      date: today,
      description: `Scan IA - ${ingredientNames}`,
    });

    await updateDailySummary(supabase, userId, today);
    handleReset();
    if (onMealAdded) onMealAdded();
    router.push(`/${locale}/meals`);
  }

  function handleCorrection(updatedResult: ScanPipelineResult) {
    setPipelineResult(updatedResult);
    setStep("result");
  }

  function handleReset() {
    setImagePreview("");
    setImageBase64("");
    setImageHash(null);
    setPipelineResult(null);
    setScanId("");
    setError("");
    setStep("idle");
    if (cameraInputRef.current) cameraInputRef.current.value = "";
    if (galleryInputRef.current) galleryInputRef.current.value = "";
  }

  function handleNewScan() {
    if (scansRemaining <= 0) {
      setStep("limit");
      return;
    }
    handleReset();
  }

  // Scan limit reached
  if (step === "limit") {
    return (
      <div className="card text-center py-8">
        <p className="text-2xl mb-2">&#x1F451;</p>
        <p className="text-sm font-semibold text-brand-brown-dark mb-1">
          {locale === "fr" ? "Limite de scans atteinte" : "Scan limit reached"}
        </p>
        <p className="text-xs text-brand-brown-pale">
          {locale === "fr"
            ? "3 scans gratuits par jour. Revenez demain !"
            : "3 free scans per day. Come back tomorrow!"}
        </p>
      </div>
    );
  }

  // Scanning animation
  if (step === "scanning" && imagePreview) {
    return <ScanAnimation imagePreview={imagePreview} />;
  }

  // Result
  if (step === "result" && pipelineResult) {
    return (
      <ScanResultCard
        result={pipelineResult}
        imagePreview={imagePreview}
        onCorrect={() => setStep("correction")}
        onAddMeal={handleAddMeal}
        onNewScan={handleNewScan}
      />
    );
  }

  // Correction form
  if (step === "correction" && pipelineResult) {
    return (
      <CorrectionForm
        scanId={scanId}
        userId={userId}
        imageHash={imageHash}
        result={pipelineResult}
        onCorrected={handleCorrection}
        onCancel={() => setStep("result")}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Error message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-500 text-sm">
          {error}
        </div>
      )}

      {/* Image preview */}
      {step === "preview" && imagePreview && (
        <div className="card space-y-4">
          <div className="relative rounded-2xl overflow-hidden border border-brand-brown-pale/30">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imagePreview}
              alt="Apercu"
              className="w-full aspect-video object-cover"
            />
            <button
              onClick={handleReset}
              className="absolute top-3 right-3 bg-white/80 text-brand-brown-dark rounded-full w-8 h-8 flex items-center justify-center text-sm backdrop-blur-sm"
            >
              &#x2715;
            </button>
          </div>
          <button
            onClick={handleScan}
            className="btn-primary w-full text-center flex items-center justify-center gap-2"
          >
            <span>&#x2728;</span>
            <span>
              {locale === "fr" ? "Analyser avec l'IA" : "Analyze with AI"}
            </span>
          </button>
        </div>
      )}

      {/* SCAN FOOD — Big central button (idle state) */}
      {step === "idle" && (
        <div className="flex flex-col items-center gap-4 py-2">
          {/* Scan counter */}
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i <= scansUsed ? "bg-brand-terracotta" : "bg-brand-cream-deeper"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-brand-brown-pale font-semibold">
              {scansRemaining === Infinity
                ? locale === "fr"
                  ? "Illimite"
                  : "Unlimited"
                : `${scansRemaining} ${locale === "fr" ? "restant" : "left"}${scansRemaining > 1 ? "s" : ""}`}
            </span>
          </div>

          {/* Big round SCAN button */}
          <label className="btn-scan w-40 h-40 flex flex-col items-center justify-center gap-2 cursor-pointer">
            <div className="btn-scan-ring" />
            <span className="text-4xl relative z-10">&#x1F4F7;</span>
            <span className="text-sm font-extrabold text-white relative z-10 uppercase tracking-wider">
              {locale === "fr" ? "Scanner" : "Scan Food"}
            </span>
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>

          <p className="text-xs text-brand-brown-pale font-medium">
            {locale === "fr" ? "Identifiez vos calories avec l'IA" : "Identify your calories with AI"}
          </p>

          {/* Gallery option below */}
          <label className="flex items-center gap-2 text-sm text-brand-terracotta font-semibold cursor-pointer hover:underline">
            <span>&#x1F5BC;&#xFE0F;</span>
            <span>{locale === "fr" ? "Choisir depuis la galerie" : "Choose from gallery"}</span>
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>
        </div>
      )}
    </div>
  );
}
