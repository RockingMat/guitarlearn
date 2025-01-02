// types.ts

// Represents a user's goal with associated details
export interface Goal {
    goal: string;
    duration: string;
    userId: string;
    recentAttempt?: Recording;
  }
  
// Represents an audio recording associated with a goal
export interface Recording {
    goal: Goal;
    audio: Audio;
    feedback: Feedback;
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

// Feedback can be a structured object or a simple string. Here's a structured example:
export interface Feedback {
    comments: string;
}
  