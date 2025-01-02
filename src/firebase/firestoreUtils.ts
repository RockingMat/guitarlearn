// firebase/firestoreUtils.ts
import { db } from "./clientApp";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDocs,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { PracticeSession } from "@/types/types";



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
        recordings: []
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
