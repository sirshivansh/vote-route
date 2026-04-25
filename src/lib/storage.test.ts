import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getProfile, saveProfile, clearProfile, getCompleted, toggleCompleted } from './storage';

// Mock localStorage for Vitest environment
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('Storage Library', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('should return null profile when nothing is stored', () => {
    expect(getProfile()).toBeNull();
  });

  it('should correctly save and retrieve a user profile', () => {
    const mockProfile = { 
      age: 25, 
      state: 'Maharashtra', 
      city: 'Mumbai', 
      firstTimeVoter: true, 
      createdAt: new Date().toISOString() 
    };
    saveProfile(mockProfile);
    expect(getProfile()).toEqual(mockProfile);
    expect(localStorageMock.setItem).toHaveBeenCalledWith('vja:profile', JSON.stringify(mockProfile));
  });

  it('should return an empty array if no steps are completed', () => {
    expect(getCompleted()).toEqual([]);
  });

  it('should toggle a completed step (add and then remove)', () => {
    const stepId = 's1';
    
    // Add
    const added = toggleCompleted(stepId);
    expect(added).toContain(stepId);
    expect(getCompleted()).toContain(stepId);
    
    // Remove
    const removed = toggleCompleted(stepId);
    expect(removed).not.toContain(stepId);
    expect(getCompleted()).toEqual([]);
  });

  it('should clear all data when clearProfile is called', () => {
    saveProfile({ age: 18, state: 'Delhi', city: 'Delhi', firstTimeVoter: false, createdAt: '' });
    toggleCompleted('s1');
    
    clearProfile();
    
    expect(getProfile()).toBeNull();
    expect(getCompleted()).toEqual([]);
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('vja:profile');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('vja:completed-steps');
  });
});
