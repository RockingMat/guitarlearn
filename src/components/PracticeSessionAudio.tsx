// components/PracticeSessionAudio.tsx
import React, { useState, useEffect, useRef } from "react";
import AudioRecorder from "@/components/AudioRecorder";
import AudioUploader from "@/components/AudioUploader";
import AudioPlayer from "@/components/AudioPlayer";
import Timeline from "@/components/Timeline";
import { computeMusicalProperties } from "@/utils/computeMusicalProperties";

const PracticeSessionAudio: React.FC = () => {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [tempo, setTempo] = useState<string | null>(null);
  const [beats, setBeats] = useState<number[]>([]);
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [offBeats, setOffBeats] = useState<number[]>([]);
  const [expectedTempo, setExpectedTempo] = useState<number | null>(null);
  const [mode, setMode] = useState<"upload" | "record">("record"); // New state for mode selection

  // Reference to store the current Blob URL for cleanup
  const currentAudioUrlRef = useRef<string | null>(null);

  // Reference to the AudioContext
  const audioContextRef = useRef<AudioContext | null>(null);

  /**
   * Handle file selection from recorder or uploader
   * @param file - The selected or recorded audio file
   */
  const handleFileSelect = async (file: File) => {
    // Create a new Blob URL for the selected file
    const fileUrl = URL.createObjectURL(file);

    // Revoke the previous Blob URL to free up memory
    if (currentAudioUrlRef.current) {
      URL.revokeObjectURL(currentAudioUrlRef.current);
    }

    // Update the state with the new Blob URL
    setAudioUrl(fileUrl);
    currentAudioUrlRef.current = fileUrl;

    // Reset other states
    setTempo(null);
    setBeats([]);
    setOffBeats([]);
    setExpectedTempo(null);
    setDuration(0);
    setCurrentTime(0);

    // Create or reuse the AudioContext
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    const audioContext = audioContextRef.current;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      setDuration(audioBuffer.duration);

      // Compute tempo and beats
      const { tempo: detectedTempo, beats: detectedBeats } = computeMusicalProperties(audioBuffer);
      setTempo(detectedTempo);
      setBeats(detectedBeats);
      console.log("Detected tempo:", detectedTempo, "Detected beats:", detectedBeats);
    } catch (error) {
      console.error("Error decoding audio data:", error);
    }
  };

  /**
   * Cleanup the Blob URL and AudioContext when the component unmounts
   */
  useEffect(() => {
    return () => {
      if (currentAudioUrlRef.current) {
        URL.revokeObjectURL(currentAudioUrlRef.current);
      }
      // Close the AudioContext to free resources
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  /**
   * Recompute offBeats whenever beats or expectedTempo changes.
   * Highlights a beat (index i) if:
   *    beats[i] - beats[i-1] > (60 / expectedTempo)
   */
  useEffect(() => {
    if (!expectedTempo || beats.length <= 1) {
      setOffBeats([]);
      return;
    }

    const expectedBeatDuration = 60 / expectedTempo;
    const newOffBeats: number[] = [];

    for (let i = 1; i < beats.length; i++) {
      const gap = beats[i] - beats[i - 1];
      if (Math.abs(gap - expectedBeatDuration) > 0.1) {
        newOffBeats.push(i);
      }
    }

    setOffBeats(newOffBeats);
  }, [beats, expectedTempo]);

  /**
   * Callback for audio player time updates
   * @param time - The current playback time
   */
  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);
  };

  /**
   * Display tempo in BPM (string)
   * @param temp - Tempo value
   * @returns Formatted tempo string
   */
  const displayTempo = (temp: string | null): string => {
    if (temp) return `${temp} BPM`;
    return "N/A";
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-100 rounded-md shadow-md">
      {/* Mode Selection */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setMode("record")}
          className={`flex-1 py-2 px-4 rounded-md font-semibold transition duration-300
            ${
              mode === "record"
                ? "bg-green-500 text-white hover:bg-green-600"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
        >
          Record Audio
        </button>
        <button
          onClick={() => setMode("upload")}
          className={`flex-1 py-2 px-4 rounded-md font-semibold transition duration-300
            ${
              mode === "upload"
                ? "bg-green-500 text-white hover:bg-green-600"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
        >
          Upload Audio
        </button>
      </div>

      {/* Conditional Rendering Based on Selected Mode */}
      <div className="mb-6">
        {mode === "record" ? (
          <AudioRecorder onRecordingComplete={handleFileSelect} />
        ) : (
          <AudioUploader onFileSelect={handleFileSelect} />
        )}
      </div>

      {/* Audio Player */}
      {audioUrl && (
        <div className="mb-6">
          <AudioPlayer audioUrl={audioUrl} onTimeUpdate={handleTimeUpdate} />
        </div>
      )}

      {/* Show the detected tempo */}
      {tempo && (
        <div className="mb-6">
          <p className="text-lg">
            Detected Tempo: <span className="font-semibold text-blue-600">{displayTempo(tempo)}</span>
          </p>
        </div>
      )}

      {/* Input for expected tempo */}
      {audioUrl && (
        <div className="mb-6">
          <label htmlFor="expectedTempo" className="block text-sm font-medium text-gray-700">
            Expected Tempo (BPM):
          </label>
          <input
            id="expectedTempo"
            type="number"
            value={expectedTempo ?? ""}
            placeholder="e.g. 120"
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setExpectedTempo(isNaN(val) ? null : val);
            }}
            className="mt-1 block w-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      )}

      {/* Timeline */}
      {audioUrl && (
        <div className="mb-6">
          <Timeline duration={duration} currentTime={currentTime} beats={beats} offBeats={offBeats} />
        </div>
      )}
    </div>
  );
};

export default PracticeSessionAudio;
