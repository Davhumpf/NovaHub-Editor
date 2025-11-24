'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface ExploreButtonProps {
  onClick: () => void;
}

export default function ExploreButton({ onClick }: ExploreButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const chainsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chainsContainerRef.current || !buttonRef.current) return;

    // Cadenas de código estilo Matrix
    const chains = [
      '01010101',
      'const x=42',
      '{code:true}',
      'function()',
      '<Code/>',
      '0xDEADBEEF',
      'async/await',
      'git commit',
      'npm run',
      'class {}',
      '=> arrow',
      'import *'
    ];

    const animations: gsap.core.Tween[] = [];

    // Generar cadenas animadas
    chains.forEach((text, index) => {
      const chain = document.createElement('div');
      chain.className = 'code-chain';
      chain.textContent = text;
      chain.style.cssText = `
        position: absolute;
        color: rgba(16, 185, 129, 0.6);
        font-family: 'Fira Code', 'Courier New', monospace;
        font-size: 12px;
        font-weight: 600;
        pointer-events: none;
        white-space: nowrap;
        text-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
        z-index: 0;
      `;
      chainsContainerRef.current?.appendChild(chain);

      // Ángulo inicial para cada cadena
      const angle = (index / chains.length) * Math.PI * 2;
      const radius = 80;
      const duration = 8 + (index * 0.5);

      // Animación orbital usando keyframes
      const orbitalAnim = gsap.to(chain, {
        duration: duration,
        repeat: -1,
        ease: 'none',
        keyframes: [
          {
            x: Math.cos(angle) * radius,
            y: Math.sin(angle) * radius,
            rotation: 0
          },
          {
            x: Math.cos(angle + Math.PI * 0.5) * radius,
            y: Math.sin(angle + Math.PI * 0.5) * radius,
            rotation: 90
          },
          {
            x: Math.cos(angle + Math.PI) * radius,
            y: Math.sin(angle + Math.PI) * radius,
            rotation: 180
          },
          {
            x: Math.cos(angle + Math.PI * 1.5) * radius,
            y: Math.sin(angle + Math.PI * 1.5) * radius,
            rotation: 270
          },
          {
            x: Math.cos(angle + Math.PI * 2) * radius,
            y: Math.sin(angle + Math.PI * 2) * radius,
            rotation: 360
          }
        ]
      });

      // Efecto de parpadeo/glitch aleatorio
      const flickerAnim = gsap.to(chain, {
        opacity: 0.3,
        duration: 0.3,
        repeat: -1,
        yoyo: true,
        delay: Math.random() * 2,
        repeatDelay: Math.random() * 3
      });

      // Efecto de profundidad (pasar por delante y detrás)
      const depthAnim = gsap.to(chain, {
        scale: 0.7,
        opacity: 0.3,
        duration: duration / 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });

      animations.push(orbitalAnim, flickerAnim, depthAnim);
    });

    // Animación del botón (pulso sutil)
    const pulseAnim = gsap.to(buttonRef.current, {
      scale: 1.02,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });

    animations.push(pulseAnim);

    // Glow effect en hover
    const button = buttonRef.current;
    const handleMouseEnter = () => {
      gsap.to(button, {
        boxShadow: '0 0 30px rgba(16, 185, 129, 0.6)',
        duration: 0.3
      });
    };
    const handleMouseLeave = () => {
      gsap.to(button, {
        boxShadow: '0 0 0px rgba(16, 185, 129, 0)',
        duration: 0.3
      });
    };

    button?.addEventListener('mouseenter', handleMouseEnter);
    button?.addEventListener('mouseleave', handleMouseLeave);

    // Cleanup
    return () => {
      button?.removeEventListener('mouseenter', handleMouseEnter);
      button?.removeEventListener('mouseleave', handleMouseLeave);
      animations.forEach(anim => anim.kill());
      if (chainsContainerRef.current) {
        chainsContainerRef.current.innerHTML = '';
      }
    };
  }, []);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <div
        ref={chainsContainerRef}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '200px',
          height: '200px',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />
      <button
        ref={buttonRef}
        onClick={onClick}
        className="explore-button"
        style={{
          position: 'relative',
          zIndex: 1,
          padding: '12px 32px',
          fontSize: '16px',
          fontWeight: 600,
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          boxShadow: '0 0 0px rgba(16, 185, 129, 0)'
        }}
      >
        🚀 Explorar Repositorios
      </button>
    </div>
  );
}
