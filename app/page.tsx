'use client';

import { useState } from 'react';
import { QUESTIONS, ROLES, INDUSTRIES, TRANSFERABLE_SKILLS } from '@/lib/questions';
import { calculateAssessmentScore } from '@/lib/scoring';
import LandingPage from '@/components/LandingPage';
import BackgroundForm from '@/components/BackgroundForm';
import AssessmentForm from '@/components/AssessmentForm';
import ResultsPage from '@/components/ResultsPage';

export default function AssessmentPage() {
  const [stage, setStage] = useState<'landing' | 'background' | 'questions' | 'results'>('landing');
  const [role, setRole] = useState('');
  const [industry, setIndustry] = useState('');
  const [transferableSkills, setTransferableSkills] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<number, string | string[]>>({});
  const [scores, setScores] = useState<ReturnType<typeof calculateAssessmentScore> | null>(null);

  const handleStartAssessment = () => {
    console.log('Button clicked!');
    setStage('background');
  };

  const handleBackgroundSubmit = (selectedRole: string, selectedIndustry: string, selectedSkills: string[]) => {
    setRole(selectedRole);
    setIndustry(selectedIndustry);
    setTransferableSkills(selectedSkills);
    setStage('questions');
  };

  const handleAnswerSelect = (questionId: number, answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleAnswerToggle = (questionId: number, answer: string) => {
    setAnswers((prev) => {
      const current = Array.isArray(prev[questionId]) ? prev[questionId] : [];
      if ((current as string[]).includes(answer)) {
        return {
          ...prev,
          [questionId]: (current as string[]).filter((a) => a !== answer),
        };
      } else {
        return {
          ...prev,
          [questionId]: [...(current as string[]), answer],
        };
      }
    });
  };

  const handleSubmitAssessment = () => {
    // Calculate scores
    const calculatedScores = calculateAssessmentScore(answers, QUESTIONS);
    setScores(calculatedScores);
    setStage('results');
  };

  const handleEditAnswers = () => {
    setStage('questions');
  };

  const handleBackToBackground = () => {
    setStage('background');
  };

  // Extract years of experience from Q1 answer
  const yearsExperience = String(answers[1]) || 'Unknown';

  const containerStyle: React.CSSProperties = {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    lineHeight: '1.6',
  };

  return (
    <div style={containerStyle}>
      {stage === 'landing' && <LandingPage onStart={handleStartAssessment} />}

      {stage === 'background' && (
        <BackgroundForm
          roles={ROLES}
          industries={INDUSTRIES}
          skills={TRANSFERABLE_SKILLS}
          onSubmit={handleBackgroundSubmit}
        />
      )}

      {stage === 'questions' && (
        <AssessmentForm
          questions={QUESTIONS}
          answers={answers}
          onAnswerSelect={handleAnswerSelect}
          onAnswerToggle={handleAnswerToggle}
          onSubmit={handleSubmitAssessment}
          onBack={handleBackToBackground}
        />
      )}

      {stage === 'results' && (
        <ResultsPage
          role={role}
          industry={industry}
          transferableSkills={transferableSkills}
          answers={answers}
          scores={scores || undefined}
          yearsExperience={yearsExperience}
          onEdit={handleEditAnswers}
        />
      )}
    </div>
  );
}
