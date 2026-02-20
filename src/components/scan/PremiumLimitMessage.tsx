"use client";

interface PremiumLimitMessageProps {
  scansUsed: number;
}

export default function PremiumLimitMessage({ scansUsed }: PremiumLimitMessageProps) {
  return (
    <div className="card animate-scale-in text-center space-y-4">
      <div className="w-16 h-16 mx-auto rounded-full bg-accent-500/10 flex items-center justify-center">
        <span className="text-3xl">&#x1F451;</span>
      </div>

      <h3 className="text-lg font-bold text-gray-100">
        Limite de scans atteinte
      </h3>

      <p className="text-dark-100 text-sm">
        Vous avez utilisé vos <span className="font-semibold text-accent-400">{scansUsed} scans gratuits</span> aujourd&apos;hui.
      </p>

      <div className="bg-gradient-to-r from-accent-500/10 to-primary-500/10 border border-accent-500/20 rounded-xl p-4">
        <p className="text-accent-400 font-semibold text-sm mb-1">
          &#x2728; Passez à Premium
        </p>
        <p className="text-dark-100 text-xs">
          Scans illimités, pas de publicités, fonctionnalités exclusives.
        </p>
      </div>

      <button
        disabled
        className="btn-accent w-full text-center opacity-60 cursor-not-allowed"
      >
        Bientôt disponible
      </button>

      <p className="text-dark-200 text-xs">
        Vos scans se réinitialisent chaque jour à minuit.
      </p>
    </div>
  );
}
