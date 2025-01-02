// components/SignOut.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import Button from "./Button";

const SignOut: React.FC = () => {
  const { signOut } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut();
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
      // Optionally, set an error state to display to the user
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleSignOut}
      variant="danger"
      isLoading={isLoading}
    >
      Sign Out
    </Button>
  );
};

export default SignOut;
