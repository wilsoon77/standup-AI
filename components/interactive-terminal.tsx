"use client";

import React, { useRef, useState } from "react";
import { ScrambleText } from "./scramble-text";

export function InteractiveTerminal() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [transform, setTransform] = useState("");

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setPosition({ x, y });

    // Calculate 3D tilt (max 8 degrees for subtlety)
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;

    // Scale slightly on hover for visual pop
    setTransform(`perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`);
  };

  const handleMouseEnter = () => setIsHovered(true);

  const handleMouseLeave = () => {
    setIsHovered(false);
    // Smoothly return to flat state when mouse leaves
    setTransform("perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)");
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-24 animate-fade-in mt-12" style={{ animationDelay: "300ms", perspective: "1200px" }}>
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="relative rounded-xl border border-border bg-card/50 glass shadow-2xl overflow-hidden backdrop-blur-md transition-all duration-200 ease-out will-change-transform cursor-crosshair"
        style={{ transform, transformStyle: "preserve-3d" }}
      >
        {/* Interactive Spotlight (soft green glow following cursor) */}
        <div
          className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 z-0"
          style={{
            opacity: isHovered ? 1 : 0,
            background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(0, 255, 157, 0.08), transparent 40%)`,
          }}
        />

        {/* Glare/Shine effect on the glass surface */}
        <div
          className="pointer-events-none absolute inset-0 opacity-0 mix-blend-overlay transition duration-300 z-0"
          style={{
            opacity: isHovered ? 0.5 : 0,
            background: `radial-gradient(800px circle at ${position.x}px ${position.y}px, rgba(255, 255, 255, 0.15), transparent 40%)`,
          }}
        />

        {/* Content wrapper with translateZ to separate it from background during 3D tilt */}
        <div style={{ transform: "translateZ(40px)" }} className="relative z-10">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 dark:border-white/10 bg-muted/40">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/80 shadow-sm" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80 shadow-sm" />
              <div className="w-3 h-3 rounded-full bg-green-500/80 shadow-sm" />
            </div>
            <div className="w-full text-center pr-12 text-xs font-mono text-muted-foreground">
              <ScrambleText text="~/standup-ai/output.md" className="cursor-crosshair" />
            </div>
          </div>
          <div className="p-8 font-mono text-sm text-left text-muted-foreground leading-relaxed">
            <span className="text-primary">➜</span> <span className="text-foreground font-semibold drop-shadow-sm">standup check</span> <span className="opacity-70">--user</span><br />
            <br />
            {'>'} <span className="text-foreground">Ayer:</span><br />
            {'  '}• Me dediqué a limpiar el "código espagueti" que dejamos en el último sprint.<br />
            {'  '}• Pasé 3 horas buscando un punto y coma que rompió el build de producción.<br />
            <br />
            {'>'} <span className="text-foreground">Hoy:</span><br />
            {'  '}• Intentaré que la app haga algo más que existir.<br />
            {'  '}• Intentaré no romper nada mientras implemento la "pequeña mejora" que pidió el cliente a última hora.<br />
            <br />
            {'>'} <span className="text-foreground">Bloqueadores:</span><br />
            {'  '}• Mi café se enfrió mientras debugueaba y eso es un impedimento crítico de nivel 1.<br />
            <br />
            <span className="text-primary">➜</span> <span className="text-foreground font-semibold drop-shadow-sm">De tus commits a tu standup. En segundos.</span><br />
          </div>
        </div>
      </div>
    </div>
  );
}
