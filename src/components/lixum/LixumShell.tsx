"use client";

import { useEffect } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Home, UtensilsCrossed, Activity, CalendarDays, UserCircle, LogOut,
} from "lucide-react";
import { createClient } from "@/lib/supabase";
import { isValidLocale } from "@/i18n";

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

const SIDEBAR_BG = `${CIRCUIT_BG}, linear-gradient(180deg, #010d06 0%, #020f08 55%, #011009 100%)`;

/* ── Shared glass card style (exported for pages) ── */
export const GLASS_CARD = {
  background:          "rgba(0,8,4,0.40)",
  backdropFilter:      "blur(24px)",
  WebkitBackdropFilter:"blur(24px)",
  border:              "1px solid rgba(255,255,255,0.08)",
  boxShadow:           "0 4px 24px rgba(0,0,0,.38), inset 0 1px 0 rgba(255,255,255,.05)",
} as const;

/* ── All LIXUM CSS — injected once at shell level ── */
export const LIXUM_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');

  /* Suppress outer scrollbars */
  html::-webkit-scrollbar, body::-webkit-scrollbar { display:none!important; width:0!important; }
  html, body { scrollbar-width:none!important; }

  /* LIXUM inner scroll — no scrollbar track */
  .lixum-main { scrollbar-width:none; -ms-overflow-style:none; }
  .lixum-main::-webkit-scrollbar { display:none; width:0; }

  @keyframes lixum-heartbeat {
    0%,100% { transform:translate(-50%,-50%) scale(1);   opacity:.50; }
    14%     { transform:translate(-50%,-50%) scale(1.18); opacity:.85; }
    28%     { transform:translate(-50%,-50%) scale(.97);  opacity:.40; }
    42%     { transform:translate(-50%,-50%) scale(1.09); opacity:.70; }
    65%     { transform:translate(-50%,-50%) scale(1);    opacity:.50; }
  }
  @keyframes lixum-ring {
    0%,100% { transform:translate(-50%,-50%) scale(1);   opacity:.14; }
    14%     { transform:translate(-50%,-50%) scale(1.22); opacity:.28; }
    42%     { transform:translate(-50%,-50%) scale(1.12); opacity:.20; }
  }
  @keyframes lixum-fadein {
    from { opacity:0; transform:translateY(10px); }
    to   { opacity:1; transform:translateY(0);    }
  }

  /* Page card-stack transition — card deposited from below */
  @keyframes lixum-page-enter {
    from { opacity:0; transform:translateY(20px) scale(0.984); filter:blur(1.5px); }
    to   { opacity:1; transform:translateY(0)     scale(1);     filter:blur(0);    }
  }
  .lixum-page-enter {
    animation: lixum-page-enter 0.32s cubic-bezier(0.22, 1, 0.36, 1) both;
    will-change: transform, opacity;
  }

  /* Monospace numbers */
  .lixum-num {
    font-family:'Courier New','Roboto Mono',monospace;
    font-variant-numeric:tabular-nums;
    letter-spacing:0.04em;
  }

  /* Glass card hover */
  .lixum-card {
    transition: transform .28s cubic-bezier(.25,.46,.45,.94),
                box-shadow .28s cubic-bezier(.25,.46,.45,.94),
                border-color .28s ease,
                background .28s ease;
  }
  .lixum-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 50px rgba(0,255,157,.10), 0 6px 18px rgba(0,0,0,.40)!important;
    border-color: rgba(0,255,157,.18)!important;
    background: rgba(0,255,157,.04)!important;
  }
  .lixum-card:active {
    transform: scale(.985) translateY(-1px);
    box-shadow: 0 6px 20px rgba(0,0,0,.30)!important;
  }

  /* Vitality card hover */
  .lixum-vitality-card {
    transition: transform .28s cubic-bezier(.25,.46,.45,.94),
                box-shadow .28s cubic-bezier(.25,.46,.45,.94),
                border-color .28s ease;
  }
  .lixum-vitality-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 24px 64px rgba(0,255,157,.14), 0 8px 24px rgba(0,0,0,.45)!important;
    border-color: rgba(0,255,157,.24)!important;
  }
  .lixum-vitality-card:active { transform: scale(.990) translateY(-1px); }

  /* Entrance stagger */
  .lixum-animate { animation: lixum-fadein .40s ease-out both; }

  /* Neon X */
  .lixum-x {
    color:#00ff9d;
    text-shadow: 0 0 12px #00ff9d, 0 0 28px rgba(0,255,157,.50), 0 0 50px rgba(0,255,157,.20);
  }

  /* LIXUM form inputs */
  .lixum-input {
    background: rgba(0,8,4,0.55);
    border: 1px solid rgba(255,255,255,0.10);
    border-radius: 0.75rem;
    color: rgba(255,255,255,0.85);
    padding: 0.6rem 0.9rem;
    font-family: 'Outfit','Poppins',sans-serif;
    font-size: 0.875rem;
    outline: none;
    transition: border-color .2s, box-shadow .2s;
    width: 100%;
  }
  .lixum-input:focus {
    border-color: rgba(0,255,157,.35);
    box-shadow: 0 0 0 3px rgba(0,255,157,.08);
  }
  .lixum-input::placeholder { color: rgba(255,255,255,.25); }

  /* Loader spinner (re-styled for dark bg) */
  .lixum-spin {
    width: 28px; height: 28px;
    border: 2px solid rgba(0,255,157,.15);
    border-top-color: #00ff9d;
    border-radius: 50%;
    animation: lixum-spin-anim 0.7s linear infinite;
    box-shadow: 0 0 12px rgba(0,255,157,.4);
  }
  @keyframes lixum-spin-anim { to { transform: rotate(360deg); } }
