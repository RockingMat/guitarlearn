// app/components/SignIn.tsx
"use client";

import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/clientApp";
import { Input } from "@/components/ui/input"; // shadcn UI Input
import { Button } from "@/components/ui/button"; // shadcn UI Button
import { useRouter } from "next/navigation";

const SignIn: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Redirect or perform additional actions upon successful sign-in
      router.push("/dashboard");
    } catch (err: any) {
      switch (err.code) {
        case "auth/user-not-found":
          setError("No user found with this email.");
          break;
        case "auth/wrong-password":
          setError("Incorrect password.");
          break;
        case "auth/invalid-email":
          setError("Invalid email address.");
          break;
        default:
          setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center">Sign In</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Input */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="mt-1 block w-full"
            />
            {error && error.includes("email") && (
              <p className="text-red-500 text-sm mt-1">{error}</p>
            )}
          </div>

          {/* Password Input */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="mt-1 block w-full"
            />
            {error && error.includes("password") && (
              <p className="text-red-500 text-sm mt-1">{error}</p>
            )}
          </div>

          {/* General Error Message */}
          {error && !error.includes("email") && !error.includes("password") && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          {/* Submit Button */}
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Loading..." : "Sign In"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default SignIn;
