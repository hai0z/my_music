import {defaultColorObj, IPlaylist, usePlayerStore} from "../store/playerStore";
import TrackPlayer, {Event, RepeatMode} from "react-native-track-player";
import getThumbnail from "../utils/getThumnail";
import nodejs from "nodejs-mobile-react-native";
import {DEFAULT_IMG, NULL_URL} from "../constants";
import useToastStore, {ToastTime} from "../store/toastStore";
import {Alert, ToastAndroid} from "react-native";

export const objectToTrack = (data: any) => {
  return {
    id: data.encodeId,
    url:
      data.url && data.url !== "" && data.url !== null && data.url !== undefined
        ? data.url
        : NULL_URL,
    title: data.title,
    artist: data.artistsNames,
    artwork: getThumbnail(data.thumbnail),
    duration: data.duration,
  };
};

let sleepTimerCounter = 0;

TrackPlayer.addEventListener(Event.PlaybackProgressUpdated, async e => {
  const timer = usePlayerStore.getState().sleepTimer;
  if (usePlayerStore.getState().repeatMode === RepeatMode.Track) {
    const activeTrackIndex = await TrackPlayer.getActiveTrackIndex();
    if (Math.floor(e.position) === Math.floor(e.duration) - 1) {
      await TrackPlayer.skip(activeTrackIndex!);
    }
  }
  if (timer !== null) {
    sleepTimerCounter++;
    if (sleepTimerCounter === timer) {
      await TrackPlayer.pause();
      usePlayerStore.getState().setSleepTimer(null);
      sleepTimerCounter = 0;
      Alert.alert("Hẹn giờ ngủ", "Chúc bạn ngủ ngon");
    }
  } else {
    sleepTimerCounter = 0;
  }
  usePlayerStore.getState().setLastPosition(e.position);
});

TrackPlayer.addEventListener(Event.PlayerError, () => {
  ToastAndroid.show("Không thể phát", ToastAndroid.SHORT);
});
TrackPlayer.addEventListener(Event.PlaybackActiveTrackChanged, async event => {
  if (!usePlayerStore.getState().isPlayFromLocal) {
    if (!event.track) return;
    if (
      event.track.url !== NULL_URL &&
      usePlayerStore.getState().isLoadingTrack === false
    ) {
      usePlayerStore.getState().setNextTrackLoaded(true);
      usePlayerStore.getState().setCurrentSong(event.track);
      nodejs.channel.post("getSongInfo", event.track?.id);
    }
    if (
      event.index !== undefined &&
      event.track !== undefined &&
      event.track.url === NULL_URL
    ) {
      usePlayerStore.getState().isLoadingTrack === false &&
        nodejs.channel.post("getSong", event.track!);
    }
  } else {
    !usePlayerStore.getState().isLoadingTrack &&
      usePlayerStore.getState().setCurrentSong(event.track!);
    if (
      usePlayerStore.getState().savePlayerState &&
      usePlayerStore.getState().isFistInit
    )
      await TrackPlayer.seekTo(usePlayerStore.getState().lastPosition).then(
        () => {
          usePlayerStore.getState().setIsFistInit(false);
        }
      );
  }
});

nodejs.channel.addListener("getSong", async data => {
  if (data.data === NULL_URL) {
    useToastStore
      .getState()
      .show("Không thể phát bài hát này", ToastTime.SHORT);
  }
  TrackPlayer.load({
    ...data.track,
    url: data.data["128"],
  })
    .then(async () => {
      if (usePlayerStore.getState().isFistInit === false) {
        TrackPlayer.play();
      }
      if (
        usePlayerStore.getState().savePlayerState &&
        usePlayerStore.getState().isFistInit
      )
        await TrackPlayer.seekTo(usePlayerStore.getState().lastPosition).then(
          () => {
            usePlayerStore.getState().setIsFistInit(false);
          }
        );
    })
    .finally(() => usePlayerStore.getState().setNextTrackLoaded(true));
});

nodejs.channel.addListener("getSongInfo", async data => {
  usePlayerStore.getState().setTempSong(data);
});

const handlePlay = async (song: any, playlist: IPlaylist) => {
  TrackPlayer.pause();
  const currentPlaylistId = usePlayerStore.getState().playList?.id;
  usePlayerStore.getState().setIsPlayFromLocal(false);
  usePlayerStore.getState().setNextTrackLoaded(false);
  if (currentPlaylistId !== playlist.id) {
    usePlayerStore.getState().setisLoadingTrack(true);
    await TrackPlayer.setQueue(
      playlist.items.map((item: any) => objectToTrack(item))
    );
    usePlayerStore.getState().setPlayList(playlist);
    usePlayerStore.getState().setTempPlayList(playlist);
    usePlayerStore.getState().setShuffleMode(false);
    if (song.encodeId === playlist.items[0].encodeId) {
      nodejs.channel.post("getSong", objectToTrack(song));
    }
  }
  const queue = usePlayerStore.getState().playList?.items || [];
  let index = queue.findIndex((item: any) => item?.encodeId === song?.encodeId);
  if (index === -1) {
    index = 0;
  }
  await TrackPlayer.skip(index).finally(() => {
    usePlayerStore.getState().setisLoadingTrack(false);
    usePlayerStore.getState().setCurrentSong(objectToTrack(song));
  });
  TrackPlayer.play();
};
const handlePlaySongInLocal = async (song: any, playlist: IPlaylist) => {
  TrackPlayer.pause();
  usePlayerStore.getState().setIsPlayFromLocal(true);
  usePlayerStore.getState().setColor(defaultColorObj);
  const currentPlaylistId = usePlayerStore.getState().playList?.id;
  if (currentPlaylistId !== playlist.id) {
    usePlayerStore.getState().setisLoadingTrack(true);
    usePlayerStore.getState().setPlayList(playlist);
    usePlayerStore.getState().setTempPlayList(playlist);
    usePlayerStore.getState().setShuffleMode(false);
    await TrackPlayer.setQueue(
      playlist.items.map((item: any) => ({
        ...objectToTrack(item),
        url: item.url,
        artwork: item.thumbnail || DEFAULT_IMG,
      }))
    );
  }
  const queue = await TrackPlayer.getQueue();

  const index = queue.findIndex((item: any) => item?.id === song?.encodeId);
  await TrackPlayer.skip(index).finally(() => {
    usePlayerStore.getState().setisLoadingTrack(false);
  });
  await TrackPlayer.play();
};

export {handlePlay, handlePlaySongInLocal};
