'use client';

import { useEffect, useRef, useState } from 'react';

interface ResultsPageProps {
  role: string;
  industry: string;
  transferableSkills: string[];
  answers: Record<number, string | string[]>;
  scores?: {
    overallScore: number;
    competencyScores: Record<string, number>;
    readinessLevel: string;
    readinessDescription: string;
    careerPath: string;
    recommendedRoles: string[];
  };
  yearsExperience?: string;
  onEdit: () => void;
}

export default function ResultsPage({
  role,
  industry,
  transferableSkills,
  answers,
  scores,
  yearsExperience = 'Unknown',
  onEdit,
}: ResultsPageProps) {
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const answeredCount = Object.keys(answers).length;

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

    Object.values(sectionRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  // Fetch personalized feedback when component mounts
  useEffect(() => {
    if (scores && !feedback && !loading) {
      fetchFeedback();
    }
  }, [scores]);

  const getRecaptchaToken = async (): Promise<string | null> => {
    try {
      // Check if we're on localhost
      if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
        console.log('Localhost detected - skipping reCAPTCHA for testing');
        return 'localhost-test-token';
      }

      // On production, get real reCAPTCHA token
      const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
      
      if (!siteKey) {
        console.warn('reCAPTCHA site key not found');
        return null;
      }

      return new Promise((resolve) => {
        const checkRecaptcha = () => {
          if (typeof window !== 'undefined' && (window as any).grecaptcha) {
            (window as any).grecaptcha.ready(() => {
              (window as any).grecaptcha
                .execute(siteKey, { action: 'submit' })
                .then((token: string) => {
                  resolve(token);
                })
                .catch((err: any) => {
                  console.error('reCAPTCHA error:', err);
                  resolve(null);
                });
            });
          } else {
            setTimeout(checkRecaptcha, 100);
          }
        };

        // Load reCAPTCHA script
        const scriptId = 'recaptcha-script';
        if (!document.getElementById(scriptId)) {
          const script = document.createElement('script');
          script.id = scriptId;
          script.src = 'https://www.google.com/recaptcha/api.js';
          script.async = true;
          script.defer = true;
          script.onload = () => checkRecaptcha();
          document.head.appendChild(script);
        } else {
          checkRecaptcha();
        }
      });
    } catch (err) {
      console.error('Error getting reCAPTCHA token:', err);
      return null;
    }
  };

  const fetchFeedback = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get reCAPTCHA token (or skip on localhost)
      const recaptchaToken = await getRecaptchaToken();

      const response = await fetch('/api/assess', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          overallScore: scores?.overallScore,
          readinessLevel: scores?.readinessLevel,
          careerPath: scores?.careerPath,
          competencyScores: scores?.competencyScores,
          role,
          industry,
          yearsExperience,
          recaptchaToken,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate feedback');
      }

      const data = await response.json();
      setFeedback(data.feedback);
    } catch (err) {
      console.error('Error fetching feedback:', err);
      setError('Could not generate personalized insights at this time');
    } finally {
      setLoading(false);
    }
  };

  if (!scores) {
    return (
      <div className="assessment-container">
        <button onClick={onEdit} className="button-secondary" style={{ marginBottom: '20px' }}>
          ← Edit Answers
        </button>
        <p style={{ color: '#666666' }}>Loading results...</p>
      </div>
    );
  }

  const getLevelColor = (level: string): string => {
    switch (level) {
      case 'Expert':
        return '#185FA5';
      case 'Strong':
        return '#639922';
      case 'Competent':
        return '#BA7517';
      case 'Emerging':
        return '#D4537E';
      case 'Explore':
        return '#888780';
      default:
        return '#6366F1';
    }
  };

  const levelColor = getLevelColor(scores.readinessLevel);

  const sortedCompetencies = Object.entries(scores.competencyScores)
    .filter(([, score]) => score > 0)
    .sort((a, b) => b[1] - a[1]);

  // Competency Circle Component
  const CompetencyCircle = ({ name, score }: { name: string; score: number }) => {
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <div style={{ position: 'relative', width: '110px', height: '110px' }}>
          <svg width="110" height="110" style={{ transform: 'rotate(-90deg)' }}>
            {/* Background circle */}
            <circle
              cx="55"
              cy="55"
              r={radius}
              fill="none"
              stroke="#E5E7EB"
              strokeWidth="4"
            />
            {/* Progress circle */}
            <circle
              cx="55"
              cy="55"
              r={radius}
              fill="none"
              stroke={levelColor}
              strokeWidth="4"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.6s ease' }}
            />
          </svg>
          {/* Score text */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: '20px',
                fontWeight: 700,
                color: levelColor,
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              {score}
            </div>
          </div>
        </div>
        <div
          style={{
            fontSize: '12px',
            fontWeight: 600,
            color: '#1A1A1B',
            textAlign: 'center',
            maxWidth: '100px',
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {name}
        </div>
      </div>
    );
  };

  return (
    <div className="assessment-container" ref={containerRef}>
      {/* Back Button */}
      <button
        onClick={onEdit}
        className="button-secondary"
        style={{ marginBottom: '32px', marginTop: '24px' }}
      >
        ← Edit Answers
      </button>

      {/* Header */}
      <h2 style={{ marginBottom: '32px' }}>Your Assessment Results</h2>

      {/* Overall Score Card */}
      <div
        ref={(el) => {
          if (el) sectionRefs.current['score'] = el;
        }}
        className="fade-in-on-scroll"
        style={{
          background: '#FFFFFF',
          border: `2px solid ${levelColor}`,
          borderRadius: '24px',
          padding: '40px',
          marginBottom: '40px',
          boxShadow: '0 4px 20px -2px rgba(26, 26, 27, 0.04)',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontSize: '64px',
            fontWeight: 700,
            color: levelColor,
            marginBottom: '12px',
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {scores.overallScore}
        </div>
        <div
          style={{
            fontSize: '24px',
            fontWeight: 600,
            color: '#1A1A1B',
            marginBottom: '12px',
            fontFamily: "'Lora', serif",
          }}
        >
          {scores.readinessLevel}
        </div>
        <div
          style={{
            fontSize: '15px',
            color: '#666666',
            marginBottom: '20px',
            lineHeight: '1.6',
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {scores.readinessDescription}
        </div>
        <div
          style={{
            fontSize: '12px',
            fontWeight: 600,
            padding: '10px 18px',
            backgroundColor: 'rgba(99, 102, 241, 0.05)',
            border: `2px solid ${levelColor}`,
            borderRadius: '12px',
            display: 'inline-block',
            color: levelColor,
            fontFamily: "'Inter', sans-serif",
          }}
        >
          Path: {scores.careerPath}
        </div>
      </div>

      {/* Profile Section */}
      <div
        ref={(el) => {
          if (el) sectionRefs.current['profile'] = el;
        }}
        className="question-card fade-in-on-scroll"
        style={{
          animationDelay: '100ms',
          border: '2px solid transparent',
        }}
      >
        <h3 style={{ marginBottom: '16px' }}>Your Profile</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <p style={{ margin: 0 }}>
            <strong style={{ color: '#1A1A1B' }}>Role:</strong> {role}
          </p>
          <p style={{ margin: 0 }}>
            <strong style={{ color: '#1A1A1B' }}>Industry:</strong> {industry}
          </p>
          <p style={{ margin: 0 }}>
            <strong style={{ color: '#1A1A1B' }}>Transferable Skills:</strong>{' '}
            {transferableSkills.length > 0 ? transferableSkills.join(', ') : 'None selected'}
          </p>
        </div>
      </div>

      {/* Competency Breakdown Section */}
      <div
        ref={(el) => {
          if (el) sectionRefs.current['competencies'] = el;
        }}
        className="question-card fade-in-on-scroll"
        style={{
          animationDelay: '200ms',
          border: '2px solid transparent',
        }}
      >
        <h3 style={{ marginBottom: '32px' }}>Competency Breakdown</h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '32px',
          }}
        >
          {sortedCompetencies.map(([competency, score]) => (
            <CompetencyCircle key={competency} name={competency} score={score} />
          ))}
        </div>
      </div>

      {/* Recommended Roles Section */}
      <div
        ref={(el) => {
          if (el) sectionRefs.current['roles'] = el;
        }}
        className="fade-in-on-scroll"
        style={{
          animationDelay: '300ms',
        }}
      >
        <h3 style={{ marginBottom: '24px', fontSize: '18px', fontWeight: 600, fontFamily: "'Lora', serif" }}>
          Recommended Roles
        </h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
            marginBottom: '40px',
          }}
        >
          {scores.recommendedRoles.map((roleItem, idx) => (
            <div
              key={idx}
              style={{
                background: '#FFFFFF',
                border: '2px solid transparent',
                borderRadius: '24px',
                padding: '24px',
                boxShadow: '0 4px 20px -2px rgba(26, 26, 27, 0.04)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                fontFamily: "'Inter', sans-serif",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget;
                el.style.borderColor = levelColor;
                el.style.boxShadow = `0 8px 32px rgba(99, 102, 241, 0.1)`;
                el.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget;
                el.style.borderColor = 'transparent';
                el.style.boxShadow = '0 4px 20px -2px rgba(26, 26, 27, 0.04)';
                el.style.transform = 'translateY(0)';
              }}
            >
              <div
                style={{
                  fontSize: '15px',
                  fontWeight: 600,
                  color: '#1A1A1B',
                  textAlign: 'center',
                  lineHeight: '1.5',
                }}
              >
                {roleItem}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Personalized Insights Section */}
      <div
        ref={(el) => {
          if (el) sectionRefs.current['insights'] = el;
        }}
        className="question-card fade-in-on-scroll"
        style={{
          animationDelay: '400ms',
          border: '2px solid transparent',
        }}
      >
        <h3 style={{ marginBottom: '18px' }}>Personalized Insights</h3>

        {loading && (
          <div style={{ color: '#666666', fontSize: '14px', fontStyle: 'italic', fontFamily: "'Inter', sans-serif" }}>
            Generating personalized insights...
          </div>
        )}

        {error && (
          <div style={{ color: '#d32f2f', fontSize: '14px', fontFamily: "'Inter', sans-serif" }}>
            {error}
          </div>
        )}

        {feedback && (
          <div
            style={{
              color: '#333',
              fontSize: '14px',
              lineHeight: '1.8',
              whiteSpace: 'pre-wrap',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {feedback}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ marginTop: '40px', paddingTop: '20px', textAlign: 'center', color: '#999', fontSize: '12px' }}>
        Assessment completed: {answeredCount} questions answered
      </div>
    </div>
  );
}
