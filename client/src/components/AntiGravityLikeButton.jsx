import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import './AntiGravityLikeButton.css';

const AntiGravityLikeButton = () => {
  const [count, setCount] = useState(1);
  const [isFloated, setIsFloated] = useState(false);
  const [particles, setParticles] = useState([]);

  const handleClick = () => {
    // Prevent clicking if animation is running or already liked
    if (isFloated || count > 1) return;

    setIsFloated(true);
    
    // Generate 5-8 copies of the heart and the number '1'
    const particleCount = Math.floor(Math.random() * 4) + 5; 
    const newParticles = Array.from({ length: particleCount }).map((_, i) => {
      // Random horizontal drift (x ± 30px)
      const randomX = `${(Math.random() - 0.5) * 60}px`;
      // Varying delays (0s to 0.5s)
      const delay = `${Math.random() * 0.5}s`;
      // Small rotation for an organic float
      const randomRot = `${(Math.random() - 0.5) * 30}deg`;

      return {
        id: i,
        randomX,
        delay,
        randomRot
      };
    });

    setParticles(newParticles);

    // Reset after animation (2.5s duration + max 0.5s delay)
    setTimeout(() => {
      setIsFloated(false);
      setCount(2);
      setParticles([]);
    }, 2800); 
  };

  return (
    <div className="anti-gravity-container">
      <button 
        className={`like-button-base ${count > 1 ? 'liked' : ''} ${isFloated ? 'is-floated' : ''}`}
        onClick={handleClick}
        aria-label="Like"
      >
        <Heart 
          size={20} 
          className={count > 1 ? "fill-current" : ""} 
        />
        <span className="text-sm font-medium">{count}</span>
      </button>

      {/* Render ascending copies when state isFloated is true */}
      {isFloated && particles.map(particle => (
        <div 
          key={particle.id}
          className="floating-particle animate-float"
          style={{
            '--random-x': particle.randomX,
            '--random-rot': particle.randomRot,
            animationDelay: particle.delay,
            /* Initial opacity 0 to hide before animation-delay sets in */
            opacity: 0 
          }}
        >
          <Heart size={20} className="fill-current" />
          <span className="text-sm font-medium">1</span>
        </div>
      ))}
    </div>
  );
};

export default AntiGravityLikeButton;
