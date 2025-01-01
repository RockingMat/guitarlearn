// utils/computeTempoAndBeats.ts
import MusicTempo from "music-tempo";

export const computeMusicalProperties = (buffer: AudioBuffer) => {
  // Merge channels into a single array
  let audioData: number[] = [];
  if (buffer.numberOfChannels === 2) {
    const ch1 = buffer.getChannelData(0);
    const ch2 = buffer.getChannelData(1);
    const length = ch1.length;
    for (let i = 0; i < length; i++) {
      audioData[i] = (ch1[i] + ch2[i]) / 2;
    }
  } else {
    audioData = Array.from(buffer.getChannelData(0));
  }

  // Create MusicTempo instance
  const mt = new MusicTempo(audioData);

  return {
    tempo: mt.tempo,
    beats: mt.beats, // Array of beat times in seconds
  };
};
