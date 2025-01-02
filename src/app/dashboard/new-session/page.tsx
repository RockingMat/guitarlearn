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
import GoalsPanel from "@/components/GoalsPanel";
import SignOut from "@/components/SignOut";

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
  const [error, setError] = useState<string | null>(null);

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
            if (startTimeRef.current) {
              const newElapsed = Math.floor((Date.now() - startTimeRef.current.getTime()) / 1000);
              setElapsedSeconds(newElapsed);
            }
          }, 1000);
        } else {
          setError("Session does not exist.");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to fetch session.");
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
      setError("Failed to end session.");
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
      <div className="p-4">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">New Practice Session</h1>
          <div className="flex-none">
            {/* Reuse SignOut component */}
            <SignOut />
          </div>
        </div>

        {/* Main Content and Goals Panel */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Session Content */}
          <div className="flex-1">
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
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : (
              <div className="flex items-center justify-center">
                <p className="text-gray-600">Loading session...</p>
              </div>
            )}
          </div>

          {/* Goals Panel Sidebar */}
          {session && (
            <div className="lg:w-80 w-full">
              <GoalsPanel sessionId={sessionId ?? undefined} />
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default NewSessionPage;
