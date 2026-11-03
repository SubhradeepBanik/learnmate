import React, { useEffect, useRef } from "react";

/**
 * Interactive floating glass bubbles component with realistic water buoyancy physics.
 * Features:
 * - Ultra-soothing, tranquil motion mimicking bubbles gently floating & bobbing on calm water.
 * - Fluid viscosity & drag (high fluid resistance prevents harsh or fast movements).
 * - Gentle sinusoidal water swell (vertical bobbing and subtle horizontal drift).
 * - Fluid wake cursor reaction: moving the cursor smoothly parts the water and gently nudges bubbles.
 * - Hardware-accelerated GPU render (translate3d & rotate at 60-120fps with zero re-render overhead).
 */
export default function GlassBubbles() {
  const containerRef = useRef(null);
  const bubbleRefs = useRef([]);
  const bubblesData = useRef([]);
  const mouseRef = useRef({ x: -9999, y: -9999, active: false });
  const animFrameId = useRef(null);

  const BUBBLE_COUNT = 8;

  useEffect(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Initialize bubble water-buoyancy data
    bubblesData.current = Array.from({ length: BUBBLE_COUNT }, (_, i) => {
      const size = 95 + ((i * 33) % 95); // sizes between 95px and 190px
      return {
        id: i,
        size,
        // Evenly spread across the viewport
        x: (width * (0.08 + (i * 0.12))) % (width - size),
        y: (height * (0.1 + (i * 0.13))) % (height - size),
        // Very tranquil baseline water current velocity
        vx: (Math.sin(i * 1.5) * 0.08 + 0.04) * (i % 2 === 0 ? 1 : -1),
        vy: (Math.cos(i * 1.2) * 0.06 + 0.03) * (i % 3 === 0 ? 1 : -1),
        // Slow water wave bobbing frequencies (subtle and rhythmic)
        bobFreqY: 0.00075 + (i * 0.00008),
        bobFreqX: 0.00055 + (i * 0.00006),
        phase: i * 1.35,
        scale: 1,
        targetScale: 1,
      };
    });

    // Track mouse coordinates
    const handleMouseMove = (e) => {
      mouseRef.current = {
        x: e.clientX,
        y: e.clientY,
        active: true,
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
      mouseRef.current.x = -9999;
      mouseRef.current.y = -9999;
    };

    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      bubblesData.current.forEach((b) => {
        b.x = Math.max(10, Math.min(w - b.size - 10, b.x));
        b.y = Math.max(10, Math.min(h - b.size - 10, b.y));
      });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("resize", handleResize);

    let lastTime = performance.now();

    // Water Physics Animation Loop
    const animate = (time) => {
      const dt = Math.min(32, time - lastTime);
      lastTime = time;

      const w = window.innerWidth;
      const h = window.innerHeight;
      const mouse = mouseRef.current;
      const REPEL_RADIUS = 260; // Fluid wake radius around cursor

      bubblesData.current.forEach((b, idx) => {
        const el = bubbleRefs.current[idx];
        if (!el) return;

        // 1. Water Current Swell: very soft, gentle ocean/lake tidal drift
        const waterCurrentX = Math.sin(time * 0.0004 + b.phase) * 0.008;
        const waterCurrentY = Math.cos(time * 0.0005 + b.phase) * 0.008;
        b.vx += waterCurrentX;
        b.vy += waterCurrentY;

        // 2. Gentle Cursor Wake: smooth water displacement when cursor nears
        if (mouse.active) {
          const centerX = b.x + b.size / 2;
          const centerY = b.y + b.size / 2;
          const dx = centerX - mouse.x;
          const dy = centerY - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < REPEL_RADIUS && dist > 1) {
            // Smooth bell curve displacement (like parting water ripples)
            const wakeFactor = Math.pow(1 - dist / REPEL_RADIUS, 1.8);
            const force = wakeFactor * 0.22; // Gentle, liquid push
            b.vx += (dx / dist) * force;
            b.vy += (dy / dist) * force;
            b.targetScale = 1.04;
          } else {
            b.targetScale = 1;
          }
        } else {
          b.targetScale = 1;
        }

        // 3. Fluid scale dampening
        b.scale += (b.targetScale - b.scale) * 0.05;

        // 4. Fluid Viscosity / Hydrodynamic Drag
        // High water resistance naturally slows rapid movements down to calm drift
        b.vx *= 0.965;
        b.vy *= 0.965;

        // Hard cap on speed to guarantee it NEVER moves fast
        const MAX_WATER_SPEED = 0.55; // pixels per frame
        const currentSpeed = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
        if (currentSpeed > MAX_WATER_SPEED) {
          b.vx = (b.vx / currentSpeed) * MAX_WATER_SPEED;
          b.vy = (b.vy / currentSpeed) * MAX_WATER_SPEED;
        }

        // 5. Update position along water plane
        b.x += b.vx * (dt / 16.6);
        b.y += b.vy * (dt / 16.6);

        // 6. Smooth water surface containment (gentle turning before hitting viewport borders)
        const margin = 20;
        if (b.x < margin) {
          b.x = margin;
          b.vx = Math.abs(b.vx) * 0.7;
        } else if (b.x > w - b.size - margin) {
          b.x = w - b.size - margin;
          b.vx = -Math.abs(b.vx) * 0.7;
        }

        if (b.y < margin) {
          b.y = margin;
          b.vy = Math.abs(b.vy) * 0.7;
        } else if (b.y > h - b.size - margin) {
          b.y = h - b.size - margin;
          b.vy = -Math.abs(b.vy) * 0.7;
        }

        // 7. Water surface undulating bobbing offset (simulates floating on subtle water waves)
        const bobY = Math.sin(time * b.bobFreqY + b.phase) * 12;
        const bobX = Math.cos(time * b.bobFreqX + b.phase * 0.8) * 8;
        const bobTilt = Math.sin(time * 0.0006 + b.phase) * 2.5; // slight 2.5 degree sway

        const finalX = b.x + bobX;
        const finalY = b.y + bobY;

        // Apply hardware accelerated transform
        el.style.transform = `translate3d(${finalX}px, ${finalY}px, 0) scale(${b.scale}) rotate(${bobTilt}deg)`;
      });

      animFrameId.current = requestAnimationFrame(animate);
    };

    animFrameId.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("resize", handleResize);
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, []);

  // Gentle ripple bounce on click
  const handleBubbleClick = (index) => {
    const b = bubblesData.current[index];
    if (b) {
      b.scale = 1.18;
      b.vx += (Math.random() - 0.5) * 0.45;
      b.vy += (Math.random() - 0.5) * 0.45;
    }
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* ── 1. Wallpaper with reduced, refined blur (luxurious emerald waves visible) ── */}
      <div
        className="absolute inset-0 bg-cover bg-center scale-105 filter blur-[7px] opacity-80 transition-all duration-700"
        style={{ backgroundImage: `url('/bg-mesh.jpg')` }}
      />

      {/* ── 2. Subtle frosted glass veil to preserve foreground text contrast ── */}
      <div className="absolute inset-0 bg-white/30 backdrop-blur-[1px]" />

      {/* ── 3. Tranquil Water-Floating Glass Bubbles ── */}
      {Array.from({ length: BUBBLE_COUNT }).map((_, i) => {
        const size = 95 + ((i * 33) % 95);
        return (
          <div
            key={i}
            ref={(el) => (bubbleRefs.current[i] = el)}
            onClick={() => handleBubbleClick(i)}
            style={{
              width: `${size}px`,
              height: `${size}px`,
              willChange: "transform",
            }}
            className="absolute top-0 left-0 pointer-events-auto cursor-pointer rounded-full backdrop-blur-md
              bg-white/20 border border-white/60 shadow-[0_12px_36px_0_rgba(8,122,69,0.22)]
              hover:border-brand-accent hover:bg-white/35 transition-colors duration-500
              hover:shadow-[0_18px_46px_0_rgba(32,184,106,0.38)] group"
          >
            {/* Top specular highlight (glass curvature reflection) */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  "radial-gradient(circle at 32% 28%, rgba(255, 255, 255, 0.88) 0%, rgba(255, 255, 255, 0.22) 35%, transparent 68%)",
              }}
            />

            {/* Bottom green refraction ring */}
            <div
              className="absolute inset-0 rounded-full opacity-65 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background:
                  "radial-gradient(circle at 68% 72%, rgba(32, 184, 106, 0.35) 0%, transparent 62%)",
              }}
            />

            {/* Tiny primary shine dot */}
            <div className="absolute top-[22%] left-[26%] w-[12%] h-[8%] rounded-full bg-white/95 rotate-[-25deg] filter blur-[0.4px]" />
          </div>
        );
      })}
    </div>
  );
}
