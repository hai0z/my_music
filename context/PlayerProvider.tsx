import React, {useCallback, useEffect, useRef} from 'react';
import {usePlayerStore} from '../store/playerStore';
import {getColors} from 'react-native-image-colors';
import TrackPlayer from 'react-native-track-player';
import nodejs from 'nodejs-mobile-react-native';
import {getData, storeData} from '../utils/localStorage';
import {objectToTrack} from '../service/trackPlayerService';
import getThumbnail from '../utils/getThumnail';
import {BottomSheetModal} from '@gorhom/bottom-sheet';
import {BottomSheetModalMethods} from '@gorhom/bottom-sheet/lib/typescript/types';
import useBottomSheetStore from '../store/bottomSheetStore';
import {NULL_URL} from '../constants';
import useThemeStore from '../store/themeStore';

interface ContextType {
  bottomSheetModalRef: React.RefObject<BottomSheetModalMethods>;
  showBottomSheet: (item: any) => void;
  isLoading: boolean;
}

export const PlayerContext = React.createContext({} as ContextType);

nodejs.start('main.js');

nodejs.channel.addListener('getLyric', async data => {
  usePlayerStore.getState().setLyrics(data);
});

const PlayerProvider = ({children}: {children: React.ReactNode}) => {
  const {
    setLyrics,
    playList,
    setPlayList,
    currentSong,
    setCurrentSong,
    isPlayFromLocal,
    setIsPlayFromLocal,
  } = usePlayerStore(state => state);

  const getSongColors = async () => {
    if (usePlayerStore.getState().currentSong?.artwork !== null) {
      getColors(
        getThumbnail(usePlayerStore.getState().currentSong?.artwork!, 32),
        {
          fallback: '#0098DB',
          cache: true,
          key: usePlayerStore.getState().currentSong?.id,
        },
      ).then(usePlayerStore.getState().setColor);
    }
  };
  const [isLoading, setIsLoading] = React.useState(true);
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const {setData} = useBottomSheetStore(state => state);

  const showBottomSheet = useCallback((item: any) => {
    bottomSheetModalRef.current?.present();
    setData(item);
  }, []);

  const getTheme = async () => {
    const data = await getData('theme');
    if (data != null) {
      useThemeStore.getState().setTheme(data);
      setIsLoading(false);
    } else {
      useThemeStore.getState().setTheme('light');
      setIsLoading(false);
    }
  };
  const getLatestSong = async () => {
    const data = await getData('currentSong');
    if (data != null) {
      setCurrentSong(data);
      getSongColors();
      return data;
    }
  };

  const getDataPlaylist = async () => {
    const data = await getData('playlist');
    if (data != null) {
      setPlayList(data);
      return data;
    }
  };
  const getPlayFromLocal = async () => {
    const data = await getData('isPlayFromLocal');
    if (data != null) {
      setIsPlayFromLocal(data);
      return data;
    }
  };

  const initPlayer = async () => {
    let dataPlaylist = await getData('playlist');
    let storedSong = await getData('currentSong');
    let iplc = await getData('isPlayFromLocal');
    if (iplc === null) {
      setIsPlayFromLocal(false);
    } else {
      setIsPlayFromLocal(iplc);
    }
    console.log({storedSong, dataPlaylist});
    if (dataPlaylist.items.length > 0 && dataPlaylist.id !== '' && storedSong) {
      const index = dataPlaylist.items.findIndex(
        (item: any) => item?.encodeId === storedSong?.id,
      );
      if (index === -1) {
        setCurrentSong(storedSong);
        await TrackPlayer.add(storedSong);
        return;
      }
      await TrackPlayer.reset();
      setPlayList(dataPlaylist);
      await TrackPlayer.add(
        dataPlaylist.items.map((item: any) => objectToTrack(item)),
      );
      await TrackPlayer.skip(index);
    } else {
      if (storedSong !== null && storedSong.url === NULL_URL) {
        setCurrentSong(objectToTrack(storedSong));
        await TrackPlayer.add(objectToTrack(storedSong));
      } else {
        setCurrentSong(storedSong);
        await TrackPlayer.add(storedSong);
      }
    }
  };

  useEffect(() => {
    getTheme();
    getLatestSong();
    getDataPlaylist();
    getPlayFromLocal();
    initPlayer();
  }, []);

  useEffect(() => {
    storeData('isPlayFromLocal', isPlayFromLocal);
  }, [isPlayFromLocal]);

  useEffect(() => {
    storeData('playlist', playList);
  }, [playList.id]);

  useEffect(() => {
    if (!isPlayFromLocal) {
      if (currentSong) getSongColors();
      setLyrics([]);
      nodejs.channel.post('getLyric', currentSong?.id);
    }
    storeData('currentSong', currentSong);
  }, [currentSong?.id]);

  return (
    <PlayerContext.Provider
      value={{bottomSheetModalRef, showBottomSheet, isLoading}}>
      {!isLoading && children}
    </PlayerContext.Provider>
  );
};

export default PlayerProvider;
