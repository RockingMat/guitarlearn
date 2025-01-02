// types.ts

// Represents a user's goal with associated details
export interface Goal {
    id: string;
    goal: string;
    duration: string;
    userId: string;
    createdAt: string;
    recentAttempt?: Recording;
  }
  
// Represents an audio recording associated with a goal
export interface Recording {
    id: string;
    goal: Goal;
    audio: Audio;
    feedback: String;
}
  
// Represents a practice session containing multiple recordings and goals
export interface PracticeSession {
    id: string;
    userId: string;
    date: string;
    startTime: string;
    duration: number;
    song: string;
    recordings: Recording[];
    goals: Goal[];
}
  
// Assuming Audio is a URL to the audio file. Adjust if you have a different representation.
export type Audio = string;