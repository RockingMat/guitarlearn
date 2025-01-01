// app/dashboard/page.tsx
"use client";

import React from "react";
import ProtectedRoute from "../../components/ProtectedRoute";
import SignOut from "../../components/SignOut";

const Dashboard: React.FC = () => {
  return (
    <ProtectedRoute>
      <div>
        <h1>Dashboard</h1>
        <SignOut />
        {/* Add more dashboard content here */}
      </div>
    </ProtectedRoute>
  );
};

export default Dashboard;
