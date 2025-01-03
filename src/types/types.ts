// types.ts

// Represents a user's goal with associated details
export interface Goal {
    id: GoalId;
    goal: string;
    duration: string;
    userId: string;
    createdAt: string;
    recentAttempt?: RecordingId;
  }
  
// Represents an audio recording associated with a goal
export interface Recording {
    id: RecordingId;
    goal: GoalId;
    audio: Audio;
    feedback: String;
}
  
// Represents a practice session containing multiple recordings and goals
export interface PracticeSession {
    id: SessionId;
    userId: string;
    date: string;
    startTime: string;
    duration: number;
    song: string;
    recordings: RecordingId[];
    goals: GoalId[];
}
  
// Assuming Audio is a URL to the audio file. Adjust if you have a different representation.
export type Audio = string;
export type GoalId = string;
export type SessionId = string;
export type UserId = string;
export type RecordingId = string;
