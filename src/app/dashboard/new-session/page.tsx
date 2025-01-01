// app/dashboard/new-session/page.tsx
"use client";

import React, { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/clientApp";
import { PracticeSession } from "@/types/PracticeSession";
import {updatePracticeSession} from "@/firebase/firestoreUtils";
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
    return <p>Loading...</p>;
  }

  return (
    <ProtectedRoute>
      <div style={{ padding: "1rem" }}>
        <h1>New Practice Session</h1>

        {session ? (
          <>
            <p>
              <strong>Elapsed:</strong> {Math.floor(elapsedSeconds / 60)}m : {elapsedSeconds % 60}s
            </p>

            {/* Song Title Input */}
            <div style={{ margin: "1rem 0" }}>
              <label>
                Song Title:{" "}
                <input
                  type="text"
                  value={songTitle}
                  onChange={(e) => setSongTitle(e.target.value)}
                  placeholder={session.song || "Enter a song name..."}
                  style={{ padding: "0.5rem", width: "200px" }}
                />
              </label>
            </div>
            {session && (<PracticeSessionAudio />)}
            {/* "End Session" button */}
            <button
              onClick={handleEndSession}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#f44336",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              End Session
            </button>
          </>
        ) : (
          <p>Loading session...</p>
        )}
      </div>
      
    </ProtectedRoute>
  );
};

export default NewSessionPage;
