// Competency mapping - which questions belong to which competency
export const COMPETENCY_MAP: Record<number, string> = {
  1: 'Experience',
  2: 'Experience',
  3: 'PM Fundamentals',
  4: 'Financial Acumen',
  5: 'Risk Management',
  6: 'Process Optimization',
  7: 'Leadership',
  8: 'Communication',
  9: 'Collaboration',
  10: 'Emotional Intelligence',
  11: 'Critical Thinking',
  12: 'Prioritization',
  13: 'Resilience',
  14: 'Tools & Technology',
  15: 'Tools & Technology',
  16: 'Tools & Technology',
  17: 'Industry Depth',
  18: 'Industry Breadth',
  19: 'Specializations',
  20: 'Motivation',
  21: 'Growth',
};

// Weighting for each competency in overall score
export const COMPETENCY_WEIGHTS: Record<string, number> = {
  Experience: 0.12,
  'PM Fundamentals': 0.12,
  'Financial Acumen': 0.08,
  'Risk Management': 0.06,
  'Process Optimization': 0.00,
  Leadership: 0.06,
  Communication: 0.06,
  Collaboration: 0.04,
  'Emotional Intelligence': 0.06,
  'Critical Thinking': 0.02,
  Prioritization: 0.02,
  Resilience: 0.04,
  'Tools & Technology': 0.10,
  'Industry Depth': 0.06,
  'Industry Breadth': 0.06,
  Specializations: 0.00,
  Motivation: 0.05,
  Growth: 0.05,
};

interface ScoringResult {
  overallScore: number;
  competencyScores: Record<string, number>;
  readinessLevel: string;
  readinessDescription: string;
  careerPath: string;
  recommendedRoles: string[];
}

interface QuestionData {
  id: number;
  options: string[];
  scores: number[];
  multiple?: boolean;
}

/**
 * Calculate competency scores from answers
 */
function calculateCompetencyScores(
  answers: Record<number, string | string[]>,
  questions: QuestionData[]
): Record<string, number> {
  const competencyScores: Record<string, number> = {};
  const competencyAnswers: Record<string, number[]> = {};

  // Initialize competency tracking
  Object.values(COMPETENCY_MAP).forEach((comp) => {
    competencyAnswers[comp] = [];
  });

  // Map answers to competencies
  questions.forEach((question) => {
    const answer = answers[question.id];
    const competency = COMPETENCY_MAP[question.id];

    if (answer === undefined || competency === undefined) return;

    let score = 0;

    if (Array.isArray(answer)) {
      // Multi-select: sum the scores
      score = answer.reduce((sum, val) => {
        const idx = question.options.indexOf(val);
        return sum + (idx > -1 ? question.scores[idx] : 0);
      }, 0);
      // Cap at 100
      score = Math.min(score, 100);
    } else {
      // Single select
      const idx = question.options.indexOf(answer);
      score = idx > -1 ? question.scores[idx] : 0;
    }

    competencyAnswers[competency].push(score);
  });

  // Average scores per competency
  Object.entries(competencyAnswers).forEach(([comp, scores]) => {
    if (scores.length > 0) {
      competencyScores[comp] = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    } else {
      competencyScores[comp] = 0;
    }
  });

  return competencyScores;
}

/**
 * Calculate overall readiness score with weighted average
 */
function calculateOverallScore(competencyScores: Record<string, number>): number {
  let weightedSum = 0;
  let totalWeight = 0;

  Object.entries(COMPETENCY_WEIGHTS).forEach(([comp, weight]) => {
    const score = competencyScores[comp] || 0;
    weightedSum += score * weight;
    totalWeight += weight;
  });

  return Math.round(totalWeight > 0 ? weightedSum / totalWeight : 0);
}

/**
 * Get readiness level based on score
 */
function getReadinessLevel(score: number): { level: string; description: string } {
  if (score >= 81) {
    return {
      level: 'Expert',
      description: 'You are exceptionally well-prepared for executive and C-level PM roles',
    };
  }
  if (score >= 61) {
    return {
      level: 'Strong',
      description: 'You are well-prepared for senior PM roles and leadership opportunities',
    };
  }
  if (score >= 41) {
    return {
      level: 'Competent',
      description: 'You are ready for mid-level PM roles with some targeted skill development',
    };
  }
  if (score >= 21) {
    return {
      level: 'Emerging',
      description: 'You are starting your PM journey and ready for entry-level PM roles',
    };
  }
  return {
    level: 'Explore',
    description: 'You are new to PM; focus on key skill areas before transitioning',
  };
}

