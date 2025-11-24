'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export default function CodeBackgroundAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Cadenas de código variadas
    const codeSnippets = [
      'const editor = new IDE()',
      'git commit -m "fix"',
      'async function()',
      '0x1A2B3C4D',
      'import { React }',
      '<Component />',
      '01010101',
      'npm install',
      'export default',
      'interface Props',
      '{ code: true }',
      'function* gen()',
      'await fetch()',
      'useState([])',
      'try { catch }',
      '=> { return }',
      'class CodeEditor',
      'git push origin',
      'console.log()',
      'new Promise()'
    ];

    const container = containerRef.current;
    const chains: HTMLDivElement[] = [];

    // Crear 25 cadenas distribuidas por toda la pantalla
    for (let i = 0; i < 25; i++) {
      const chain = document.createElement('div');
      const text = codeSnippets[Math.floor(Math.random() * codeSnippets.length)];

      chain.textContent = text;
      chain.className = 'code-chain';
      chain.style.cssText = `
        position: absolute;
        color: rgba(16, 185, 129, 0.15);
        font-family: 'Fira Code', 'Courier New', monospace;
        font-size: ${10 + Math.random() * 6}px;
        font-weight: 500;
        pointer-events: none;
        white-space: nowrap;
        user-select: none;
        text-shadow: 0 0 8px rgba(16, 185, 129, 0.2);
      `;

      // Posición inicial aleatoria
      const startX = Math.random() * window.innerWidth;
      const startY = Math.random() * window.innerHeight;
      chain.style.left = `${startX}px`;
      chain.style.top = `${startY}px`;

      container.appendChild(chain);
      chains.push(chain);

      // Animación de movimiento diagonal lento
      const duration = 20 + Math.random() * 30; // 20-50 segundos
      const endX = Math.random() * window.innerWidth;
      const endY = Math.random() * window.innerHeight;

      gsap.to(chain, {
        x: endX - startX,
        y: endY - startY,
        duration: duration,
        ease: 'none',
        repeat: -1,
        yoyo: true,
        delay: Math.random() * 5
      });

      // Rotación sutil
      gsap.to(chain, {
        rotation: Math.random() * 360,
        duration: duration / 2,
        ease: 'none',
        repeat: -1,
        yoyo: true
      });

      // Efecto de fade in/out
      gsap.to(chain, {
        opacity: 0.05 + Math.random() * 0.15,
        duration: 3 + Math.random() * 4,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });
    }

    return () => {
      chains.forEach(chain => chain.remove());
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden'
      }}
    />
  );
}
