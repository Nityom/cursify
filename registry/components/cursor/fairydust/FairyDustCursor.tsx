'use client';
import React, { useEffect, useRef, useState } from 'react';

interface FairyDustCursorProps {
  colors?: string[];
  element?: HTMLElement;
  characterSet?: string[];
  particleSize?: number;
  particleCount?: number;
  gravity?: number;
  fadeSpeed?: number;
  initialVelocity?: {
    min: number;
    max: number;
  };
}

interface Particle {
  x: number;
  y: number;
  character: string;
  color: string;
  velocity: {
    x: number;
    y: number;
  };
  lifeSpan: number;
  initialLifeSpan: number;
  scale: number;
}

export const FairyDustCursor: React.FC<FairyDustCursorProps> = ({
  colors = ['#D61C59', '#E7D84B', '#1B8798'],
  element,
  characterSet = ['✨', '⭐', '🌟', '★', '*'],
  particleSize = 21,
  particleCount = 5,
  gravity = 0.02,
  fadeSpeed = 0.98,
  initialVelocity = { min: 0.5, max: 1.5 },
}) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const cursorRef = useRef<HTMLDivElement | null>(null);

  // Function to create a new particle
  const createParticle = (x: number, y: number) => {
    const randomCharacter = characterSet[Math.floor(Math.random() * characterSet.length)];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const velocityX = (Math.random() * (initialVelocity.max - initialVelocity.min) + initialVelocity.min) * (Math.random() > 0.5 ? 1 : -1);
    const velocityY = (Math.random() * (initialVelocity.max - initialVelocity.min) + initialVelocity.min) * (Math.random() > 0.5 ? 1 : -1);

    const newParticle: Particle = {
      x,
      y,
      character: randomCharacter,
      color: randomColor,
      velocity: {
        x: velocityX,
        y: velocityY,
      },
      lifeSpan: 1,
      initialLifeSpan: 1,
      scale: Math.random() * 0.5 + 0.5, // Random scale between 0.5 and 1
    };

    setParticles((prevParticles) => [...prevParticles, newParticle]);
  };

  // Function to update particle properties
  const updateParticles = () => {
    setParticles((prevParticles) => {
      return prevParticles
        .map((particle) => {
          const newLifeSpan = particle.lifeSpan * fadeSpeed;
          if (newLifeSpan <= 0) return null; // Remove particle if it has faded completely

          return {
            ...particle,
            x: particle.x + particle.velocity.x,
            y: particle.y + particle.velocity.y + gravity, // Apply gravity
            lifeSpan: newLifeSpan,
            velocity: {
              x: particle.velocity.x * 0.99, // Gradually reduce velocity to create deceleration
              y: particle.velocity.y * 0.99,
            },
          };
        })
        .filter((particle) => particle !== null); // Remove null particles
    });
  };

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      // Add particles at the cursor's position
      for (let i = 0; i < particleCount; i++) {
        createParticle(event.clientX, event.clientY);
      }
    };

    const elementToAttach = element instanceof HTMLElement ? element : document.body;
    elementToAttach.addEventListener('mousemove', handleMouseMove);

    return () => {
      elementToAttach.removeEventListener('mousemove', handleMouseMove);
    };
  }, [element, particleCount]);

  useEffect(() => {
    const intervalId = setInterval(updateParticles, 16); // 60fps

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    >
      {particles.map((particle, index) => (
        <span
          key={index}
          style={{
            position: 'absolute',
            top: `${particle.y - particleSize / 2}px`,
            left: `${particle.x - particleSize / 2}px`,
            fontSize: `${particleSize}px`,
            color: particle.color,
            transform: `scale(${particle.scale})`,
            opacity: particle.lifeSpan,
            pointerEvents: 'none',
            transition: 'opacity 0.1s ease-out',
          }}
        >
          {particle.character}
        </span>
      ))}
    </div>
  );
};
