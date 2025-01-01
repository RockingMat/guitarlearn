// app/login/page.tsx
"use client";

import React from "react";
import SignIn from "../../components/SignIn";

const LoginPage: React.FC = () => {
  return (
    <div>
      <h1>Login</h1>
      <SignIn />
    </div>
  );
};

export default LoginPage;
