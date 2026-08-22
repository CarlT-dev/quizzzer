"use client";

import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
  phase: number;
  speed: number;
  color: string;
};

const COLORS = [
  "rgba(99, 102, 241, 0.35)",
  "rgba(168, 85, 247, 0.30)",
  "rgba(236, 72, 153, 0.28)",
  "rgba(14, 165, 233, 0.30)",
];

export function LiquidParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrame: number;
    let particles: Particle[] = [];

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = window.innerWidth;
      const height = window.innerHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;

      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const createParticles = () => {
      const count = window.innerWidth < 768 ? 8 : 14;
      const padding = 200;

      particles = Array.from({ length: count }, () => ({
        x: -padding + Math.random() * (window.innerWidth + padding * 2),
        y: -padding + Math.random() * (window.innerHeight + padding * 2),
        radius: 180 + Math.random() * 220,
        vx: (Math.random() - 0.5) * 0.75,
        vy: (Math.random() - 0.5) * 0.75,
        phase: Math.random() * Math.PI * 2,
        speed: 0.0006 + Math.random() * 0.001,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      }));
    };

    const animate = (time: number) => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      for (const particle of particles) {
        const wobbleX =
          Math.sin(time * particle.speed + particle.phase) * 1.2;
        const wobbleY =
          Math.cos(time * particle.speed * 0.8 + particle.phase) * 1.2;

        particle.x += particle.vx + wobbleX;
        particle.y += particle.vy + wobbleY;

        const buffer = particle.radius * 1.2;

        if (particle.x < -buffer) particle.x = window.innerWidth + buffer;
        if (particle.x > window.innerWidth + buffer) particle.x = -buffer;
        if (particle.y < -buffer) particle.y = window.innerHeight + buffer;
        if (particle.y > window.innerHeight + buffer) particle.y = -buffer;

        const gradient = ctx.createRadialGradient(
          particle.x,
          particle.y,
          0,
          particle.x,
          particle.y,
          particle.radius
        );

        gradient.addColorStop(0, particle.color);
        gradient.addColorStop(0.2, particle.color);
        gradient.addColorStop(0.65, "rgba(255, 255, 255, 0.05)");
        gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrame = requestAnimationFrame(animate);
    };

    resize();
    createParticles();
    animationFrame = requestAnimationFrame(animate);

    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 blur-3xl opacity-80"
    />
  );
}