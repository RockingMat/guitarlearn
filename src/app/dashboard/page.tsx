// app/dashboard/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import SignOut from "@/components/SignOut";
import { getUserSessions, createNewPracticeSession} from "@/firebase/firestoreUtils";
import { PracticeSession } from "@/types/PracticeSession";

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<PracticeSession[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const fetchSessions = async () => {
      if (user) {
        try {
          const userSessions = await getUserSessions(user.uid);
          setSessions(userSessions);
        } catch (err) {
          console.error(err);
          setError("Failed to fetch sessions.");
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
        setSessions([]);
      }
    };

    fetchSessions();
  }, [user]);

  const handleNewSession = async () => {
    if (!user) {
      setError("User is not logged in.");
      return;
    }

    try {
      // Create a new session in Firestore
      const newSessionId = await createNewPracticeSession(user.uid);

      // Redirect the user to the new-session page, passing the sessionId as a query param
      router.push(`/dashboard/new-session?sessionId=${newSessionId}`);
    } catch (err) {
      console.error(err);
      setError("Failed to create a new session.");
    }
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h1>Dashboard</h1>
      <SignOut />

      <button onClick={handleNewSession} style={{ margin: "1rem 0" }}>
        Start New Practice Session
      </button>

      {loading ? (
        <p>Loading sessions...</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : sessions.length === 0 ? (
        <p>No sessions found.</p>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
          {sessions.map((session) => (
            <div
              key={session.id}
              style={{
                border: "1px solid #ccc",
                padding: "1rem",
                borderRadius: "8px",
                width: "200px",
              }}
            >
              <p><strong>Date:</strong> {new Date(session.date).toLocaleString()}</p>
              <p><strong>Song:</strong> {session.song || "N/A"}</p>
              <p><strong>Duration:</strong> {session.duration > 0 ? `${session.duration} mins` : "In Progress"}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
