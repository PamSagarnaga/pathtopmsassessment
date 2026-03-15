'use client';

import { useEffect, useRef, useState } from 'react';

interface Question {
  id: number;
  text: string;
  options: string[];
  multiple?: boolean;
}

interface AssessmentFormProps {
  questions: Question[];
  answers: Record<number, string | string[]>;
  onAnswerSelect: (questionId: number, answer: string) => void;
  onAnswerToggle: (questionId: number, answer: string) => void;
  onSubmit: () => void;
  onBack: () => void;
}

export default function AssessmentForm({
  questions,
  answers,
  onAnswerSelect,
  onAnswerToggle,
  onSubmit,
  onBack,
}: AssessmentFormProps) {
  const answeredCount = Object.keys(answers).length;
  const totalQuestions = questions.length;
  const allAnswered = answeredCount === totalQuestions;

  // Progress tracking
  const [scrollProgress, setScrollProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const questionsRefs = useRef<Record<number, HTMLDivElement | null>>({});

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

    // Observe all question cards
    Object.values(questionsRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  // Track scroll progress
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const scrollTop = window.scrollY;
      const containerTop = containerRef.current.offsetTop;
      const containerHeight = containerRef.current.offsetHeight;
      const windowHeight = window.innerHeight;

      // Calculate scroll progress relative to the container
      const relativeScrollTop = Math.max(0, scrollTop - containerTop);
      const scrollableHeight = containerHeight - windowHeight;
      const progress = scrollableHeight > 0 ? (relativeScrollTop / scrollableHeight) * 100 : 0;

      setScrollProgress(Math.min(progress, 100));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Calculate combined progress (50% scroll + 50% completion)
  const completionProgress = (answeredCount / totalQuestions) * 100;
  const combinedProgress = (scrollProgress * 0.5 + completionProgress * 0.5);

  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  return (
    <div className="assessment-container" ref={containerRef}>
      {/* Sticky Progress Bar */}
      <div className="progress-container">
        <div className="progress-wrapper">
          <div className="progress-text">
            <span className="progress-label">Progress</span>
          </div>
          <div className="progress-bar-wrapper">
            <div
              className="progress-bar-fill"
              style={{ width: `${combinedProgress}%` }}
            />
          </div>
          <div className="progress-text">
            {formatNumber(answeredCount)} / {formatNumber(totalQuestions)}
          </div>
        </div>
      </div>

      {/* Back Button */}
      <button
        onClick={onBack}
        className="button-secondary"
        style={{ marginBottom: '32px', marginTop: '24px' }}
      >
        ← Back
      </button>

      {/* Header */}
      <h2>Assessment Questions</h2>
      <p style={{ marginBottom: '32px', color: '#666666' }}>
        Answer all questions to see your personalized results
      </p>

      {/* Questions Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (allAnswered) {
            onSubmit();
          }
        }}
      >
        {questions.map((question, index) => {
          const answer = answers[question.id];
          const isAnswered = answer !== undefined && (Array.isArray(answer) ? answer.length > 0 : answer !== '');

          return (
            <div
              key={question.id}
              ref={(el) => {
                if (el) questionsRefs.current[question.id] = el;
              }}
              className={`question-card fade-in-on-scroll ${isAnswered ? 'selected' : ''}`}
              style={{
                animationDelay: `${index * 50}ms`,
              }}
            >
              <div className="question-header">
                <span className="question-number">
                  {formatNumber(index + 1)}
                </span>
                <h3 className="question-text">{question.text}</h3>
              </div>

              <div className="options-container">
                {question.options.map((option) => {
                  const isSelected = question.multiple
                    ? Array.isArray(answer) && answer.includes(option)
                    : answer === option;

                  return (
                    <label key={option} className="option-label">
                      <input
                        type={question.multiple ? 'checkbox' : 'radio'}
                        name={`question-${question.id}`}
                        value={option}
                        checked={isSelected}
                        onChange={() => {
                          if (question.multiple) {
                            onAnswerToggle(question.id, option);
                          } else {
                            onAnswerSelect(question.id, option);
                          }
                        }}
                      />
                      <span>{option}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!allAnswered}
          className="button-primary"
          style={{
            marginTop: '32px',
            marginBottom: '64px',
          }}
        >
          {allAnswered ? 'See Results' : `Answer all questions (${answeredCount}/${totalQuestions})`}
        </button>
      </form>
    </div>
  );
}
