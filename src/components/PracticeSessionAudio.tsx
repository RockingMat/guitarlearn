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
   * Cleanup the Blob URL and AudioContext when the Home component unmounts
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
    <div style={{ padding: "1rem", maxWidth: "800px", margin: "0 auto" }}>
      <h1>MusicTempo Demo</h1>

      {/* Mode Selection */}
      <div style={{ marginBottom: "1rem" }}>
        <button
          onClick={() => setMode("record")}
          style={{
            padding: "0.5rem 1rem",
            marginRight: "0.5rem",
            backgroundColor: mode === "record" ? "#4CAF50" : "#f0f0f0",
            color: mode === "record" ? "#fff" : "#000",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Record Audio
        </button>
        <button
          onClick={() => setMode("upload")}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: mode === "upload" ? "#4CAF50" : "#f0f0f0",
            color: mode === "upload" ? "#fff" : "#000",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Upload Audio
        </button>
      </div>

      {/* Conditional Rendering Based on Selected Mode */}
      <div style={{ marginBottom: "1rem" }}>
        {mode === "record" ? (
          <AudioRecorder onRecordingComplete={handleFileSelect} />
        ) : (
          <AudioUploader onFileSelect={handleFileSelect} />
        )}
      </div>

      {/* Audio Player */}
      {audioUrl && <AudioPlayer audioUrl={audioUrl} onTimeUpdate={handleTimeUpdate} />}

      {/* Show the detected tempo */}
      {tempo && (
        <div style={{ marginTop: "1rem" }}>
          <p>
            Detected Tempo: <strong>{displayTempo(tempo)}</strong>
          </p>
        </div>
      )}

      {/* Input for expected tempo */}
      {audioUrl && (
        <div style={{ marginTop: "1rem" }}>
          <label htmlFor="expectedTempo">
            Expected Tempo (BPM):{" "}
            <input
              id="expectedTempo"
              type="number"
              value={expectedTempo ?? ""}
              placeholder="e.g. 120"
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setExpectedTempo(isNaN(val) ? null : val);
              }}
              style={{ padding: "0.25rem", marginLeft: "0.5rem", width: "100px" }}
            />
          </label>
        </div>
      )}

      {/* Timeline */}
      {audioUrl && (
        <Timeline
          duration={duration}
          currentTime={currentTime}
          beats={beats}
          offBeats={offBeats}
        />
      )}
    </div>
  );
};

export default PracticeSessionAudio;
