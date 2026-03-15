'use client';

import { useEffect, useRef, useState } from 'react';

interface BackgroundFormProps {
  roles: string[];
  industries: string[];
  skills: string[];
  onSubmit: (role: string, industry: string, skills: string[]) => void;
}

export default function BackgroundForm({ roles, industries, skills, onSubmit }: BackgroundFormProps) {
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

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

  const handleSkillToggle = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole || !selectedIndustry) {
      alert('Please fill in all fields');
      return;
    }
    onSubmit(selectedRole, selectedIndustry, selectedSkills);
  };

  // Calculate progress (3 sections)
  const completedSections = [selectedRole, selectedIndustry, selectedSkills.length > 0].filter(Boolean).length;
  const progressPercent = (completedSections / 3) * 100;

  return (
    <div className="assessment-container" ref={containerRef}>
      {/* Progress Indicator */}
      <div
        className="fade-in-on-scroll visible"
        style={{
          marginBottom: '40px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
          }}
        >
          <h2 style={{ margin: 0 }}>Tell us about yourself</h2>
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '12px',
              fontWeight: 600,
              color: '#666666',
            }}
          >
            {completedSections}/3
          </span>
        </div>
        <div className="progress-bar-wrapper" style={{ height: '6px' }}>
          <div
            className="progress-bar-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        {/* Role Section Card */}
        <div
          ref={(el) => {
            if (el) sectionRefs.current['role'] = el;
          }}
          className="question-card fade-in-on-scroll"
          style={{
            animationDelay: '0ms',
            border: selectedRole ? '2px solid #6366F1' : '2px solid transparent',
            backgroundColor: selectedRole ? 'rgba(99, 102, 241, 0.05)' : '#FFFFFF',
          }}
        >
          <label
            style={{
              display: 'block',
              marginBottom: '16px',
              fontWeight: 600,
              fontSize: '15px',
              color: '#1A1A1B',
              fontFamily: "'Lora', serif",
            }}
          >
            What's your current or most recent job title/role?
          </label>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: '14px',
              borderRadius: '12px',
              border: '2px solid #E5E7EB',
              fontFamily: "'Inter', sans-serif",
              transition: 'all 0.2s ease',
              cursor: 'pointer',
              boxSizing: 'border-box',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#6366F1';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.05)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#E5E7EB';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <option value="">-- Select your role --</option>
            {roles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>

        {/* Industry Section Card */}
        <div
          ref={(el) => {
            if (el) sectionRefs.current['industry'] = el;
          }}
          className="question-card fade-in-on-scroll"
          style={{
            animationDelay: '100ms',
            border: selectedIndustry ? '2px solid #6366F1' : '2px solid transparent',
            backgroundColor: selectedIndustry ? 'rgba(99, 102, 241, 0.05)' : '#FFFFFF',
          }}
        >
          <label
            style={{
              display: 'block',
              marginBottom: '16px',
              fontWeight: 600,
              fontSize: '15px',
              color: '#1A1A1B',
              fontFamily: "'Lora', serif",
            }}
          >
            What industry do you primarily work in?
          </label>
          <select
            value={selectedIndustry}
            onChange={(e) => setSelectedIndustry(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: '14px',
              borderRadius: '12px',
              border: '2px solid #E5E7EB',
              fontFamily: "'Inter', sans-serif",
              transition: 'all 0.2s ease',
              cursor: 'pointer',
              boxSizing: 'border-box',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#6366F1';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.05)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#E5E7EB';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <option value="">-- Select your industry --</option>
            {industries.map((industry) => (
              <option key={industry} value={industry}>
                {industry}
              </option>
            ))}
          </select>
        </div>

        {/* Skills Section Card */}
        <div
          ref={(el) => {
            if (el) sectionRefs.current['skills'] = el;
          }}
          className="question-card fade-in-on-scroll"
          style={{
            animationDelay: '200ms',
            border: selectedSkills.length > 0 ? '2px solid #6366F1' : '2px solid transparent',
            backgroundColor: selectedSkills.length > 0 ? 'rgba(99, 102, 241, 0.05)' : '#FFFFFF',
          }}
        >
          <label
            style={{
              display: 'block',
              marginBottom: '18px',
              fontWeight: 600,
              fontSize: '15px',
              color: '#1A1A1B',
              fontFamily: "'Lora', serif",
            }}
          >
            Which transferable skills resonate with your experience? (Select all that apply)
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {skills.map((skill) => (
              <label
                key={skill}
                className="option-label"
                style={{ padding: '12px 14px' }}
              >
                <input
                  type="checkbox"
                  checked={selectedSkills.includes(skill)}
                  onChange={() => handleSkillToggle(skill)}
                  style={{ width: '20px', height: '20px' }}
                />
                <span>{skill}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="button-primary"
          style={{
            marginTop: '40px',
            marginBottom: '64px',
            padding: '14px 20px',
          }}
        >
          Continue to Assessment
        </button>
      </form>
    </div>
  );
}
