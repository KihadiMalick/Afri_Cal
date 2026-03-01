/* ═══════════════════════════════════════════════════════════
   AUTH LAYOUT — Server Component (no "use client")
   Being a Server Component lets Next.js hoist the <style>
   tag into <head> so CSS is applied BEFORE first paint —
   zero flash of the locale layout's bg-brand-cream.
   Split: form (left) + ALIXEN image (right, desktop only)
   Background: #0a0a0a with subtle data grid
═══════════════════════════════════════════════════════════ */

const GRID_SVG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='50' height='50' viewBox='0 0 50 50'%3E%3Cline x1='0' y1='25' x2='50' y2='25' stroke='rgba(0,255,157,0.035)' stroke-width='0.4'/%3E%3Cline x1='25' y1='0' x2='25' y2='50' stroke='rgba(0,255,157,0.035)' stroke-width='0.4'/%3E%3Ccircle cx='25' cy='25' r='0.8' fill='rgba(0,255,157,0.05)'/%3E%3C/svg%3E")`;

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');

        /* ══════════════════════════════════════════════════
           HARD ISOLATION — override locale layout completely
           ══════════════════════════════════════════════════ */
        html, body {
          background: #0a0a0a !important;
          overflow-x: hidden !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        /* Remove MobileNav bottom padding injected by locale layout */
        body > main,
        body main {
          padding: 0 !important;
          margin: 0 !important;
          background: transparent !important;
        }

        /* ── Root split layout ── */
        .lx-auth-root {
          min-height: 100vh;
          width: 100%;
          display: flex;
          background: #0a0a0a;
          font-family: 'Outfit', 'Poppins', sans-serif;
          position: relative;
          overflow: hidden;   /* clip Framer Motion x-slide overflow on mobile */
        }

        /* ── Left: scrollable form panel ── */
        .lx-form-panel {
          flex: 1;
          min-width: 0;
          width: 100%;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 2.5rem 1.5rem 3rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          scrollbar-width: none;
        }
        .lx-form-panel::-webkit-scrollbar { display: none; }

        /* ── Mobile ALIXEN mini-banner (< 900px) ── */
        .lx-alixen-mobile {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
          padding: 0.6rem 0.9rem;
          border-radius: 1rem;
          background: rgba(0,255,157,0.04);
          border: 1px solid rgba(0,255,157,0.10);
        }
        .lx-alixen-mobile-svg {
          width: 44px;
          height: 44px;
          flex-shrink: 0;
        }
        .lx-alixen-mobile-text {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(0,255,157,0.50);
          font-family: 'Courier New', monospace;
        }

        /* ── Right: ALIXEN image panel (desktop only) ── */
        .lx-alixen-panel {
          display: none;
          position: relative;
          flex-shrink: 0;
        }

        @media (min-width: 900px) {
          .lx-form-panel {
            width: 52%;
            flex: 0 0 52%;
            padding: 3rem 4rem;
          }
          .lx-alixen-panel {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-end;
            width: 48%;
            flex: 0 0 48%;
            position: relative;
            overflow: hidden;
            background: rgba(0,255,157,0.015);
            border-left: 1px solid rgba(0,255,157,0.07);
          }
          /* Hide mobile banner on desktop */
          .lx-alixen-mobile {
            display: none;
          }
        }

        /* ── Speech bubble arrow (points RIGHT toward ALIXEN, desktop only) ── */
        .lx-bubble-arrow { display: none; }
        @media (min-width: 900px) {
          .lx-bubble-arrow {
            display: block;
            position: absolute;
            right: -13px;
            top: 50%;
            transform: translateY(-50%);
            width: 0;
            height: 0;
            border-top: 9px solid transparent;
            border-bottom: 9px solid transparent;
            border-left: 13px solid rgba(0,255,157,0.16);
          }
        }

        /* ALIXEN glow behind the bird */
        .lx-alixen-glow {
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 340px;
          height: 340px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(0,255,157,0.07) 0%, rgba(0,255,157,0.02) 50%, transparent 75%);
          filter: blur(40px);
          pointer-events: none;
          z-index: 0;
        }
        .lx-alixen-label {
          position: absolute;
          bottom: 1.5rem;
          left: 50%;
          transform: translateX(-50%);
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: rgba(0,255,157,0.40);
          z-index: 2;
          font-family: 'Courier New', monospace;
        }

        /* ── LIXUM brand ── */
        .lx-brand-title {
          font-family: 'Courier New', monospace;
          font-weight: 900;
          font-size: 1.75rem;
          letter-spacing: 0.22em;
          line-height: 1;
        }
        .lx-brand-sub {
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: rgba(0,255,157,0.38);
          margin-top: 0.35rem;
        }
        .lx-x {
          color: #00ff9d;
          text-shadow: 0 0 12px #00ff9d, 0 0 28px rgba(0,255,157,.45);
        }

        /* ── Glass input ── */
        .lx-input {
          width: 100%;
          padding: 0.78rem 0.9rem 0.78rem 2.7rem;
          border-radius: 0.8rem;
          font-size: 0.875rem;
          font-family: 'Outfit', 'Poppins', sans-serif;
          color: rgba(255,255,255,0.88);
          outline: none;
          transition: border-color 0.22s ease, box-shadow 0.22s ease, background 0.22s ease;
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.08);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }
        .lx-input:focus {
          border-color: rgba(0,255,157,0.55);
          box-shadow: 0 0 0 3px rgba(0,255,157,0.07), 0 0 18px rgba(0,255,157,0.05);
          background: rgba(0,255,157,0.025);
        }
        .lx-input::placeholder { color: rgba(255,255,255,0.20); }

        /* ── Primary CTA button ── */
        .lx-btn-primary {
          padding: 0.85rem 1.5rem;
          border-radius: 0.85rem;
          font-weight: 700;
          font-size: 0.9rem;
          font-family: 'Outfit', 'Poppins', sans-serif;
          color: #030f07;
          background: #00ff9d;
          border: none;
          cursor: pointer;
          box-shadow: 0 0 28px rgba(0,255,157,0.30), 0 4px 14px rgba(0,0,0,0.25);
          transition: box-shadow 0.3s ease;
        }
        .lx-btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* ── Spinner ── */
        .lx-spinner {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid rgba(3,15,7,0.25);
          border-top-color: #030f07;
          border-radius: 50%;
          animation: lx-spin 0.65s linear infinite;
          flex-shrink: 0;
        }
        @keyframes lx-spin { to { transform: rotate(360deg); } }

        /* ── Floating ambient orbs ── */
        @keyframes lx-orb {
          0%, 100% { transform: translateY(0) scale(1);   opacity: 0.4; }
          50%       { transform: translateY(-28px) scale(1.25); opacity: 0.7; }
        }
        .lx-orb-1 { animation: lx-orb 9s ease-in-out infinite; }
        .lx-orb-2 { animation: lx-orb 7s ease-in-out infinite 2.5s; }
        .lx-orb-3 { animation: lx-orb 11s ease-in-out infinite 5s; }
      `}</style>

      {/* Full-screen dark overlay — sits above locale layout entirely */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          background: "#0a0a0a",
          backgroundImage: GRID_SVG,
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        {/* Ambient orbs */}
        <div style={{ pointerEvents: "none", position: "fixed", inset: 0 }} aria-hidden="true">
          <div className="lx-orb-1 absolute top-[12%] left-[8%] w-40 h-40 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(0,255,157,0.04), transparent 70%)", filter: "blur(45px)" }} />
          <div className="lx-orb-2 absolute top-[60%] right-[6%] w-28 h-28 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(96,165,250,0.035), transparent 70%)", filter: "blur(35px)" }} />
          <div className="lx-orb-3 absolute bottom-[18%] left-[35%] w-24 h-24 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(245,158,11,0.03), transparent 70%)", filter: "blur(30px)" }} />
        </div>

        {children}
      </div>
    </>
  );
}
