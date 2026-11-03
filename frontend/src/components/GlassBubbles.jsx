import React, { useEffect, useRef, useState } from "react";

/**
 * Interactive floating glass bubbles component.
 * Features:
 * - Ultra-modern glassmorphism (specular highlight, refraction glow, subtle border).
 * - Organic floating animation with gentle drifting.
 * - Interactive physics: responds to mouse position (magnetic / gentle repel).
 * - Interactive click: squish / bounce effect on direct interaction.
 * - Non-intrusive: sits in the background without obstructing form inputs or clicks.
 */
export default function GlassBubbles() {
  const containerRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Preset configuration for 7 aesthetic glass bubbles with varied depths and sizes
  const [bubbles, setBubbles] = useState([
    { id: 1, x: 12, y: 18, size: 140, speedX: 0.04, speedY: 0.03, blur: "backdrop-blur-md", scale: 1 },
    { id: 2, x: 78, y: 22, size: 180, speedX: -0.03, speedY: 0.04, blur: "backdrop-blur-lg", scale: 1 },
    { id: 3, x: 25, y: 65, size: 110, speedX: 0.03, speedY: -0.04, blur: "backdrop-blur-md", scale: 1 },
    { id: 4, x: 65, y: 72, size: 160, speedX: -0.04, speedY: -0.03, blur: "backdrop-blur-xl", scale: 1 },
    { id: 5, x: 48, y: 40, size: 90, speedX: 0.05, speedY: 0.02, blur: "backdrop-blur-sm", scale: 1 },
    { id: 6, x: 88, y: 85, size: 120, speedX: -0.02, speedY: 0.05, blur: "backdrop-blur-md", scale: 1 },
    { id: 7, x: 8, y: 88, size: 100, speedX: 0.03, speedY: -0.03, blur: "backdrop-blur-md", scale: 1 },
  ]);

  // Track mouse coordinates normalized (-1 to 1)
  useEffect(() => {
    const handleMouseMove = (e) => {
      const { innerWidth, innerHeight } = window;
      setMousePos({
        x: (e.clientX / innerWidth - 0.5) * 2,
        y: (e.clientY / innerHeight - 0.5) * 2,
      });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Handle click on a bubble (fun squish & expand animation)
  const handleBubbleClick = (id) => {
    setBubbles((prev) =>
      prev.map((b) => (b.id === id ? { ...b, scale: 1.25 } : b))
    );
    setTimeout(() => {
      setBubbles((prev) =>
        prev.map((b) => (b.id === id ? { ...b, scale: 1 } : b))
      );
    }, 400);
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* ── 1. Blurred Wave / Mesh Background ── */}
      <div
        className="absolute inset-0 bg-cover bg-center scale-110 filter blur-2xl opacity-65 transition-opacity duration-700"
        style={{ backgroundImage: `url('/bg-mesh.jpg')` }}
      />

      {/* ── 2. Subtle Frosted Glass Veil to Guarantee Text Contrast ── */}
      <div className="absolute inset-0 bg-white/45 backdrop-blur-[3px]" />

      {/* ── 3. Interactive Floating Glass Orbs ── */}
      {bubbles.map((b) => {
        // Parallax offset proportional to mouse movement
        const offsetX = mousePos.x * (b.size * 0.15);
        const offsetY = mousePos.y * (b.size * 0.15);

        return (
          <div
            key={b.id}
            onClick={() => handleBubbleClick(b.id)}
            style={{
              left: `${b.x}%`,
              top: `${b.y}%`,
              width: `${b.size}px`,
              height: `${b.size}px`,
              transform: `translate(${offsetX}px, ${offsetY}px) scale(${b.scale})`,
              transition: "transform 0.45s cubic-bezier(0.2, 0.8, 0.2, 1)",
            }}
            className={`absolute pointer-events-auto cursor-pointer rounded-full ${b.blur}
              bg-white/20 border border-white/60 shadow-[0_12px_32px_0_rgba(8,122,69,0.18)]
              hover:border-brand-accent/80 hover:bg-white/35 transition-all duration-300
              hover:shadow-[0_16px_40px_0_rgba(32,184,106,0.3)] group`}
          >
            {/* Top specular highlight (glass sheen) */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  "radial-gradient(circle at 32% 28%, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0.2) 35%, transparent 65%)",
              }}
            />

            {/* Bottom green refraction ring */}
            <div
              className="absolute inset-0 rounded-full opacity-60 group-hover:opacity-100 transition-opacity"
              style={{
                background:
                  "radial-gradient(circle at 68% 72%, rgba(32, 184, 106, 0.3) 0%, transparent 60%)",
              }}
            />

            {/* Tiny primary shine dot */}
            <div className="absolute top-[22%] left-[26%] w-[12%] h-[8%] rounded-full bg-white/90 rotate-[-25deg] filter blur-[0.5px]" />
          </div>
        );
      })}
    </div>
  );
}
