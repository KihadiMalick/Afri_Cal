"use client";

/* ═══════════════════════════════════════════════════════════
   AUTH LAYOUT — Full immersion, zero nav bars
   Split: form (left) + ALIXEN image (right)
   Background: #0a0a0a with subtle data grid
═══════════════════════════════════════════════════════════ */

const GRID_SVG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='50' height='50' viewBox='0 0 50 50'%3E%3Cline x1='0' y1='25' x2='50' y2='25' stroke='rgba(0,255,157,0.035)' stroke-width='0.4'/%3E%3Cline x1='25' y1='0' x2='25' y2='50' stroke='rgba(0,255,157,0.035)' stroke-width='0.4'/%3E%3Ccircle cx='25' cy='25' r='0.8' fill='rgba(0,255,157,0.05)'/%3E%3C/svg%3E")`;

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');

        /* ── Root split layout ── */
        .lx-auth-root {
          min-height: 100vh;
          display: flex;
          background: #0a0a0a;
          font-family: 'Outfit', 'Poppins', sans-serif;
          position: relative;
          overflow: hidden;
        }

        /* ── Left: scrollable form panel ── */
        .lx-form-panel {
          flex: 1;
          min-width: 0;
          overflow-y: auto;
          padding: 3rem 2rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          scrollbar-width: none;
          max-width: 520px;
          margin: 0 auto;
        }
        .lx-form-panel::-webkit-scrollbar { display: none; }

        /* ── Right: ALIXEN image panel ── */
        .lx-alixen-panel {
          display: none;
          position: relative;
          flex-shrink: 0;
        }
        @media (min-width: 900px) {
          .lx-auth-root {
            overflow: hidden;
            min-height: 100vh;
          }
          .lx-form-panel {
            max-width: none;
            width: 52%;
            padding: 3rem 4rem;
            margin: 0;
          }
          .lx-alixen-panel {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-end;
            width: 48%;
            position: relative;
            overflow: hidden;
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

      {/* Background */}
      <div
        className="fixed inset-0 overflow-y-auto"
        style={{ background: "#0a0a0a", backgroundImage: GRID_SVG }}
      >
        {/* Ambient orbs */}
        <div className="pointer-events-none fixed inset-0" aria-hidden="true">
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
