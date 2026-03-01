"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Home, UtensilsCrossed, Activity, CalendarDays, UserCircle, LogOut, Leaf,
} from "lucide-react";
import { createClient } from "@/lib/supabase";
import { isValidLocale } from "@/i18n";
import { ThemeProvider, useTheme } from "./ThemeContext";

/* ── Navigation items ── */
const NAV_ITEMS = [
  { Icon: Home,            labelFr: "Accueil",   labelEn: "Home",     path: "dashboard"  },
  { Icon: UtensilsCrossed, labelFr: "Repas",     labelEn: "Meals",    path: "meals"      },
  { Icon: Activity,        labelFr: "Activités", labelEn: "Activity", path: "activities" },
  { Icon: CalendarDays,    labelFr: "Agenda",    labelEn: "Calendar", path: "calendar"   },
  { Icon: UserCircle,      labelFr: "Profil",    labelEn: "Profile",  path: "profile"    },
];

/* ── Circuit-board SVG tile ── */
export const CIRCUIT_BG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cline x1='0' y1='20' x2='80' y2='20' stroke='rgba(0,255,157,0.10)' stroke-width='0.4'/%3E%3Cline x1='0' y1='60' x2='80' y2='60' stroke='rgba(0,255,157,0.10)' stroke-width='0.4'/%3E%3Cline x1='20' y1='0' x2='20' y2='80' stroke='rgba(0,255,157,0.10)' stroke-width='0.4'/%3E%3Cline x1='60' y1='0' x2='60' y2='80' stroke='rgba(0,255,157,0.10)' stroke-width='0.4'/%3E%3Ccircle cx='20' cy='20' r='2' fill='none' stroke='rgba(0,255,157,0.16)' stroke-width='0.5'/%3E%3Ccircle cx='60' cy='20' r='2' fill='none' stroke='rgba(0,255,157,0.16)' stroke-width='0.5'/%3E%3Ccircle cx='20' cy='60' r='2' fill='none' stroke='rgba(0,255,157,0.16)' stroke-width='0.5'/%3E%3Ccircle cx='60' cy='60' r='2' fill='none' stroke='rgba(0,255,157,0.16)' stroke-width='0.5'/%3E%3Cline x1='24' y1='20' x2='36' y2='20' stroke='rgba(0,255,157,0.07)' stroke-width='0.3'/%3E%3Cline x1='44' y1='60' x2='56' y2='60' stroke='rgba(0,255,157,0.07)' stroke-width='0.3'/%3E%3Cline x1='20' y1='24' x2='20' y2='36' stroke='rgba(0,255,157,0.07)' stroke-width='0.3'/%3E%3Cline x1='60' y1='44' x2='60' y2='56' stroke='rgba(0,255,157,0.07)' stroke-width='0.3'/%3E%3Crect x='36' y='36' width='8' height='8' fill='none' stroke='rgba(0,255,157,0.09)' stroke-width='0.4' rx='1'/%3E%3C/svg%3E")`;
const CIRCUIT_BG_LIGHT = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cline x1='0' y1='20' x2='80' y2='20' stroke='rgba(0,150,80,0.12)' stroke-width='0.4'/%3E%3Cline x1='0' y1='60' x2='80' y2='60' stroke='rgba(0,150,80,0.12)' stroke-width='0.4'/%3E%3Cline x1='20' y1='0' x2='20' y2='80' stroke='rgba(0,150,80,0.12)' stroke-width='0.4'/%3E%3Cline x1='60' y1='0' x2='60' y2='80' stroke='rgba(0,150,80,0.12)' stroke-width='0.4'/%3E%3Ccircle cx='20' cy='20' r='2' fill='none' stroke='rgba(0,150,80,0.18)' stroke-width='0.5'/%3E%3Ccircle cx='60' cy='20' r='2' fill='none' stroke='rgba(0,150,80,0.18)' stroke-width='0.5'/%3E%3Ccircle cx='20' cy='60' r='2' fill='none' stroke='rgba(0,150,80,0.18)' stroke-width='0.5'/%3E%3Ccircle cx='60' cy='60' r='2' fill='none' stroke='rgba(0,150,80,0.18)' stroke-width='0.5'/%3E%3Crect x='36' y='36' width='8' height='8' fill='none' stroke='rgba(0,150,80,0.10)' stroke-width='0.4' rx='1'/%3E%3C/svg%3E")`;