`;

/* ══════════════════════════════════════════════════
   LIXUM SHELL — wraps all dashboard pages
   ══════════════════════════════════════════════════ */
export default function LixumShell({ children }: { children: React.ReactNode }) {
  const params   = useParams();
  const router   = useRouter();
  const pathname = usePathname();
  const locale   = isValidLocale(params?.locale as string) ? (params.locale as "fr" | "en") : "fr";
  const supabase = createClient();

  /* Lock scroll on html + body so old Africount bg never bleeds through */
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

      {/* Full-screen overlay — z-[60] sits above Navbar/MobileNav */}
      <div
        className="fixed inset-0 z-[60] text-white flex overflow-hidden"
        style={{
          background: "#020c07",
          backgroundImage: CIRCUIT_BG,
          fontFamily: "'Outfit','Poppins',sans-serif",
        }}
      >
        {/* ── Heartbeat pulse (CSS-only, GPU-composited) ── */}
        <div aria-hidden="true" className="pointer-events-none select-none">
          <div style={{
            position:"fixed", top:"50%", left:"50%",
            width:"55vmin", height:"55vmin", borderRadius:"50%",
            background:"radial-gradient(circle, rgba(0,255,157,.18) 0%, rgba(0,255,157,.06) 40%, transparent 70%)",
            animation:"lixum-heartbeat 4s cubic-bezier(.36,.07,.19,.97) infinite",
            willChange:"transform, opacity",
          }} />
          <div style={{
            position:"fixed", top:"50%", left:"50%",
            width:"78vmin", height:"78vmin", borderRadius:"50%",
            border:"1px solid rgba(0,255,157,.10)",
            animation:"lixum-ring 4s cubic-bezier(.36,.07,.19,.97) infinite",
            willChange:"transform, opacity",
          }} />
        </div>

        {/* ── Sidebar ── */}
        <aside
          className="flex flex-shrink-0 flex-col items-center pt-6 pb-5 w-14 md:w-[5.5rem]"
          style={{
            borderRadius:"0 24px 24px 0",
            backgroundImage: SIDEBAR_BG,
            borderRight:"1px solid rgba(0,255,157,.06)",
            boxShadow:"4px 0 32px rgba(0,0,0,.55), inset -1px 0 0 rgba(0,255,157,.04)",
          }}
        >
          {/* Logo badge */}
          <div className="flex flex-col items-center mb-6 flex-shrink-0">
            <div
              className="w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center select-none mb-1"
              style={{
                background:"rgba(0,255,157,.06)",
                border:"1px solid rgba(0,255,157,.18)",
                boxShadow:"0 0 16px rgba(0,255,157,.14), inset 0 1px 0 rgba(255,255,255,.05)",
              }}
            >
              <span
                className="font-black text-xs md:text-sm"
                style={{ fontFamily:"'Courier New',monospace", letterSpacing:"0.05em" }}
              >
                <span style={{ color:"#7d8590" }}>L</span>
                <span className="lixum-x">X</span>
              </span>
            </div>
            <p
              className="text-[6px] md:text-[7px] uppercase font-bold tracking-[.28em]"
              style={{ color:"rgba(0,255,157,.40)" }}
            >
              lixum
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
                  style={isActive ? {
                    backgroundColor:"rgba(0,255,157,.06)",
                    boxShadow:"inset 0 2px 8px rgba(0,0,0,.5), 0 0 12px rgba(0,255,157,.08)",
                  } : undefined}
                  onMouseEnter={e => {
                    if (!isActive) (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,.03)";
                  }}
                  onMouseLeave={e => {
                    if (!isActive) (e.currentTarget as HTMLElement).style.backgroundColor = "";
                  }}
                >
                  {/* Active indicator bar */}
                  {isActive && (
                    <span
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full"
                      style={{ background:"#00ff9d", boxShadow:"0 0 10px #00ff9d, 0 0 20px rgba(0,255,157,.4)" }}
                    />
                  )}
                  <Icon
                    size={30}
                    strokeWidth={isActive ? 2 : 1.5}
                    style={{
                      color: isActive ? "#00ff9d" : "rgba(255,255,255,.55)",
                      filter: isActive
                        ? "drop-shadow(0 0 6px rgba(0,255,157,.7)) drop-shadow(0 0 14px rgba(0,255,157,.3))"
                        : "none",
                      transition:"color .2s, filter .2s",
                    }}
                  />
                  <span
                    className="hidden md:block text-[9px] uppercase font-bold tracking-widest"
                    style={{ color: isActive ? "rgba(0,255,157,.9)" : "rgba(255,255,255,.50)" }}
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
            style={{ color:"rgba(255,255,255,.45)" }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.color = "#f87171";
              (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(239,68,68,.05)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,.45)";
              (e.currentTarget as HTMLElement).style.backgroundColor = "";
            }}
          >
            <LogOut size={26} strokeWidth={1.5} />
            <span className="hidden md:block text-[9px] uppercase font-bold tracking-widest">
              {locale === "fr" ? "Sortir" : "Exit"}
            </span>
          </button>
        </aside>

        {/* ── Main content — page transition wrapper ── */}
        <main className="lixum-main flex-1 overflow-y-auto relative">
          {/* Static ambient glow */}
          <div
            className="pointer-events-none fixed top-0 left-[20%] w-72 h-72 rounded-full"
            style={{
              background:"radial-gradient(circle, rgba(0,255,157,.05) 0%, transparent 70%)",
              filter:"blur(50px)",
            }}
          />
          {/*
            key={pathname} forces React to remount this div on every route change
            → re-triggers lixum-page-enter animation = "card deposited from below" effect
          */}
          <div key={pathname} className="lixum-page-enter min-h-full">
            {children}
          </div>
        </main>
      </div>
    </>
  );
}
