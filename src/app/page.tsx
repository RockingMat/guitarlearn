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
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h1>Home</h1>
      {user ? (
        <>
          <p>Welcome, {user.email}</p>
          <SignOut />
          <button onClick={() => router.push("/dashboard")}>Go to Dashboard</button>
        </>
      ) : (
        <>
        <button onClick={() => router.push("/login")}>Login</button>
        <button onClick={() => router.push("/signup")}>Sign Up</button>
        </>
      )}
    </div>
  );
};

export default HomePage;
