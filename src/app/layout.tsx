// src/app/layout.tsx
import "./globals.css"; // Import global CSS
import { ReactNode } from "react";
import { AuthProvider } from "../context/AuthContext";

export const metadata = {
  title: "Learn Guitar",
  description: "Practice guitar effectively.",
};

interface RootLayoutProps {
  children: ReactNode;
}

const RootLayout: React.FC<RootLayoutProps> = ({ children }) => {
  return (
    <html lang="en">
      <head>
        {/* Metadata can be defined here or via the metadata export */}
      </head>
      <body><AuthProvider>{children}</AuthProvider></body>
    </html>
  );
};

export default RootLayout;
