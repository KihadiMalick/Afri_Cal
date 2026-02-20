"use client";

import { useState, useEffect } from "react";

interface ScanAnimationProps {
  imagePreview: string;
}

const SCAN_STEPS = [
  { fr: "Analyse de la structure...", en: "Analyzing structure..." },
  { fr: "Détection des ingrédients...", en: "Detecting ingredients..." },
  { fr: "Estimation de la densité...", en: "Estimating density..." },
  { fr: "Calcul des calories...", en: "Calculating calories..." },
];

export default function ScanAnimation({ imagePreview }: ScanAnimationProps) {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((prev) => {
        if (prev < SCAN_STEPS.length - 1) return prev + 1;
        return prev;
      });
    }, 700);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark-900/95 backdrop-blur-sm">
      <div className="w-full max-w-sm mx-4">
        {/* Scan container */}
        <div className="relative rounded-2xl overflow-hidden border border-primary-500/30 shadow-glow">
          {/* Image */}
          <div className="relative aspect-square">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imagePreview}
              alt="Scan en cours"
              className="w-full h-full object-cover"
            />

            {/* Dark overlay */}
            <div className="absolute inset-0 bg-dark-900/40" />

            {/* Scanning line */}
            <div
              className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary-400 to-transparent animate-scan-line"
              style={{ boxShadow: "0 0 20px 4px rgba(16, 185, 129, 0.4)" }}
            />

            {/* Corner brackets */}
            <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-primary-400 rounded-tl-lg" />
            <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-primary-400 rounded-tr-lg" />
            <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-primary-400 rounded-bl-lg" />
            <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-primary-400 rounded-br-lg" />

            {/* Particles */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-primary-400 rounded-full animate-particle opacity-60"
                  style={{
                    left: `${15 + i * 14}%`,
                    animationDelay: `${i * 0.3}s`,
                    animationDuration: `${1.5 + i * 0.2}s`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Progress steps */}
        <div className="mt-6 space-y-2">
          {SCAN_STEPS.map((step, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 transition-all duration-500 ${
                i <= stepIndex ? "opacity-100" : "opacity-20"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i < stepIndex
                    ? "bg-primary-400"
                    : i === stepIndex
                    ? "bg-primary-400 animate-pulse"
                    : "bg-dark-400"
                }`}
              />
              <span
                className={`text-sm font-medium transition-colors duration-300 ${
                  i <= stepIndex ? "text-gray-100" : "text-dark-300"
                }`}
              >
                {step.fr}
              </span>
              {i < stepIndex && (
                <span className="text-primary-400 text-xs ml-auto">&#x2713;</span>
              )}
            </div>
          ))}
        </div>

        {/* Loading indicator */}
        <div className="mt-6 flex justify-center">
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-primary-400 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
