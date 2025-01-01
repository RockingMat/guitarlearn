// components/AudioUploader.tsx
import React from "react";

interface AudioUploaderProps {
  onFileSelect: (file: File) => void;
}

const AudioUploader: React.FC<AudioUploaderProps> = ({ onFileSelect }) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    onFileSelect(files[0]);
  };

  return (
    <div>
      <input type="file" accept="audio/*" onChange={handleFileChange} />
    </div>
  );
};

export default AudioUploader;
