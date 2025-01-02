// app/dashboard/new-session/page.tsx
"use client";

import React, { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/clientApp";
import { PracticeSession } from "@/types/types";
import { updatePracticeSession } from "@/firebase/firestoreUtils";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import PracticeSessionAudio from "@/components/PracticeSessionAudio";

const NewSessionPage: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");

  const [session, setSession] = useState<PracticeSession | null>(null);
  const [songTitle, setSongTitle] = useState("");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<Date | null>(null);

  useEffect(() => {
    if (!sessionId || !user) return;

    const fetchSession = async () => {
      try {
        const sessionDoc = doc(db, "sessions", sessionId);
        const snapshot = await getDoc(sessionDoc);
        if (snapshot.exists()) {
          const data = snapshot.data() as PracticeSession;
          setSession({ ...data, id: sessionId });

          // If the session was just created, data.date is the start time
          const startTime = new Date(data.date);
          startTimeRef.current = startTime;

          // Initialize elapsed time
          const now = new Date();
          const initialElapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000);
          setElapsedSeconds(initialElapsed);

          // Start a 1-second interval timer
          timerRef.current = setInterval(() => {
            const newElapsed = Math.floor((Date.now() - startTime.getTime()) / 1000);
            setElapsedSeconds(newElapsed);
          }, 1000);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchSession();

    // Cleanup timer on unmount
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [sessionId, user]);

  // Update the session in Firestore (song + duration), then go back
  const handleEndSession = async () => {
    if (!sessionId || !session?.id) return;
    if (!user) return;

    try {
      // Convert elapsedSeconds to minutes
      const totalMinutes = Math.floor(elapsedSeconds / 60);

      // If user hasn't changed the songTitle, fallback to session.song
      const finalSong = songTitle.trim() || session.song;

      await updatePracticeSession(sessionId, {
        song: finalSong,
        duration: totalMinutes,
      });

      // Stop timer
      if (timerRef.current) clearInterval(timerRef.current);

      // Redirect to Dashboard
      router.push("/dashboard");
    } catch (err) {
      console.error("Failed to end session:", err);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-md">
        {session ? (
          <>
            <div className="mb-4">
              <span className="text-lg font-semibold">Elapsed:</span>{" "}
              <span className="text-gray-700">
                {Math.floor(elapsedSeconds / 60)}m : {elapsedSeconds % 60}s
              </span>
            </div>

            {/* Song Title Input */}
            <div className="mb-6">
              <label htmlFor="songTitle" className="block text-sm font-medium text-gray-700 mb-2">
                Song Title
              </label>
              <input
                id="songTitle"
                type="text"
                value={songTitle}
                onChange={(e) => setSongTitle(e.target.value)}
                placeholder={session.song || "Enter a song name..."}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Practice Session Audio Component */}
            <div className="mb-6">
              <PracticeSessionAudio />
            </div>

            {/* "End Session" button */}
            <div className="flex justify-end">
              <button
                onClick={handleEndSession}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-md transition duration-300"
              >
                End Session
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center">
            <p className="text-gray-600">Loading session...</p>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default NewSessionPage;
