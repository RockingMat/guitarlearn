// app/dashboard/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import SignOut from "@/components/SignOut";
import GoalsPanel from "@/components/GoalsPanel"; // Import GoalsPanel
import { getUserSessions, createNewPracticeSession } from "@/firebase/firestoreUtils";
import { PracticeSession } from "@/types/types";

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
    <div className="p-4">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex-none">
          <SignOut />
        </div>
      </div>

      {/* Main Content and Goals Panel */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Dashboard Content */}
        <div className="flex-1">
          <button
            onClick={handleNewSession}
            className="bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded mb-6 transition duration-300"
          >
            Start New Practice Session
          </button>

          {loading ? (
            <p className="text-gray-600">Loading sessions...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : sessions.length === 0 ? (
            <p className="text-gray-600">No sessions found.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="border border-gray-300 rounded-lg p-4 shadow hover:shadow-md transition duration-300"
                >
                  <p className="mb-2">
                    <strong>Date:</strong> {new Date(session.date).toLocaleString()}
                  </p>
                  <p className="mb-2">
                    <strong>Song:</strong> {session.song || "N/A"}
                  </p>
                  <p>
                    <strong>Duration:</strong>{" "}
                    {session.duration > 0 ? `${session.duration} mins` : "In Progress"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Goals Panel Sidebar */}
        <div className="lg:w-80 w-full">
          <GoalsPanel />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
