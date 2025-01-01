// components/AudioPlayer.tsx
import React, { useRef, useEffect } from "react";

interface AudioPlayerProps {
  audioUrl: string | null;
  onTimeUpdate: (currentTime: number) => void;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioUrl, onTimeUpdate }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      onTimeUpdate(audioRef.current.currentTime);
    }
  };

  if (!audioUrl) return null;

  return (
    <div style={{ marginTop: "1rem" }}>
      <audio
        controls
        src={audioUrl}
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
      >
        Your browser does not support the audio element.
      </audio>
    </div>
  );
};

export default AudioPlayer;
