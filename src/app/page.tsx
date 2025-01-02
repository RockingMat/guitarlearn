// app/page.tsx
"use client";

import React from "react";
import { useAuth } from "../context/AuthContext";
import SignOut from "../components/SignOut";
import { useRouter } from "next/navigation";

const HomePage: React.FC = () => {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-lg p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center mb-6">Home</h1>
        {user ? (
          <div className="space-y-4">
            <p className="text-center text-lg">Welcome, <span className="font-semibold">{user.email}</span></p>
            <div className="flex flex-col items-center space-y-4">
              <SignOut />
              <button
                onClick={() => router.push("/dashboard")}
                className="w-full px-4 py-2 font-semibold text-white bg-green-500 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <button
              onClick={() => router.push("/login")}
              className="w-full px-4 py-2 font-semibold text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              Login
            </button>
            <button
              onClick={() => router.push("/signup")}
              className="w-full px-4 py-2 font-semibold text-white bg-green-500 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400"
            >
              Sign Up
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
