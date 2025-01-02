// app/components/GoalsPanel.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Goal } from "@/types/types";
import { getUserGoals, addUserGoal } from "@/firebase/firestoreUtils";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input"; // shadcn UI Input
import { Button } from "@/components/ui/button"; // shadcn UI Button

const GoalsPanel: React.FC = () => {
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
          setGoals(userGoals);
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
  }, [user]);

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
    <div className="w-64 bg-white border border-gray-300 rounded-lg shadow-md p-4 flex flex-col h-full">
      <h3 className="text-xl font-semibold mb-4">Your Goals</h3>
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <p className="text-gray-600">Loading goals...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : goals.length === 0 ? (
          <p className="text-gray-600">No goals found.</p>
        ) : (
          <ul className="space-y-2">
            {goals.map((goal) => (
              <li key={goal.id} className="p-2 border border-gray-200 rounded">
                <p className="text-sm font-medium">{goal.goal}</p>
                <p className="text-xs text-gray-500">
                  Duration: {goal.duration} mins
                </p>
                {/* Optionally, display recentAttempt or other details */}
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
