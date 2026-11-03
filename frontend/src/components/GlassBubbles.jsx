import React, { useEffect, useRef } from "react";

/**
 * Interactive floating glass bubbles component.
 * Features:
 * - Uses exact green wave wallpaper with refined, subtle blur so the luxurious folds remain visible.
 * - Continuous organic random floating (butter-smooth 60-120fps via requestAnimationFrame & GPU translate3d).
 * - Interactive physics: dynamic repulsion and reactive velocity when cursor approaches.
 * - Click interaction: spring bounce & expansion effect on direct click.
 * - Ultra-modern glassmorphism (specular sheen, refraction edge, and ambient green glow).
 */
export default function GlassBubbles() {
  const containerRef = useRef(null);
  const bubbleRefs = useRef([]);
  const bubblesData = useRef([]);
  const mouseRef = useRef({ x: -9999, y: -9999, active: false });
  const animFrameId = useRef(null);

  // Initial bubble configuration
  const BUBBLE_COUNT = 8;

  useEffect(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Initialize bubble physics data
    bubblesData.current = Array.from({ length: BUBBLE_COUNT }, (_, i) => {
      const size = 90 + ((i * 37) % 110); // sizes between 90px and 200px
      return {
        id: i,
        size,
        // Start scattered nicely across the screen
        x: (width * (0.1 + (i * 0.12))) % (width - size),
        y: (height * (0.08 + (i * 0.14))) % (height - size),
        // Base floating velocity (slow, perpetual)
        vx: (Math.sin(i * 1.7) * 0.4 + 0.2) * (i % 2 === 0 ? 1 : -1),
        vy: (Math.cos(i * 1.3) * 0.35 + 0.15) * (i % 3 === 0 ? 1 : -1),
        // Per-bubble oscillation params for smooth organic drifting
        freqX: 0.0012 + (i * 0.0003),
        freqY: 0.0015 + (i * 0.0002),
        phase: i * 1.1,
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
      // Keep bubbles inside bounds on resize
      const w = window.innerWidth;
      const h = window.innerHeight;
      bubblesData.current.forEach((b) => {
        b.x = Math.max(0, Math.min(w - b.size, b.x));
        b.y = Math.max(0, Math.min(h - b.size, b.y));
      });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("resize", handleResize);

    let lastTime = performance.now();

    // Physics Animation Loop
    const animate = (time) => {
      const dt = Math.min(32, time - lastTime);
      lastTime = time;

      const w = window.innerWidth;
      const h = window.innerHeight;
      const mouse = mouseRef.current;
      const REPEL_RADIUS = 220; // Radius where cursor exerts magnetic/repulsive force
      const REPEL_STRENGTH = 0.55;

      bubblesData.current.forEach((b, idx) => {
        const el = bubbleRefs.current[idx];
        if (!el) return;

        // 1. Organic gentle sinusoidal force (ensures bubbles perpetually roam around)
        const organicForceX = Math.sin(time * b.freqX + b.phase) * 0.05;
        const organicForceY = Math.cos(time * b.freqY + b.phase) * 0.05;
        b.vx += organicForceX;
        b.vy += organicForceY;

        // 2. Cursor interaction physics (repel force when mouse comes near)
        if (mouse.active) {
          const centerX = b.x + b.size / 2;
          const centerY = b.y + b.size / 2;
          const dx = centerX - mouse.x;
          const dy = centerY - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < REPEL_RADIUS && dist > 1) {
            const force = (1 - dist / REPEL_RADIUS) * REPEL_STRENGTH;
            b.vx += (dx / dist) * force * 1.8;
            b.vy += (dy / dist) * force * 1.8;
            // Slight reactive scale expansion when near cursor
            b.targetScale = 1.08;
          } else {
            b.targetScale = 1;
          }
        } else {
          b.targetScale = 1;
        }

        // 3. Smooth scale interpolation
        b.scale += (b.targetScale - b.scale) * 0.1;

        // 4. Natural velocity damping & speed cap (keeps drifting serene & slow)
        const currentSpeed = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
        const MAX_SPEED = 2.4;
        const MIN_SPEED = 0.25;

        if (currentSpeed > MAX_SPEED) {
          b.vx = (b.vx / currentSpeed) * MAX_SPEED;
          b.vy = (b.vy / currentSpeed) * MAX_SPEED;
        }

        // Gentle friction towards baseline slow drift
        b.vx *= 0.985;
        b.vy *= 0.985;

        if (currentSpeed < MIN_SPEED) {
          b.vx += (Math.random() - 0.5) * 0.08;
          b.vy += (Math.random() - 0.5) * 0.08;
        }

        // 5. Update coordinates
        b.x += b.vx * (dt / 16.6);
        b.y += b.vy * (dt / 16.6);

        // 6. Soft boundary containment (bounce gently off viewport edges)
        const margin = 20;
        if (b.x < margin) {
          b.x = margin;
          b.vx = Math.abs(b.vx) * 0.8;
        } else if (b.x > w - b.size - margin) {
          b.x = w - b.size - margin;
          b.vx = -Math.abs(b.vx) * 0.8;
        }

        if (b.y < margin) {
          b.y = margin;
          b.vy = Math.abs(b.vy) * 0.8;
        } else if (b.y > h - b.size - margin) {
          b.y = h - b.size - margin;
          b.vy = -Math.abs(b.vy) * 0.8;
        }

        // 7. Apply GPU hardware accelerated transform directly
        el.style.transform = `translate3d(${b.x}px, ${b.y}px, 0) scale(${b.scale})`;
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

  // Handle direct click bounce
  const handleBubbleClick = (index) => {
    const b = bubblesData.current[index];
    if (b) {
      b.scale = 1.35;
      b.vx += (Math.random() - 0.5) * 3;
      b.vy += (Math.random() - 0.5) * 3;
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

      {/* ── 3. Interactive Floating Glass Orbs ── */}
      {Array.from({ length: BUBBLE_COUNT }).map((_, i) => {
        const size = 90 + ((i * 37) % 110);
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
              hover:border-brand-accent hover:bg-white/35 transition-colors duration-300
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
              className="absolute inset-0 rounded-full opacity-65 group-hover:opacity-100 transition-opacity"
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
