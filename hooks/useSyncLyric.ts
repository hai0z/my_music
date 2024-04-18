import { useEffect } from "react";
import { useProgress } from "react-native-track-player";
import { create } from "zustand";
import { usePlayerStore } from "../store/playerStore";


const syncLyricStore = create<{
  currentLine: number,
  setCurrent: (currentLine: number | undefined) => void
}>(
  (set) => ({
    currentLine: -1,
    setCurrent: (currentLine: number | undefined) => set({ currentLine }),
  })
)

export default function useSyncLyric() {
  const [currentLine, setCurrentLine] = syncLyricStore((state) => [state.currentLine, state.setCurrent]);
  const lyrics = usePlayerStore(state => state.lyrics);
  const progress = useProgress(100);
  useEffect(() => {
    if (lyrics) {
      let low = 0;
      let high = lyrics.length - 1;
      let result = -1;
      while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        const midTime = +lyrics[mid].startTime;
        if (midTime <= Number(progress.position * 1000)) {
          result = mid;
          low = mid + 1;
        } else {
          high = mid - 1;
        }
      }
      if (currentLine !== result) {
        setCurrentLine(result);
      }
    }
  }, [progress.position]);

  return currentLine

}