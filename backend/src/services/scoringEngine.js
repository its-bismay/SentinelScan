/**
 * Scoring Engine
 * Calculates a 0-100 security score from findings
 */

const SEVERITY_WEIGHTS = {
  critical: 25,
  high: 15,
  medium: 8,
  low: 3,
  informational: 1,
};

const GRADE_THRESHOLDS = [
  { min: 80, grade: 'A' },
  { min: 60, grade: 'B' },
  { min: 40, grade: 'C' },
  { min: 20, grade: 'D' },
  { min: 0,  grade: 'F' },
];

export const calculateScore = (findings = []) => {
  const counts = { critical: 0, high: 0, medium: 0, low: 0, informational: 0 };

  for (const f of findings) {
    const sev = f.severity?.toLowerCase();
    if (counts[sev] !== undefined) counts[sev]++;
  }

  const deduction =
    counts.critical * SEVERITY_WEIGHTS.critical +
    counts.high * SEVERITY_WEIGHTS.high +
    counts.medium * SEVERITY_WEIGHTS.medium +
    counts.low * SEVERITY_WEIGHTS.low +
    counts.informational * SEVERITY_WEIGHTS.informational;

  const score = Math.max(0, Math.min(100, 100 - deduction));
  const grade = GRADE_THRESHOLDS.find((t) => score >= t.min)?.grade || 'F';

  return {
    score: Math.round(score),
    grade,
    criticalCount: counts.critical,
    highCount: counts.high,
    mediumCount: counts.medium,
    lowCount: counts.low,
    infoCount: counts.informational,
  };
};
