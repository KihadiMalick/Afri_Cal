"use client";

/* ═══════════════════════════════════════════════════════════
   AUTH LAYOUT — Full immersion, no nav bars
   Background: Deep black #050805 + subtle bio-molecular grid
   ═══════════════════════════════════════════════════════════ */

const GRID_BG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cline x1='0' y1='30' x2='60' y2='30' stroke='rgba(0,255,157,0.04)' stroke-width='0.3'/%3E%3Cline x1='30' y1='0' x2='30' y2='60' stroke='rgba(0,255,157,0.04)' stroke-width='0.3'/%3E%3Ccircle cx='30' cy='30' r='1' fill='rgba(0,255,157,0.06)'/%3E%3C/svg%3E")`;

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');

        /* ── Glass input ── */
        .lx-glass-input {
          width: 100%;
          padding: 0.8rem 0.9rem 0.8rem 2.8rem;
          border-radius: 0.75rem;
          font-size: 0.9rem;
          font-family: 'Outfit','Poppins',sans-serif;
          color: rgba(255,255,255,0.88);
          outline: none;
          transition: border-color 0.25s, box-shadow 0.25s, background 0.25s;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.10);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }
        .lx-glass-input:focus {
          border-color: rgba(0,255,157,0.50);
          box-shadow: 0 0 0 3px rgba(0,255,157,0.08), 0 0 20px rgba(0,255,157,0.06);
          background: rgba(0,255,157,0.03);
        }
        .lx-glass-input::placeholder {
          color: rgba(255,255,255,0.22);
        }

        /* ── Next button (neon green) ── */
        .lx-next-btn {
          padding: 0.85rem 1.5rem;
          border-radius: 0.85rem;
          font-weight: 700;
          font-size: 0.9rem;
          font-family: 'Outfit','Poppins',sans-serif;
          color: #020c07;
          background: #00ff9d;
          border: none;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1);
          box-shadow: 0 0 28px rgba(0,255,157,0.35), 0 4px 16px rgba(0,0,0,0.30);
        }
        .lx-next-btn:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 0 40px rgba(0,255,157,0.50), 0 8px 24px rgba(0,0,0,0.35);
        }
        .lx-next-btn:active {
          transform: translateY(0) scale(0.98);
        }
        .lx-next-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        /* ── Data Sync spinner ── */
        .lx-data-sync {
          display: inline-block;
          width: 18px;
          height: 18px;
          border: 2px solid rgba(2,12,7,0.25);
          border-top-color: #020c07;
          border-radius: 50%;
          animation: lx-sync-spin 0.65s linear infinite;
        }
        @keyframes lx-sync-spin { to { transform: rotate(360deg); } }

        /* ── Slide animations ── */
        @keyframes alixen-slide-right {
          from { opacity: 0; transform: translateX(40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes alixen-slide-left {
          from { opacity: 0; transform: translateX(-40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .alixen-slide-in-right {
          animation: alixen-slide-right 0.38s cubic-bezier(0.22,1,0.36,1) both;
        }
        .alixen-slide-in-left {
          animation: alixen-slide-left 0.38s cubic-bezier(0.22,1,0.36,1) both;
        }

        /* ── Holographic floating particles ── */
        @keyframes lx-float-particle {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.3; }
          50%      { transform: translateY(-30px) scale(1.3); opacity: 0.6; }
        }
      `}</style>

      <div
        className="fixed inset-0 overflow-y-auto"
        style={{
          background: "#050805",
          backgroundImage: GRID_BG,
          fontFamily: "'Outfit','Poppins',sans-serif",
        }}
      >
        {/* Bio-molecular floating accents */}
        <div className="pointer-events-none fixed inset-0" aria-hidden="true">
          <div className="absolute top-[15%] left-[10%] w-32 h-32 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(0,255,157,0.04), transparent 70%)", filter: "blur(40px)", animation: "lx-float-particle 8s ease-in-out infinite" }} />
          <div className="absolute top-[55%] right-[8%] w-24 h-24 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(96,165,250,0.04), transparent 70%)", filter: "blur(30px)", animation: "lx-float-particle 6s ease-in-out infinite 2s" }} />
          <div className="absolute bottom-[20%] left-[30%] w-20 h-20 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(245,158,11,0.03), transparent 70%)", filter: "blur(25px)", animation: "lx-float-particle 7s ease-in-out infinite 4s" }} />
        </div>

        {children}
      </div>
    </>
  );
}
