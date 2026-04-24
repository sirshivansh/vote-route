import { describe, it, expect } from 'vitest';
import { calcReadiness, readinessLabel, getNextStep, JourneyStep } from './journey';

describe('Journey Engine', () => {
  const mockSteps: JourneyStep[] = [
    { id: '1', phase: 'Prepare', title: 'Step 1', shortDesc: '', longDesc: '', estimate: '', weight: 10 },
    { id: '2', phase: 'Register', title: 'Step 2', shortDesc: '', longDesc: '', estimate: '', weight: 40 },
    { id: '3', phase: 'Vote', title: 'Step 3', shortDesc: '', longDesc: '', estimate: '', weight: 50 },
  ];

  it('should calculate 0% readiness when no steps completed', () => {
    expect(calcReadiness([], mockSteps)).toBe(0);
  });

  it('should calculate correct readiness based on weights', () => {
    expect(calcReadiness(['1'], mockSteps)).toBe(10);
    expect(calcReadiness(['1', '2'], mockSteps)).toBe(50);
    expect(calcReadiness(['1', '2', '3'], mockSteps)).toBe(100);
  });

  it('should generate appropriate labels based on score', () => {
    // using mock translations, just checking the tone
    expect(readinessLabel(0).tone).toBe('muted');
    expect(readinessLabel(50).tone).toBe('primary');
    expect(readinessLabel(100).tone).toBe('leaf');
  });

  it('should correctly identify the next step', () => {
    expect(getNextStep(['1'], mockSteps)?.id).toBe('2');
    expect(getNextStep(['1', '2', '3'], mockSteps)).toBeUndefined();
  });
});
