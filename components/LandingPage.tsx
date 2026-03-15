'use client';

import { useEffect, useRef } from 'react';

interface LandingPageProps {
  onStart: () => void;
}

export default function LandingPage({ onStart }: LandingPageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const featureRefs = useRef<Record<number, HTMLDivElement | null>>({});

  // Intersection Observer for fade-in animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    // Observe all feature cards
    Object.values(featureRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  const features = [
    {
      id: 1,
      title: 'Core Competencies',
      description: 'Evaluate your PM readiness across 7 core competencies',
    },
    {
      id: 2,
      title: 'Career Trajectory',
      description: 'Identify your career path (Specialist, Generalist, Transitioning, Ascending)',
    },
    {
      id: 3,
      title: 'Role Recommendations',
      description: 'Discover recommended PM roles tailored to your background',
    },
    {
      id: 4,
      title: 'AI-Powered Insights',
      description: 'Receive personalized insights powered by artificial intelligence',
    },
  ];

  return (
    <div className="assessment-container" ref={containerRef} style={{ paddingTop: '60px', paddingBottom: '60px' }}>
      {/* Hero Section */}
      <div
        className="fade-in-on-scroll visible"
        style={{
          textAlign: 'center',
          marginBottom: '64px',
        }}
      >
        <h1
          style={{
            fontSize: '48px',
            fontWeight: 700,
            marginBottom: '16px',
            color: '#1A1A1B',
            fontFamily: "'Lora', serif",
          }}
        >
          PathToPM
        </h1>

        <p
          style={{
            fontSize: '18px',
            color: '#666666',
            fontFamily: "'Inter', sans-serif",
            lineHeight: '1.6',
            maxWidth: '600px',
            margin: '0 auto 24px auto',
          }}
        >
          Discover your Project Manager readiness in 12 minutes.
          <br />
          Get a personalized assessment of your PM potential, career path, and next steps.
        </p>
      </div>

      {/* Features Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '24px',
          marginBottom: '64px',
        }}
      >
        {features.map((feature, index) => (
          <div
            key={feature.id}
            ref={(el) => {
              if (el) featureRefs.current[feature.id] = el;
            }}
            className="fade-in-on-scroll"
            style={{
              background: '#FFFFFF',
              border: '2px solid transparent',
              borderRadius: '24px',
              padding: '28px',
              boxShadow: '0 4px 20px -2px rgba(26, 26, 27, 0.04)',
              transition: 'all 0.3s ease',
              cursor: 'default',
              animationDelay: `${index * 100}ms`,
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget;
              el.style.boxShadow = '0 8px 32px rgba(99, 102, 241, 0.1)';
              el.style.transform = 'translateY(-4px)';
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget;
              el.style.boxShadow = '0 4px 20px -2px rgba(26, 26, 27, 0.04)';
              el.style.transform = 'translateY(0)';
            }}
          >
            <h3
              style={{
                fontSize: '16px',
                fontWeight: 600,
                color: '#1A1A1B',
                marginBottom: '12px',
                fontFamily: "'Lora', serif",
              }}
            >
              {feature.title}
            </h3>
            <p
              style={{
                fontSize: '14px',
                color: '#666666',
                lineHeight: '1.6',
                margin: 0,
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {feature.description}
            </p>
          </div>
        ))}
      </div>

      {/* CTA Button */}
      <div style={{ textAlign: 'center' }}>
        <button
          onClick={onStart}
          className="button-primary"
          style={{
            maxWidth: '200px',
            padding: '16px 40px',
            fontSize: '16px',
            fontWeight: 600,
          }}
        >
          Start Assessment
        </button>
      </div>
    </div>
  );
}
