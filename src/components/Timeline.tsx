// components/Timeline.tsx
import React from "react";

interface TimelineProps {
  duration: number;
  currentTime: number;
  beats: number[];
  offBeats: number[]; // indices of beats that are off
}

const Timeline: React.FC<TimelineProps> = ({
  duration,
  currentTime,
  beats,
  offBeats,
}) => {
  if (duration === 0) return null;

  return (
    <div style={{ marginTop: "1rem" }}>
      <h4>Timeline:</h4>
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "50px",
          background: "#eee",
          border: "1px solid #ccc",
          borderRadius: "4px",
        }}
      >
        {/* Render beat markers */}
        {beats.map((beatTime, index) => {
          const percentage = (beatTime / duration) * 100;
          const isOffBeat = offBeats.includes(index);
          const color = isOffBeat ? "green" : "red";

          return (
            <div
              key={index}
              style={{
                position: "absolute",
                left: `${percentage}%`,
                top: 0,
                bottom: 0,
                width: "2px",
                background: color,
              }}
              title={`Beat ${index} at ${beatTime.toFixed(2)}s`}
            />
          );
        })}

        {/* Render moving current time marker */}
        <div
          style={{
            position: "absolute",
            left: `${(currentTime / duration) * 100}%`,
            top: 0,
            bottom: 0,
            width: "2px",
            background: "blue",
            transition: "left 0.1s linear",
          }}
          title={`Current Time: ${currentTime.toFixed(2)}s`}
        />
      </div>
      {/* Display current time and duration */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "0.5rem",
        }}
      >
        <span>{currentTime.toFixed(2)}s</span>
        <span>{duration.toFixed(2)}s</span>
      </div>
    </div>
  );
};

export default Timeline;