/* ── ECG waveform path (16 heartbeat cycles) ── */
function buildECGPath(cycles = 16): string {
  const W = 130, b = 35;
  let d = `M 0,${b}`;
  for (let i = 0; i < cycles; i++) {
    const x = i * W;
    d += ` L ${x+15},${b} L ${x+24},${b-7} L ${x+30},${b} L ${x+38},${b}`;
    d += ` L ${x+42},${b+7} L ${x+47},4 L ${x+52},${b+12} L ${x+57},${b}`;
    d += ` L ${x+69},${b} L ${x+75},${b-8} L ${x+82},${b-15} L ${x+89},${b-8} L ${x+95},${b}`;
  }
  d += ` L ${cycles * W + 10},${b}`;
  return d;
}
const ECG_PATH = buildECGPath();

/* ── Glass card style (uses CSS variables — auto-adapts to theme) ── */
export const GLASS_CARD = {
  background:           "var(--lx-card)",
  backdropFilter:       "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",
  border:               "1px solid var(--lx-cb)",
  boxShadow:            "var(--lx-cs)",
} as const;

/* ══════════════════════════════════════════════════════════
   ALL LIXUM CSS — one injection point
   ══════════════════════════════════════════════════════════ */
export const LIXUM_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');

  /* ── Suppress outer scrollbars ── */
  html::-webkit-scrollbar, body::-webkit-scrollbar { display:none!important; width:0!important; }
  html, body { scrollbar-width:none!important; }

  /* ── Inner scroll — no track ── */
  .lixum-main { scrollbar-width:none; -ms-overflow-style:none; }
  .lixum-main::-webkit-scrollbar { display:none; width:0; }

  /* ══ CSS DESIGN TOKENS (dark by default) ══ */
  .lixum-shell {
    --lx-card:   rgba(2,12,7,0.80);
    --lx-cb:     rgba(255,255,255,0.11);
    --lx-cs:     0 4px 28px rgba(0,0,0,.42), inset 0 1px 0 rgba(255,255,255,.06);
    --lx-row:    rgba(255,255,255,.055);
    --lx-accent: #00ff9d;
    --lx-vcard:  linear-gradient(135deg, rgba(255,255,255,.07) 0%, rgba(0,255,157,.04) 100%);
    --lx-vcb:    rgba(255,255,255,0.10);
    --lx-vcs:    0 8px 48px rgba(0,0,0,.48), inset 0 1px 0 rgba(255,255,255,.08);
    --lx-t1:        rgba(255,255,255,0.94);
    --lx-t2:        rgba(255,255,255,0.68);
    --lx-t3:        rgba(255,255,255,0.48);
    --lx-t4:        rgba(255,255,255,0.32);
    --lx-accent-sub:rgba(0,255,157,.55);
  }

  /* ══ LIGHT THEME TOKENS ══ */
  .lixum-shell[data-theme="light"] {
    --lx-card:   rgba(255,255,255,0.92);
    --lx-cb:     rgba(0,140,70,0.22);
    --lx-cs:     0 4px 28px rgba(0,80,40,.12), inset 0 1px 0 rgba(255,255,255,.95);
    --lx-row:    rgba(0,120,60,.07);
    --lx-accent: #059669;
    --lx-vcard:  linear-gradient(135deg, rgba(255,255,255,.92) 0%, rgba(0,200,100,.06) 100%);
    --lx-vcb:    rgba(0,150,70,0.22);
    --lx-vcs:    0 8px 48px rgba(0,80,40,.14), inset 0 1px 0 rgba(255,255,255,.95);
    --lx-t1:        rgba(5,30,18,0.94);
    --lx-t2:        rgba(5,30,18,0.68);
    --lx-t3:        rgba(5,30,18,0.48);
    --lx-t4:        rgba(5,30,18,0.32);
    --lx-accent-sub:rgba(5,150,100,.68);
  }

  /* ══ TOKEN UTILITY CLASSES ══ */
  .lx-t1 { color: var(--lx-t1); }
  .lx-t2 { color: var(--lx-t2); }
  .lx-t3 { color: var(--lx-t3); }
  .lx-t4 { color: var(--lx-t4); }

  /* ══ LIGHT THEME — override Tailwind text-white/* classes ══ */
  .lixum-shell[data-theme="light"] [class*="text-white"] {
    color: rgba(5,30,18,0.75) !important;
  }
  .lixum-shell[data-theme="light"] .lixum-x {
    color: #059669 !important;
    text-shadow: 0 0 10px rgba(5,150,80,.35), 0 0 24px rgba(5,150,80,.20) !important;
  }
  .lixum-shell[data-theme="light"] .text-amber-400,
  .lixum-shell[data-theme="light"] .text-amber-500 { color: #b45309 !important; }
  .lixum-shell[data-theme="light"] .text-amber-300 { color: #d97706 !important; }
  .lixum-shell[data-theme="light"] .text-red-400   { color: #dc2626 !important; }
  .lixum-shell[data-theme="light"] .text-blue-400  { color: #2563eb !important; }

  /* ══ KEYFRAMES ══ */
  @keyframes lixum-heartbeat {
    0%,100% { transform:translate(-50%,-50%) scale(1);    opacity:.50; }
    14%     { transform:translate(-50%,-50%) scale(1.18); opacity:.85; }
    28%     { transform:translate(-50%,-50%) scale(.97);  opacity:.40; }
    42%     { transform:translate(-50%,-50%) scale(1.09); opacity:.70; }
    65%     { transform:translate(-50%,-50%) scale(1);    opacity:.50; }
  }
  @keyframes lixum-ring {
    0%,100% { transform:translate(-50%,-50%) scale(1);    opacity:.14; }
    14%     { transform:translate(-50%,-50%) scale(1.22); opacity:.28; }
    42%     { transform:translate(-50%,-50%) scale(1.12); opacity:.20; }
  }
  @keyframes lixum-fadein {
    from { opacity:0; transform:translateY(10px); }
    to   { opacity:1; transform:translateY(0);    }
  }

  /* ── "Card deposited from below" — spring overshoot ── */
  @keyframes lixum-page-enter {
    0%   { opacity:0; transform:translateY(38px) scale(0.93); filter:blur(6px); }
    62%  { opacity:1; transform:translateY(-4px) scale(1.004); filter:blur(0);  }
    100% { opacity:1; transform:translateY(0) scale(1);        filter:blur(0);  }
  }
  .lixum-page-enter {
    animation: lixum-page-enter 0.44s cubic-bezier(0.22, 1, 0.36, 1) both;
    will-change: transform, opacity;
  }

  /* ── Skeleton shimmer ── */
  @keyframes lixum-shimmer {
    0%   { background-position: -220% 0; }
    100% { background-position:  220% 0; }
  }
  .lixum-skeleton {
    background: linear-gradient(
      90deg,
      rgba(0,255,157,.04) 0%,
      rgba(0,255,157,.10) 40%,
      rgba(0,255,157,.07) 50%,
      rgba(0,255,157,.04) 100%
    );
    background-size: 220% 100%;
    animation: lixum-shimmer 1.7s ease-in-out infinite;
    border-radius: 1.5rem;
  }
  .lixum-shell[data-theme="light"] .lixum-skeleton {
    background: linear-gradient(
      90deg,
      rgba(0,140,70,.06) 0%,
      rgba(0,140,70,.16) 40%,
      rgba(0,140,70,.10) 50%,
      rgba(0,140,70,.06) 100%
    );
    background-size: 220% 100%;
    animation: lixum-shimmer 1.7s ease-in-out infinite;
  }

  /* ── Monospace numbers ── */
  .lixum-num {
    font-family:'Courier New','Roboto Mono',monospace;
    font-variant-numeric:tabular-nums;
    letter-spacing:0.04em;
  }

  /* ── Card hover ── */
  .lixum-card {
    transition: transform .28s cubic-bezier(.25,.46,.45,.94),
                box-shadow .28s cubic-bezier(.25,.46,.45,.94),
                border-color .28s ease;
  }
  .lixum-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 16px 44px rgba(0,255,157,.10), 0 6px 18px rgba(0,0,0,.38) !important;
    border-color: rgba(0,255,157,.22) !important;
  }
  .lixum-shell[data-theme="light"] .lixum-card:hover {
    box-shadow: 0 16px 44px rgba(0,140,70,.14), 0 6px 18px rgba(0,0,0,.10) !important;
    border-color: rgba(0,140,70,.30) !important;
  }
  .lixum-card:active { transform: scale(.986) translateY(-1px); }
  .lixum-vitality-card {
    transition: transform .28s cubic-bezier(.25,.46,.45,.94), box-shadow .28s, border-color .28s;
  }
  .lixum-vitality-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 24px 60px rgba(0,255,157,.14), 0 8px 24px rgba(0,0,0,.42) !important;
    border-color: rgba(0,255,157,.28) !important;
  }
  .lixum-vitality-card:active { transform: scale(.990) translateY(-1px); }

  /* ── Entrance stagger ── */
  .lixum-animate { animation: lixum-fadein .40s ease-out both; }

  /* ── Neon X ── */
  .lixum-x {
    color:#00ff9d;
    text-shadow: 0 0 12px #00ff9d, 0 0 28px rgba(0,255,157,.50), 0 0 50px rgba(0,255,157,.20);
  }

  /* ── Form inputs ── */
  .lixum-input {
    background: rgba(0,8,4,0.58);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 0.75rem;
    color: rgba(255,255,255,0.88);
    padding: 0.6rem 0.9rem;
    font-family: 'Outfit','Poppins',sans-serif;
    font-size: 0.9rem;
    outline: none;
    transition: border-color .2s, box-shadow .2s;
    width: 100%;
  }
  .lixum-input:focus {
    border-color: rgba(0,255,157,.40);
    box-shadow: 0 0 0 3px rgba(0,255,157,.09);
  }
  .lixum-input::placeholder { color: rgba(255,255,255,.30); }
  .lixum-shell[data-theme="light"] .lixum-input {
    background: rgba(255,255,255,0.85);
    border-color: rgba(0,140,70,0.22);
    color: rgba(5,30,18,0.88);
  }
  .lixum-shell[data-theme="light"] .lixum-input:focus {
    border-color: rgba(0,140,70,.50);
    box-shadow: 0 0 0 3px rgba(0,140,70,.10);
  }
  .lixum-shell[data-theme="light"] .lixum-input::placeholder { color: rgba(5,30,18,.35); }

  /* ── Spinner ── */
  .lixum-spin {
    width:28px; height:28px;
    border:2px solid rgba(0,255,157,.15);
    border-top-color:#00ff9d;
    border-radius:50%;
    animation:lixum-spin-anim 0.7s linear infinite;
    box-shadow:0 0 12px rgba(0,255,157,.4);
  }
  .lixum-shell[data-theme="light"] .lixum-spin {
    border-color: rgba(5,150,80,.18);
    border-top-color: #059669;
    box-shadow: 0 0 12px rgba(5,150,80,.35);
  }
  @keyframes lixum-spin-anim { to { transform: rotate(360deg); } }

  /* ══ CalendarView theme overrides ══ */
  /* Nav buttons */
  .lixum-main .btn-secondary {
    background: rgba(0,8,4,0.58) !important;
    border: 1px solid rgba(0,255,157,.22) !important;
    color: rgba(255,255,255,.82) !important;
    border-radius: 0.75rem !important;
    padding: 0.3rem 0.75rem !important;
    font-weight: 600 !important;
    font-size: 0.8rem !important;
    font-family: 'Outfit','Poppins',sans-serif !important;
    box-shadow: none !important;
    text-shadow: none !important;
    transition: all .2s !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
  }
  .lixum-main .btn-secondary:hover {
    background: rgba(0,255,157,.10) !important;
    color: #00ff9d !important;
    border-color: rgba(0,255,157,.40) !important;
  }
  /* Cell colors */
  .lixum-main .bg-dark-700    { background: rgba(255,255,255,.07) !important; }
  .lixum-main .hover\:bg-dark-600:hover { background: rgba(0,255,157,.09) !important; }
  /* Text */
  .lixum-main .text-gray-300,
  .lixum-main .text-dark-100  { color: rgba(255,255,255,.60) !important; }
  .lixum-main .text-gray-100  { color: rgba(255,255,255,.94) !important; }
  .lixum-main .text-gray-500  { color: rgba(255,255,255,.42) !important; }
  /* Today ring */
  .lixum-main .ring-primary-400    { --tw-ring-color: rgba(0,255,157,.65) !important; }
  .lixum-main .ring-offset-dark-800 { --tw-ring-offset-color: rgba(2,12,7,.7) !important; }
  /* Selected day detail card */
  .lixum-main .card {
    background: rgba(2,12,7,0.80) !important;
    border: 1px solid rgba(0,255,157,.20) !important;
    border-left: 4px solid #00ff9d !important;
    border-radius: 1.25rem !important;
    box-shadow: 0 4px 20px rgba(0,0,0,.35) !important;
    padding: 1rem 1.25rem !important;
  }
  .lixum-main .border-l-primary-500 { border-left-color: #00ff9d !important; }

  /* Calendar — light theme overrides */
  .lixum-shell[data-theme="light"] .lixum-main .btn-secondary {
    background: rgba(0,140,70,.08) !important;
    border-color: rgba(0,140,70,.28) !important;
    color: #065f46 !important;
  }
  .lixum-shell[data-theme="light"] .lixum-main .btn-secondary:hover {
    background: rgba(0,140,70,.16) !important;
    color: #047857 !important;
    border-color: rgba(0,140,70,.45) !important;
  }
  .lixum-shell[data-theme="light"] .lixum-main .bg-dark-700    { background: rgba(0,100,50,.07) !important; }
  .lixum-shell[data-theme="light"] .lixum-main .hover\:bg-dark-600:hover { background: rgba(0,140,70,.12) !important; }
  .lixum-shell[data-theme="light"] .lixum-main .text-gray-300,
  .lixum-shell[data-theme="light"] .lixum-main .text-dark-100  { color: rgba(5,30,18,.58) !important; }
  .lixum-shell[data-theme="light"] .lixum-main .text-gray-100  { color: rgba(5,30,18,.92) !important; }
  .lixum-shell[data-theme="light"] .lixum-main .text-gray-500  { color: rgba(5,30,18,.40) !important; }
  .lixum-shell[data-theme="light"] .lixum-main .ring-primary-400 { --tw-ring-color: rgba(5,150,80,.65) !important; }
  .lixum-shell[data-theme="light"] .lixum-main .ring-offset-dark-800 { --tw-ring-offset-color: rgba(234,247,240,.8) !important; }
  .lixum-shell[data-theme="light"] .lixum-main .card {
    background: rgba(255,255,255,.92) !important;
    border: 1px solid rgba(0,140,70,.22) !important;
    border-left: 4px solid #059669 !important;
    box-shadow: 0 4px 20px rgba(0,80,40,.12) !important;
  }

  /* ── Bio-sub accent utility ── */
  .lixum-bio-sub { color: var(--lx-accent-sub); }

  /* ══ Light theme: fix card text visibility ══ */
  /* Inherit readable dark text on card roots */
  .lixum-shell[data-theme="light"] .lixum-card        { color: var(--lx-t2); }
  .lixum-shell[data-theme="light"] .lixum-vitality-card { color: var(--lx-t2); }
  /* Override any inline rgba(255,255,255,…) colors inside cards */
  .lixum-shell[data-theme="light"] .lixum-card [style*="rgba(255,255,255"],
  .lixum-shell[data-theme="light"] .lixum-vitality-card [style*="rgba(255,255,255"] {
    color: var(--lx-t2) !important;
  }

  /* ══ Page transition wipe ══ */
  @keyframes lixum-pg-wipe {
    0%   { transform: translateX(-105%); }
    40%  { transform: translateX(0%);    }
    60%  { transform: translateX(0%);    }
    100% { transform: translateX(105%);  }
  }
  .lixum-page-wipe {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 5;
    will-change: transform;
    animation: lixum-pg-wipe 0.54s cubic-bezier(0.4,0,0.2,1) forwards;
  }

  /* ══ ECG theme-change overlay ══ */
  @keyframes lixum-ecg-overlay-fade {
    0%   { opacity: 0; }
    10%  { opacity: 1; }
    78%  { opacity: 1; }
    100% { opacity: 0; }
  }
  @keyframes lixum-ecg-sweep {
    0%   { clip-path: inset(0 100% 0 0); }
    52%  { clip-path: inset(0 0%   0 0); }
    100% { clip-path: inset(0 0%   0 0); }
  }
  .lixum-ecg-overlay {
    position: fixed;
    inset: 0;
    z-index: 9999;
    background: rgba(0,6,3,0.94);
    overflow: hidden;
    display: flex;
    align-items: center;
    animation: lixum-ecg-overlay-fade 0.98s cubic-bezier(0.4,0,0.2,1) forwards;
    pointer-events: none;
  }
  .lixum-ecg-svg {
    width: 100%;
    height: 80px;
    flex-shrink: 0;
    clip-path: inset(0 100% 0 0);
    animation: lixum-ecg-sweep 0.98s cubic-bezier(0.4,0,0.2,1) forwards;
  }
`;

/* ══════════════════════════════════════════════════════════
   LIXUM SHELL — public entry: wraps pages in ThemeProvider
   ══════════════════════════════════════════════════════════ */
export default function LixumShell({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <LixumShellContent>{children}</LixumShellContent>
    </ThemeProvider>
  );
}

/* ── Inner shell — reads theme from context ── */
function LixumShellContent({ children }: { children: React.ReactNode }) {
  const { theme, transitioning } = useTheme();
  const params    = useParams();
  const router    = useRouter();
  const pathname  = usePathname();
  const locale    = isValidLocale(params?.locale as string) ? (params.locale as "fr" | "en") : "fr";
  const supabase  = createClient();

  const isDark = theme === "dark";

  /* Page-wipe transition state */
  const [wipeActive, setWipeActive] = useState(false);
  const wipeRef = useRef(pathname);

  /* Theme-dependent values */
  const mainBg      = isDark ? "#020c07"  : "#eaf7f0";
  const circuitBg   = isDark ? CIRCUIT_BG : CIRCUIT_BG_LIGHT;
  const sidebarGrad = isDark
    ? `linear-gradient(180deg, #051a0e 0%, #061c10 55%, #071e12 100%)`
    : `linear-gradient(180deg, #ecfdf5 0%, #e8fdf2 55%, #dcfce7 100%)`;
  const sidebarBorder  = isDark ? "rgba(0,255,157,.07)" : "rgba(0,150,70,.14)";
  const sidebarShadow  = isDark
    ? "4px 0 32px rgba(0,0,0,.55), inset -1px 0 0 rgba(0,255,157,.04)"
    : "4px 0 24px rgba(0,80,40,.12), inset -1px 0 0 rgba(0,140,70,.08)";
  const logoBoxBg      = isDark ? "rgba(0,255,157,.06)"  : "rgba(0,150,70,.08)";
  const logoBoxBorder  = isDark ? "rgba(0,255,157,.20)"  : "rgba(0,150,70,.28)";
  const logoBoxShadow  = isDark
    ? "0 0 16px rgba(0,255,157,.14), inset 0 1px 0 rgba(255,255,255,.05)"
    : "0 0 12px rgba(0,150,70,.12), inset 0 1px 0 rgba(255,255,255,.80)";
  const iconActive     = isDark ? "#00ff9d" : "#059669";
  const iconInactive   = isDark ? "rgba(255,255,255,.55)" : "rgba(5,30,18,.52)";
  const iconActiveGlow = isDark
    ? "drop-shadow(0 0 6px rgba(0,255,157,.7)) drop-shadow(0 0 14px rgba(0,255,157,.3))"
    : "drop-shadow(0 0 6px rgba(5,150,80,.5)) drop-shadow(0 0 12px rgba(5,150,80,.25))";
  const navActiveBg    = isDark ? "rgba(0,255,157,.07)"  : "rgba(0,150,70,.08)";
  const navActiveShadow= isDark
    ? "inset 0 2px 8px rgba(0,0,0,.5), 0 0 12px rgba(0,255,157,.08)"
    : "inset 0 2px 8px rgba(0,80,40,.08), 0 0 8px rgba(0,150,70,.06)";
  const navHoverBg     = isDark ? "rgba(255,255,255,.03)" : "rgba(0,140,70,.05)";
  const indicatorColor = isDark ? "#00ff9d" : "#059669";
  const indicatorGlow  = isDark
    ? "0 0 10px #00ff9d, 0 0 20px rgba(0,255,157,.4)"
    : "0 0 8px rgba(5,150,80,.5), 0 0 16px rgba(5,150,80,.25)";
  const labelActive    = isDark ? "rgba(0,255,157,.92)"  : "#047857";
  const labelInactive  = isDark ? "rgba(255,255,255,.52)" : "rgba(5,30,18,.52)";
  const lixumSubColor  = isDark ? "rgba(0,255,157,.42)"  : "rgba(5,150,80,.50)";
  const logoutColor    = isDark ? "rgba(255,255,255,.45)" : "rgba(5,30,18,.45)";
  const pulseColor     = isDark
    ? "radial-gradient(circle, rgba(0,255,157,.18) 0%, rgba(0,255,157,.06) 40%, transparent 70%)"
    : "radial-gradient(circle, rgba(0,200,100,.12) 0%, rgba(0,200,100,.04) 40%, transparent 70%)";
  const ringColor      = isDark ? "rgba(0,255,157,.10)" : "rgba(0,180,90,.08)";

  /* Page-wipe on route change */
  useEffect(() => {
    if (pathname !== wipeRef.current) {
      wipeRef.current = pathname;
      setWipeActive(true);
      const t = setTimeout(() => setWipeActive(false), 580);
      return () => clearTimeout(t);
    }
  }, [pathname]);

  /* Lock scroll on html + body */
  useEffect(() => {
    const prevBody = document.body.style.overflow;
    const prevHtml = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevBody;
      document.documentElement.style.overflow = prevHtml;
    };
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push(`/${locale}/login`);
    router.refresh();
  }

  return (
    <>
      <style>{LIXUM_STYLES}</style>

      <div
        className="lixum-shell fixed inset-0 z-[60] text-white flex overflow-hidden"
        data-theme={theme}
        style={{
          background: mainBg,
          backgroundImage: circuitBg,
          fontFamily: "'Outfit','Poppins',sans-serif",
        }}
      >
        {/* ── Heartbeat pulse (CSS-only) ── */}
        <div aria-hidden="true" className="pointer-events-none select-none">
          <div style={{
            position:"fixed", top:"50%", left:"50%",
            width:"55vmin", height:"55vmin", borderRadius:"50%",
            background: pulseColor,
            animation:"lixum-heartbeat 4s cubic-bezier(.36,.07,.19,.97) infinite",
            willChange:"transform, opacity",
          }} />
          <div style={{
            position:"fixed", top:"50%", left:"50%",
            width:"78vmin", height:"78vmin", borderRadius:"50%",
            border:`1px solid ${ringColor}`,
            animation:"lixum-ring 4s cubic-bezier(.36,.07,.19,.97) infinite",
            willChange:"transform, opacity",
          }} />
        </div>

        {/* ── Sidebar ── */}
        <aside
          className="flex flex-shrink-0 flex-col items-center pt-6 pb-5 w-14 md:w-[5.5rem]"
          style={{
            borderRadius:"0 24px 24px 0",
            backgroundImage: sidebarGrad,
            borderRight:`1px solid ${sidebarBorder}`,
            boxShadow: sidebarShadow,
          }}
        >
          {/* Logo badge */}
          <div className="flex flex-col items-center mb-6 flex-shrink-0">
            <div
              className="w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center select-none mb-1"
              style={{ background:logoBoxBg, border:`1px solid ${logoBoxBorder}`, boxShadow:logoBoxShadow }}
            >
              <Leaf size={20} strokeWidth={2} style={{ color:iconActive }} />
            </div>
            <p className="hidden md:block text-[7px] font-semibold tracking-[.10em]" style={{ color:lixumSubColor }}>
              AfriCalo
            </p>
          </div>

          {/* Nav items */}
          <nav className="flex flex-col items-center w-full px-1 md:px-2 flex-1 justify-around">
            {NAV_ITEMS.map(({ Icon, labelFr, labelEn, path }) => {
              const isActive = pathname.includes(`/${path}`);
              return (
                <Link
                  key={path}
                  href={`/${locale}/${path}`}
                  prefetch={true}
                  className="relative flex flex-col items-center gap-1.5 w-full py-2.5 rounded-2xl transition-all duration-200"
                  style={isActive ? { backgroundColor:navActiveBg, boxShadow:navActiveShadow } : undefined}
                  onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.backgroundColor = navHoverBg; }}
                  onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.backgroundColor = ""; }}
                >
                  {isActive && (
                    <span
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full"
                      style={{ background:indicatorColor, boxShadow:indicatorGlow }}
                    />
                  )}
                  <Icon
                    size={30}
                    strokeWidth={isActive ? 2 : 1.5}
                    style={{
                      color: isActive ? iconActive : iconInactive,
                      filter: isActive ? iconActiveGlow : "none",
                      transition:"color .2s, filter .2s",
                    }}
                  />
                  <span
                    className="hidden md:block text-[9px] font-semibold tracking-wide"
                    style={{ color: isActive ? labelActive : labelInactive }}
                  >
                    {locale === "fr" ? labelFr : labelEn}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex flex-col items-center gap-1.5 rounded-2xl w-full py-2.5 mt-3 flex-shrink-0 transition-all duration-200"
            style={{ color:logoutColor }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.color = "#f87171";
              (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(239,68,68,.06)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.color = logoutColor;
              (e.currentTarget as HTMLElement).style.backgroundColor = "";
            }}
          >
            <LogOut size={26} strokeWidth={1.5} />
            <span className="hidden md:block text-[9px] font-semibold tracking-wide">
              {locale === "fr" ? "Sortir" : "Exit"}
            </span>
          </button>
        </aside>

        {/* ── Main content with spring page transition ── */}
        <main className="lixum-main flex-1 overflow-y-auto relative">
          <div
            className="pointer-events-none fixed top-0 left-[20%] w-72 h-72 rounded-full"
            style={{
              background: isDark
                ? "radial-gradient(circle, rgba(0,255,157,.05) 0%, transparent 70%)"
                : "radial-gradient(circle, rgba(0,200,100,.06) 0%, transparent 70%)",
              filter:"blur(50px)",
            }}
          />
          {/* ── Page transition wipe panel ── */}
          {wipeActive && (
            <div
              className="lixum-page-wipe"
              aria-hidden="true"
              style={{
                background: isDark
                  ? "linear-gradient(90deg,transparent 0%,rgba(0,8,4,.94) 14%,rgba(0,8,4,.97) 40%,rgba(0,8,4,.97) 60%,rgba(0,8,4,.94) 86%,transparent 100%)"
                  : "linear-gradient(90deg,transparent 0%,rgba(234,253,245,.95) 14%,rgba(234,253,245,.98) 40%,rgba(234,253,245,.98) 60%,rgba(234,253,245,.95) 86%,transparent 100%)",
                boxShadow: isDark
                  ? "inset 22px 0 32px rgba(0,255,157,.09),inset -22px 0 32px rgba(0,255,157,.09)"
                  : "inset 22px 0 32px rgba(5,150,80,.12),inset -22px 0 32px rgba(5,150,80,.12)",
              }}
            />
          )}
          {/* key={pathname} — forces remount on route change → re-triggers animation */}
          <div key={pathname} className="lixum-page-enter min-h-full">
            {children}
          </div>
        </main>

        {/* ── ECG theme-change overlay (renders above everything) ── */}
        {transitioning && (
          <div className="lixum-ecg-overlay" aria-hidden="true">
            <svg
              className="lixum-ecg-svg"
              viewBox="0 0 2090 60"
              preserveAspectRatio="none"
            >
              <path
                d={ECG_PATH}
                fill="none"
                stroke="#00ff9d"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ filter:"drop-shadow(0 0 6px #00ff9d) drop-shadow(0 0 18px rgba(0,255,157,.65))" }}
              />
            </svg>
          </div>
        )}
      </div>
    </>
  );
}
