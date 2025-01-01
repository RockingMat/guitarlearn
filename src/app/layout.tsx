// src/app/layout.tsx
import "./globals.css"; // Import global CSS
import { ReactNode } from "react";
import { AuthProvider } from "../context/AuthContext";

export const metadata = {
  title: "MusicTempo Demo",
  description: "Detects the tempo of your audio files.",
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
