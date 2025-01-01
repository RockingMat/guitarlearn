// components/SignOut.tsx
"use client";

import React from "react";
import { useAuth } from "../context/AuthContext";

const SignOut: React.FC = () => {
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return <button onClick={handleSignOut}>Sign Out</button>;
};

export default SignOut;
