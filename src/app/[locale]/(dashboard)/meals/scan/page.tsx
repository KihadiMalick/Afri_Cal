"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { isValidLocale } from "@/i18n";
import { checkScanLimit, incrementScanCount } from "@/utils/scan-limits";
import { matchAfricanFood } from "@/utils/african-food-match";
import { updateDailySummary } from "@/utils/daily-summary";
import ScanAnimation from "@/components/scan/ScanAnimation";
import ScanResultCard from "@/components/scan/ScanResult";
import CorrectionForm from "@/components/scan/CorrectionForm";
import PremiumLimitMessage from "@/components/scan/PremiumLimitMessage";
import type { ScanResult } from "@/types";

type ScanStep = "upload" | "scanning" | "result" | "correction" | "limit";

export default function MealScanPage() {
  const params = useParams();
  const router = useRouter();
  const locale = isValidLocale(params?.locale as string)
    ? (params.locale as "fr" | "en")
    : "fr";
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<ScanStep>("upload");
  const [imagePreview, setImagePreview] = useState("");
  const [imageBase64, setImageBase64] = useState("");
  const [mimeType, setMimeType] = useState("image/jpeg");
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [scanId, setScanId] = useState("");
  const [userId, setUserId] = useState("");
  const [scansUsed, setScansUsed] = useState(0);
  const [scansRemaining, setScansRemaining] = useState(3);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadLimits = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push(`/${locale}/login`);
      return;
    }
    setUserId(user.id);

    const limits = await checkScanLimit(supabase, user.id);
    setScansUsed(limits.scansUsed);
    setScansRemaining(limits.scansRemaining);
    setLoading(false);

    if (!limits.canScan) {
      setStep("limit");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadLimits();
  }, [loadLimits]);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setMimeType(file.type || "image/jpeg");

    // Preview
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);

    // Convert to base64
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data:image/xxx;base64, prefix
      const base64 = result.split(",")[1];
      setImageBase64(base64);
    };
    reader.readAsDataURL(file);
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

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur lors du scan");
      }

      let result: ScanResult = await response.json();

      // Match with african food database
      result = await matchAfricanFood(supabase, result);

      // Save scan to history
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

      // Increment scan count
      await incrementScanCount(supabase, userId);

      setScanResult(result);
      setScansUsed((prev) => prev + 1);
      setScansRemaining((prev) => Math.max(0, prev - 1));
      setStep("result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors du scan");
      setStep("upload");
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

  function handleNewScan() {
    if (scansRemaining <= 0) {
      setStep("limit");
      return;
    }
    setImagePreview("");
    setImageBase64("");
    setScanResult(null);
    setScanId("");
    setError("");
    setStep("upload");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="loader" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-100">
          {locale === "fr" ? "Scanner un repas" : "Scan a meal"}
        </h1>
        {step !== "limit" && (
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`w-2.5 h-2.5 rounded-full transition-colors ${
                    i <= scansUsed ? "bg-primary-400" : "bg-dark-500"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-dark-100">
              {scansRemaining === Infinity
                ? "Illimité"
                : `${scansRemaining} restant${scansRemaining > 1 ? "s" : ""}`}
            </span>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm animate-fade-in">
          {error}
        </div>
      )}

      {/* Step: Upload */}
      {step === "upload" && (
        <div className="space-y-4">
          {/* Image preview or upload area */}
          {imagePreview ? (
            <div className="relative rounded-2xl overflow-hidden border border-dark-500">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imagePreview}
                alt="Aperçu"
                className="w-full aspect-square object-cover"
              />
              <button
                onClick={() => {
                  setImagePreview("");
                  setImageBase64("");
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="absolute top-3 right-3 bg-dark-800/80 text-gray-100 rounded-full w-8 h-8 flex items-center justify-center text-sm backdrop-blur-sm"
              >
                &#x2715;
              </button>
            </div>
          ) : (
            <label className="card flex flex-col items-center justify-center py-16 cursor-pointer border-2 border-dashed border-dark-400 hover:border-primary-500/50 transition-colors">
              <div className="w-20 h-20 rounded-full bg-primary-600/10 flex items-center justify-center mb-4">
                <span className="text-4xl">&#x1F4F7;</span>
              </div>
              <p className="text-gray-100 font-medium mb-1">
                {locale === "fr"
                  ? "Prenez une photo de votre repas"
                  : "Take a photo of your meal"}
              </p>
              <p className="text-dark-200 text-xs">
                {locale === "fr"
                  ? "Appuyez pour choisir une image"
                  : "Tap to choose an image"}
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          )}

          {/* Scan button */}
          {imagePreview && (
            <button
              onClick={handleScan}
              className="btn-primary w-full text-center flex items-center justify-center gap-2"
            >
              <span>&#x1F50D;</span>
              <span>
                {locale === "fr" ? "Analyser avec l'IA" : "Analyze with AI"}
              </span>
            </button>
          )}

          {/* How it works */}
          <div className="card-static">
            <h3 className="text-sm font-semibold text-gray-100 mb-3">
              {locale === "fr" ? "Comment ça marche ?" : "How does it work?"}
            </h3>
            <div className="space-y-2.5">
              {[
                {
                  icon: "1\uFE0F\u20E3",
                  text:
                    locale === "fr"
                      ? "Prenez une photo claire de votre plat"
                      : "Take a clear photo of your dish",
                },
                {
                  icon: "2\uFE0F\u20E3",
                  text:
                    locale === "fr"
                      ? "L'IA analyse les ingrédients et le poids"
                      : "AI analyzes ingredients and weight",
                },
                {
                  icon: "3\uFE0F\u20E3",
                  text:
                    locale === "fr"
                      ? "Les calories sont ajustées avec notre base africaine"
                      : "Calories are adjusted with our African database",
                },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-lg">{item.icon}</span>
                  <p className="text-sm text-dark-100">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step: Scanning animation */}
      {step === "scanning" && imagePreview && (
        <ScanAnimation imagePreview={imagePreview} />
      )}

      {/* Step: Result */}
      {step === "result" && scanResult && (
        <ScanResultCard
          result={scanResult}
          imagePreview={imagePreview}
          onCorrect={() => setStep("correction")}
          onAddMeal={handleAddMeal}
          onNewScan={handleNewScan}
        />
      )}

      {/* Step: Correction */}
      {step === "correction" && scanResult && (
        <CorrectionForm
          scanId={scanId}
          result={scanResult}
          onCorrected={handleCorrection}
          onCancel={() => setStep("result")}
        />
      )}

      {/* Step: Limit reached */}
      {step === "limit" && <PremiumLimitMessage scansUsed={scansUsed} />}

      {/* Recent scans */}
      {step === "upload" && <RecentScans userId={userId} locale={locale} />}
    </div>
  );
}

function guessMealType(): "breakfast" | "lunch" | "dinner" | "snack" {
  const hour = new Date().getHours();
  if (hour < 10) return "breakfast";
  if (hour < 15) return "lunch";
  if (hour < 21) return "dinner";
  return "snack";
}

function RecentScans({
  userId,
  locale,
}: {
  userId: string;
  locale: string;
}) {
  const [scans, setScans] = useState<
    {
      id: string;
      detected_dish: string;
      estimated_calories: number;
      created_at: string;
    }[]
  >([]);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase as any)
        .from("scan_history")
        .select("id, detected_dish, estimated_calories, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(5);

      if (data) setScans(data);
    }
    if (userId) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  if (scans.length === 0) return null;

  return (
    <div className="card-static">
      <h3 className="text-sm font-semibold text-gray-100 mb-3">
        {locale === "fr" ? "Scans récents" : "Recent scans"}
      </h3>
      <div className="space-y-2">
        {scans.map((scan) => (
          <div
            key={scan.id}
            className="flex items-center justify-between bg-dark-700 rounded-xl p-3"
          >
            <div>
              <p className="text-sm font-medium text-gray-100">
                {scan.detected_dish}
              </p>
              <p className="text-xs text-dark-200">
                {new Date(scan.created_at).toLocaleDateString(
                  locale === "fr" ? "fr-FR" : "en-US"
                )}
              </p>
            </div>
            <span className="text-sm font-semibold text-primary-400">
              {Math.round(scan.estimated_calories)} kcal
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
