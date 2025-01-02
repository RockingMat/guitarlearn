// app/components/GoalsPanel.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Goal } from "@/types/types";
import {
  getUserGoals,
  addUserGoal,
  addGoalToSession,
  getSessionGoals,
} from "@/firebase/firestoreUtils";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input"; // shadcn UI Input
import { Button } from "@/components/ui/button"; // shadcn UI Button

interface GoalsPanelProps {
  sessionId?: string;
}

const GoalsPanel: React.FC<GoalsPanelProps> = ({ sessionId }) => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newGoal, setNewGoal] = useState("");
  const [loading, setLoading] = useState<boolean>(true);
  const [adding, setAdding] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch goals on component mount
  useEffect(() => {
    const fetchGoals = async () => {
      if (user) {
        try {
          const userGoals = await getUserGoals(user.uid);
          if (sessionId) {
            // If in session context, fetch session-specific goals
            const sessionGoals = await getSessionGoals(sessionId);
            // Filter user goals to exclude those already in the session
            const filteredGoals = userGoals.filter(
              (goal) => !sessionGoals.find((sGoal) => sGoal.id === goal.id)
            );
            setGoals(filteredGoals);
          } else {
            // In dashboard context, display all user goals
            setGoals(userGoals);
          }
        } catch (err) {
          console.error(err);
          setError("Failed to fetch goals.");
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    fetchGoals();
  }, [user, sessionId]);

  // Handle adding a new goal
  const handleAddGoal = async () => {
    if (!user) {
      setError("User is not authenticated.");
      return;
    }
    if (newGoal.trim() === "") {
      setError("Goal cannot be empty.");
      return;
    }
    setAdding(true);
    setError(null);
    try {
      const goalId = await addUserGoal(user.uid, newGoal.trim());
      if (sessionId) {
        // If in session context, associate the new goal with the session
        await addGoalToSession(sessionId, goalId);
      }
      const addedGoal: Goal = {
        id: goalId,
        goal: newGoal.trim(),
        duration: "0",
        userId: user.uid,
        createdAt: new Date().toISOString(),
      };
      setGoals([addedGoal, ...goals]);
      setNewGoal("");
    } catch (err) {
      console.error(err);
      setError("Failed to add goal.");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="w-full lg:w-64 bg-white border border-gray-300 rounded-lg shadow-md p-4 flex flex-col h-full">
      <h3 className="text-xl font-semibold mb-4">
        {sessionId ? "Session Goals" : "Your Goals"}
      </h3>
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <p className="text-gray-600">Loading goals...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : goals.length === 0 ? (
          <p className="text-gray-600">
            {sessionId
              ? "No available goals for this session."
              : "No goals found."}
          </p>
        ) : (
          <ul className="space-y-2">
            {goals.map((goal) => (
              <li key={goal.id} className="p-2 border border-gray-200 rounded flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium">{goal.goal}</p>
                  <p className="text-xs text-gray-500">
                    Duration: {goal.duration} mins
                  </p>
                </div>
                {sessionId && (
                  <Button
                    size="sm"
                    onClick={async () => {
                      try {
                        await addGoalToSession(sessionId, goal.id);
                        // Remove the added goal from the available list
                        setGoals(goals.filter((g) => g.id !== goal.id));
                      } catch (err) {
                        console.error(err);
                        setError("Failed to add goal to session.");
                      }
                    }}
                  >
                    Add
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="mt-4">
        <div className="mb-2">
          <label htmlFor="newGoal" className="block text-sm font-medium text-gray-700">
            New Goal
          </label>
          <Input
            id="newGoal"
            type="text"
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
            placeholder="Enter your goal"
            className="mt-1 block w-full"
          />
        </div>
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        <Button
          onClick={handleAddGoal}
          disabled={adding}
          className="mt-2 w-full"
        >
          {adding ? "Adding..." : "Add Goal"}
        </Button>
      </div>
    </div>
  );
};

export default GoalsPanel;
