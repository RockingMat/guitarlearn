// app/dashboard/sessions/[sessionId]/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "../../../../context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../../firebase/clientApp";
import { PracticeSession } from "../../../../types/PracticeSession";
import ProtectedRoute from "../../../../components/ProtectedRoute";
import SignOut from "../../../../components/SignOut";

const SessionDetail: React.FC = () => {
  const { user, loading } = useAuth();
  const [session, setSession] = useState<PracticeSession | null>(null);
  const [loadingSession, setLoadingSession] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Extract sessionId from the URL
  const sessionId = pathname.split("/").pop();

  useEffect(() => {
    const fetchSession = async () => {
      if (user && sessionId) {
        try {
          const sessionRef = doc(db, "users", user.uid, "sessions", sessionId);
          const sessionSnap = await getDoc(sessionRef);
          if (sessionSnap.exists()) {
            setSession({ id: sessionSnap.id, ...(sessionSnap.data() as Omit<PracticeSession, "id">) });
          } else {
            setError("Session not found.");
          }
        } catch (err: any) {
          console.error(err);
          setError("Failed to load session.");
        } finally {
          setLoadingSession(false);
        }
      }
    };

    fetchSession();
  }, [user, sessionId]);

  if (loading || loadingSession) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p style={{ color: "red" }}>{error}</p>;
  }

  if (!session) {
    return <p>No session data available.</p>;
  }

  return (
    <ProtectedRoute>
      <div>
        <h1>Practice Session Details</h1>
        <SignOut />
        <div>
          <p><strong>Date:</strong> {new Date(session.date).toLocaleDateString()}</p>
          <p><strong>Start Time:</strong> {session.startTime}</p>
          <p><strong>Duration:</strong> {session.duration} minutes</p>
          <p><strong>Song:</strong> {session.song}</p>
          {/* Add more detailed information or functionalities as needed */}
        </div>
        <button onClick={() => router.back()}>Back to Dashboard</button>
      </div>
    </ProtectedRoute>
  );
};

export default SessionDetail;