/**
 * Detect career path based on answers
 */
function detectCareerPath(
  answers: Record<number, string | string[]>,
  competencyScores: Record<string, number>
): string {
  // Map answer text to depth/breadth levels
  const depthMap: Record<string, number> = {
    'New / < 2 years': 0,
    'Developing / 2-5 years': 1,
    'Experienced / 5-10 years': 2,
    'Deep expertise / 10-15 years': 3,
    'Industry veteran / 15+ years': 4,
  };

  const breadthMap: Record<string, number> = {
    'One industry': 1,
    'Two industries': 2,
    'Three industries': 3,
    'Four or more': 4,
  };

  const yearsExpMap: Record<string, number> = {
    'Just starting (< 1 year)': 0,
    '1-2 years': 1,
    '3-5 years': 2,
    '6-10 years': 3,
    '10+ years': 4,
  };

  const motivationMap: Record<string, string> = {
    'Exploring career change': 'exploring',
    'Lateral move into PM': 'lateral',
    'Advancement opportunity': 'advancement',
    'Clear progression path': 'progression',
    'C-level ambitions': 'executive',
  };

  // Extract relevant answers
  const depthScore = depthMap[String(answers[17])] ?? 0;
  const breadthLevel = breadthMap[String(answers[18])] ?? 1;
  const yearsExp = yearsExpMap[String(answers[1])] ?? 0;
  const motivation = motivationMap[String(answers[20])] ?? 'exploring';

  // Determine path
  const isCareerChange =
    motivation === 'exploring' || motivation === 'lateral' || yearsExp <= 1;
  const deepExpertise = depthScore >= 3;

  if (deepExpertise && breadthLevel === 1) {
    return 'Ascending Specialist';
  }

  if (breadthLevel >= 3 && depthScore <= 2) {
    return 'Generalist';
  }

  if (isCareerChange) {
    return 'Transitioning';
  }

  return 'Specialist';
}

/**
 * Get recommended roles based on path and score
 */
function getRecommendedRoles(path: string, score: number): string[] {
  const roles: Record<string, Record<string, string[]>> = {
    Specialist: {
      low: ['Entry-level PM (your industry)', 'Project Coordinator (your industry)'],
      mid: ['Project Manager (your industry)', 'Senior Operations Manager (your industry)'],
      high: ['Senior PM (your industry)', 'Director of PM (your industry)'],
    },
    Generalist: {
      low: ['Program Coordinator', 'Business Analyst'],
      mid: ['Program Manager', 'Portfolio Manager'],
      high: ['Senior Program Manager', 'Director of Program Management'],
    },
    Transitioning: {
      low: ['Junior PM (new industry)', 'Project Coordinator'],
      mid: ['Project Manager (new industry)', 'Operations Manager'],
      high: ['Senior PM (if domain expertise transfers)'],
    },
    'Ascending Specialist': {
      low: ['Senior PM (your industry)', 'Program Manager (your industry)'],
      mid: ['Director (your industry)', 'VP Operations (your industry)'],
      high: ['Executive PM role', 'VP Product/Operations'],
    },
  };

  const pathRoles = roles[path] || roles['Specialist'];

  let tier: 'low' | 'mid' | 'high';
  if (score >= 61) {
    tier = 'high';
  } else if (score >= 41) {
    tier = 'mid';
  } else {
    tier = 'low';
  }

  return pathRoles[tier];
}

/**
 * Main scoring function
 */
export function calculateAssessmentScore(
  answers: Record<number, string | string[]>,
  questions: QuestionData[]
): ScoringResult {
  // Calculate competency scores
  const competencyScores = calculateCompetencyScores(answers, questions);

  // Calculate overall score
  const overallScore = calculateOverallScore(competencyScores);

  // Get readiness level
  const { level: readinessLevel, description: readinessDescription } =
    getReadinessLevel(overallScore);

  // Detect career path
  const careerPath = detectCareerPath(answers, competencyScores);

  // Get recommended roles
  const recommendedRoles = getRecommendedRoles(careerPath, overallScore);

  return {
    overallScore,
    competencyScores,
    readinessLevel,
    readinessDescription,
    careerPath,
    recommendedRoles,
  };
}
