"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import SignOut from "@/components/SignOut";
import GoalsPanel from "@/components/GoalsPanel";
import { getUserSessions, createNewPracticeSession } from "@/firebase/firestoreUtils";
import { PracticeSession } from "@/types/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PlusCircle, Clock, Music } from 'lucide-react';

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
      const newSessionId = await createNewPracticeSession(user.uid);
      router.push(`/dashboard/new-session?sessionId=${newSessionId}`);
    } catch (err) {
      console.error(err);
      setError("Failed to create a new session.");
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <header className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex-none">
          <SignOut />
        </div>
      </header>
      <Separator />
      <main className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={handleNewSession} className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" />
                Start New Practice Session
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Recent Practice Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-muted-foreground">Loading sessions...</p>
              ) : error ? (
                <p className="text-destructive">{error}</p>
              ) : sessions.length === 0 ? (
                <p className="text-muted-foreground">No sessions found.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {sessions.slice(0, 4).map((session) => (
                    <Card key={session.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-center space-x-4">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {new Date(session.date).toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className="mt-2 font-semibold">{session.song || "Untitled Session"}</h3>
                        <div className="flex items-center mt-2 space-x-4">
                          <Music className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {session.duration > 0 ? `${session.duration} mins` : "In Progress"}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="lg:w-80 w-full">
          <GoalsPanel />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;