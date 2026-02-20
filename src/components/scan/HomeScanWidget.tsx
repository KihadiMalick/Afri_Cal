"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { checkScanLimit, incrementScanCount } from "@/utils/scan-limits";
import { matchAfricanFood } from "@/utils/african-food-match";
import { updateDailySummary } from "@/utils/daily-summary";
import ScanAnimation from "@/components/scan/ScanAnimation";
import ScanResultCard from "@/components/scan/ScanResult";
import CorrectionForm from "@/components/scan/CorrectionForm";
import type { ScanResult } from "@/types";

type ScanStep = "idle" | "preview" | "scanning" | "result" | "correction" | "limit";

// Compress image client-side to avoid Vercel body size limit (4.5MB)
function compressImage(
  file: File,
  maxSize: number = 800
): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let { width, height } = img;

      if (width > maxSize || height > maxSize) {
        if (width > height) {
          height = Math.round((height * maxSize) / width);
          width = maxSize;
        } else {
          width = Math.round((width * maxSize) / height);
          height = maxSize;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas non supporté"));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);

      const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
      const base64 = dataUrl.split(",")[1];
      resolve({ base64, mimeType: "image/jpeg" });
    };
    img.onerror = () => reject(new Error("Impossible de lire l'image"));
    img.src = URL.createObjectURL(file);
  });
}

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
  const [mimeType, setMimeType] = useState("image/jpeg");
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
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
      const compressed = await compressImage(file);
      setImageBase64(compressed.base64);
      setMimeType(compressed.mimeType);
      setStep("preview");
    } catch {
      setError(
        locale === "fr"
          ? "Impossible de traiter l'image. Réessayez."
          : "Could not process the image. Try again."
      );
    }
  }

  async function handleScan() {
    if (!imageBase64) return;

    setStep("scanning");
    setError("");

    try {
      const response = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64, mimeType }),
      });

      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        const text = await response.text();
        throw new Error(text.slice(0, 100) || "Erreur serveur inattendue");
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors du scan");
      }

      let result: ScanResult = data;
      result = await matchAfricanFood(supabase, result);

      const finalCalories = result.adjusted_calories ?? result.estimated_calories;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: scan } = await (supabase as any)
        .from("scan_history")
        .insert({
          user_id: userId,
          detected_dish: result.dish_name,
          estimated_calories: finalCalories,
          estimated_weight: result.estimated_weight_grams,
          confidence_score: result.confidence,
        })
        .select("id")
        .single();

      if (scan?.id) setScanId(scan.id);

      await incrementScanCount(supabase, userId);

      setScanResult(result);
      setScansUsed((prev) => prev + 1);
      setScansRemaining((prev) => Math.max(0, prev - 1));
      setStep("result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors du scan");
      setStep("preview");
    }
  }

  async function handleAddMeal() {
    if (!scanResult) return;

    const finalCalories =
      scanResult.adjusted_calories ?? scanResult.estimated_calories;
    const today = new Date().toISOString().split("T")[0];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("meals").insert({
      user_id: userId,
      name: scanResult.dish_name,
      meal_type: guessMealType(),
      calories: Math.round(finalCalories),
      protein: 0,
      carbs: 0,
      fat: 0,
      date: today,
      description: `Scan IA - ${scanResult.ingredients.join(", ")}`,
    });

    await updateDailySummary(supabase, userId, today);
    handleReset();
    if (onMealAdded) onMealAdded();
    router.push(`/${locale}/meals`);
  }

  function handleCorrection(correctedCalories: number, correctedDish: string) {
    if (scanResult) {
      setScanResult({
        ...scanResult,
        dish_name: correctedDish,
        adjusted_calories: correctedCalories,
      });
    }
    setStep("result");
  }

  function handleReset() {
    setImagePreview("");
    setImageBase64("");
    setScanResult(null);
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
        <p className="text-sm font-semibold text-gray-100 mb-1">
          {locale === "fr" ? "Limite de scans atteinte" : "Scan limit reached"}
        </p>
        <p className="text-xs text-dark-200">
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
  if (step === "result" && scanResult) {
    return (
      <ScanResultCard
        result={scanResult}
        imagePreview={imagePreview}
        onCorrect={() => setStep("correction")}
        onAddMeal={handleAddMeal}
        onNewScan={handleNewScan}
      />
    );
  }

  // Correction form
  if (step === "correction" && scanResult) {
    return (
      <CorrectionForm
        scanId={scanId}
        result={scanResult}
        onCorrected={handleCorrection}
        onCancel={() => setStep("result")}
      />
    );
  }

  return (
    <div className="card space-y-4">
      {/* Header with scan counter */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-gray-100">
            {locale === "fr" ? "Scanner un repas" : "Scan a meal"}
          </h2>
          <p className="text-xs text-dark-200 mt-0.5">
            {locale === "fr"
              ? "Identifiez vos calories avec l'IA"
              : "Identify your calories with AI"}
          </p>
        </div>
        {/* Scan counter */}
        <div className="flex items-center gap-1.5">
          <div className="flex gap-1">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i <= scansUsed ? "bg-primary-400" : "bg-dark-500"
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-dark-200">
            {scansRemaining === Infinity
              ? locale === "fr"
                ? "Illimité"
                : "Unlimited"
              : `${scansRemaining} ${locale === "fr" ? "restant" : "left"}${scansRemaining > 1 ? "s" : ""}`}
          </span>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Image preview */}
      {step === "preview" && imagePreview && (
        <div className="relative rounded-2xl overflow-hidden border border-dark-500">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imagePreview}
            alt="Aperçu"
            className="w-full aspect-video object-cover"
          />
          <button
            onClick={handleReset}
            className="absolute top-3 right-3 bg-dark-800/80 text-gray-100 rounded-full w-8 h-8 flex items-center justify-center text-sm backdrop-blur-sm"
          >
            &#x2715;
          </button>
        </div>
      )}

      {/* Camera / Gallery buttons (idle state) */}
      {step === "idle" && (
        <div className="grid grid-cols-2 gap-3">
          {/* Camera button */}
          <label className="flex flex-col items-center justify-center gap-2 bg-dark-700 hover:bg-dark-600 border border-dark-500 hover:border-primary-500/40 rounded-2xl p-4 cursor-pointer transition-all">
            <div className="w-12 h-12 rounded-full bg-primary-500/10 flex items-center justify-center">
              <span className="text-2xl">&#x1F4F7;</span>
            </div>
            <span className="text-sm font-medium text-gray-100">
              {locale === "fr" ? "Caméra" : "Camera"}
            </span>
            <span className="text-xs text-dark-200 text-center">
              {locale === "fr" ? "Prendre une photo" : "Take a photo"}
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

          {/* Gallery button */}
          <label className="flex flex-col items-center justify-center gap-2 bg-dark-700 hover:bg-dark-600 border border-dark-500 hover:border-primary-500/40 rounded-2xl p-4 cursor-pointer transition-all">
            <div className="w-12 h-12 rounded-full bg-accent-500/10 flex items-center justify-center">
              <span className="text-2xl">&#x1F5BC;&#xFE0F;</span>
            </div>
            <span className="text-sm font-medium text-gray-100">
              {locale === "fr" ? "Galerie" : "Gallery"}
            </span>
            <span className="text-xs text-dark-200 text-center">
              {locale === "fr" ? "Choisir une image" : "Choose an image"}
            </span>
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

      {/* Scan button (after image selected) */}
      {step === "preview" && imagePreview && (
        <button
          onClick={handleScan}
          className="btn-primary w-full text-center flex items-center justify-center gap-2"
        >
          <span>&#x2728;</span>
          <span>
            {locale === "fr" ? "Analyser avec Gemini" : "Analyze with Gemini"}
          </span>
        </button>
      )}
    </div>
  );
}
