// firebase/firestoreUtils.ts
import { db } from "./clientApp";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  arrayUnion,
} from "firebase/firestore";
import { PracticeSession, Goal } from "@/types/types";

/**
 * Create a new practice session for the current user.
 * @param userId The UID of the authenticated user.
 */
export const createNewPracticeSession = async (userId: string): Promise<string> => {
  try {
    const sessionsRef = collection(db, "sessions");
    const now = new Date();
    const newSession: Omit<PracticeSession, "id"> = {
      userId,
      date: now.toISOString(),
      duration: 0,
      song: "",
      startTime: now.toTimeString().split(" ")[0],
      goals: [],
      recordings: [],
    };
    const docRef = await addDoc(sessionsRef, newSession);
    return docRef.id;
  } catch (error) {
    console.error("Error creating practice session:", error);
    throw error;
  }
};

/**
 * Update an existing practice session.
 * @param sessionId The document ID of the session to update.
 * @param updates Partial fields to update (e.g., song, duration).
 */
export const updatePracticeSession = async (sessionId: string, updates: Partial<PracticeSession>) => {
  const sessionDoc = doc(db, "sessions", sessionId);
  await updateDoc(sessionDoc, updates);
};

/**
 * Get all sessions for a specific user, sorted by date desc.
 * @param userId The UID of the authenticated user.
 */
export const getUserSessions = async (userId: string) => {
  const sessionsRef = collection(db, "sessions");
  const q = query(sessionsRef, where("userId", "==", userId), orderBy("date", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as PracticeSession[];
};

/**
 * Get all goals for a specific user, sorted by creation date desc.
 * @param userId The UID of the authenticated user.
 */
export const getUserGoals = async (userId: string) => {
  const goalsRef = collection(db, "goals");
  const q = query(goalsRef, where("userId", "==", userId), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      goal: data.goal,
      duration: data.duration,
      userId: data.userId,
      createdAt: data.createdAt,
    } as Goal;
  });
};

/**
 * Add a new goal for the current user.
 * @param userId The UID of the authenticated user.
 * @param goalText The text of the goal.
 */
export const addUserGoal = async (userId: string, goalText: string): Promise<string> => {
  try {
    const goalsRef = collection(db, "goals");

    const newGoal: Omit<Goal, "id"> = {
      goal: goalText,
      duration: "0",
      userId,
      createdAt: new Date().toISOString(),
    };
    const docRef = await addDoc(goalsRef, newGoal);
    return docRef.id;
  } catch (error) {
    console.error("Error adding new goal:", error);
    throw error;
  }
};

/**
 * Add an existing goal to a specific practice session.
 * @param sessionId The ID of the practice session.
 * @param goalId The ID of the goal to add.
 */
export const addGoalToSession = async (sessionId: string, goalId: string) => {
  try {
    const sessionDoc = doc(db, "sessions", sessionId);
    const goalDoc = doc(db, "goals", goalId);
    // Optionally, fetch the goal data if you want to embed it
    const goalSnapshot = await getDoc(goalDoc);
    if (goalSnapshot.exists()) {
      const goalData = goalSnapshot.data() as Goal;
      await updateDoc(sessionDoc, {
        goals: arrayUnion({
          ...goalData,
        }),
      });
    } else {
      throw new Error("Goal does not exist.");
    }
  } catch (error) {
    console.error("Error adding goal to session:", error);
    throw error;
  }
};

/**
 * Get all goals associated with a specific practice session.
 * @param sessionId The ID of the practice session.
 */
export const getSessionGoals = async (sessionId: string): Promise<Goal[]> => {
  try {
    const sessionDoc = doc(db, "sessions", sessionId);
    const sessionSnapshot = await getDoc(sessionDoc);
    if (sessionSnapshot.exists()) {
      const data = sessionSnapshot.data() as PracticeSession;
      return data.goals || [];
    } else {
      throw new Error("Session does not exist.");
    }
  } catch (error) {
    console.error("Error fetching session goals:", error);
    throw error;
  }
};
