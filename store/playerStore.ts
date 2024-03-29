import { Track } from "react-native-track-player";
import { create } from "zustand";

export interface IPlaylist {
  id: string,
  items: any[]
}
export interface Color {
  average: string;
  darkMuted: string;
  darkVibrant: string;
  dominant: string;
  lightMuted: string;
  lightVibrant: string;
  muted: string;
  platform: string;
  vibrant: string;
}
interface PlayerStore {
  color: Partial<Color>,
  playList: IPlaylist,
  setColor: (color: Partial<Color>) => void,
  setPlayList: (playlist: IPlaylist) => void,
  lyrics: any[],
  setLyrics: (lyrics: any) => void
  isLoadingTrack: boolean,
  setisLoadingTrack: (isLoadingTrack: boolean) => void,
  likedSongs: any,
  setLikedSongs: (likedSongs: any) => void
  currentSong: Track | null
  setCurrentSong: (currentSong: Track | null) => void
}
export const usePlayerStore = create<PlayerStore>((set) => ({
  playList: {
    id: "",
    items: [],
  },
  color: {
    average: "#49494949",
    darkMuted: "#49494949",
    darkVibrant: "#49494949",
    dominant: "#49494949",
    lightMuted: "#49494949",
    lightVibrant: "#49494949",
    muted: "#49494949",
    platform: "android",
    vibrant: "#49494949",
  } as Partial<Color>,
  setColor: (color: Partial<Color>) => set({ color }),
  setPlayList: (playlist: IPlaylist) => set({ playList: playlist }),
  lyrics: [],
  setLyrics: (lyrics: any) => set({ lyrics }),
  isLoadingTrack: false,
  setisLoadingTrack: (isLoadingTrack: boolean) => set({ isLoadingTrack }),
  likedSongs: [],
  setLikedSongs: (likedSongs: any) => set({ likedSongs }),
  currentSong: null,
  setCurrentSong: (currentSong: Track | null) => set({ currentSong }),
}))

