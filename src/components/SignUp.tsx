// app/components/SignUp.tsx
"use client";

import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/clientApp";
import { Input } from "@/components/ui/input"; // shadcn UI Input
import { Button } from "@/components/ui/button"; // shadcn UI Button
import { useRouter } from "next/navigation";

const SignUp: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setSuccess("Account created successfully. You can now log in.");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      // Optionally, redirect the user to the sign-in page
      // router.push("/signin");
    } catch (err: any) {
      switch (err.code) {
        case "auth/email-already-in-use":
          setError("Email is already in use.");
          break;
        case "auth/invalid-email":
          setError("Invalid email address.");
          break;
        case "auth/weak-password":
          setError("Password must be at least 6 characters.");
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
        <h2 className="text-2xl font-bold text-center">Sign Up</h2>
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
            {error && error.includes("Password") && (
              <p className="text-red-500 text-sm mt-1">{error}</p>
            )}
          </div>

          {/* Confirm Password Input */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="mt-1 block w-full"
            />
            {error && error.includes("Passwords") && (
              <p className="text-red-500 text-sm mt-1">{error}</p>
            )}
          </div>

          {/* General Error Message */}
          {error && !error.includes("email") && !error.includes("Password") && !error.includes("Passwords") && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          {/* Success Message */}
          {success && <p className="text-green-500 text-sm">{success}</p>}

          {/* Submit Button */}
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Loading..." : "Sign Up"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
