import React, {useEffect} from 'react';
import {usePlayerStore} from '../store/playerStore';
import {getColors} from 'react-native-image-colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TrackPlayer from 'react-native-track-player';
import getThumbnail from '../utils/getThumnail';
import nodejs from 'nodejs-mobile-react-native';
import {NULL_URL} from '../constants';
import {collection, onSnapshot, query} from 'firebase/firestore';
import {auth, db} from '../firebase/config';
const PlayerContext = React.createContext({});

nodejs.start('main.js');

nodejs.channel.addListener('getLyric', async data => {
  usePlayerStore.getState().setLyrics(data);
});

const PlayerProvider = ({children}: {children: React.ReactNode}) => {
  const {
    setLyrics,
    setColor,
    playList,
    setPlayList,
    setLikedSongs,
    currentSong,
  } = usePlayerStore(state => state);

  useEffect(() => {
    const q = query(collection(db, `users/${auth.currentUser?.uid}/likedSong`));
    const unsub = onSnapshot(q, querySnapshot => {
      const songs = [] as any;
      querySnapshot.forEach(doc => {
        songs.push(doc.data());
      });
      setLikedSongs(songs);
    });
    return () => {
      unsub();
    };
  }, []);
  const getSongColors = async () => {
    if (currentSong?.artwork !== undefined) {
      getColors(currentSong.artwork, {
        fallback: '#0098db',
        quality: 'lowest',
        pixelSpacing: 1000,
      }).then(setColor);
    }
  };

  const initPlayer = async () => {
    let data = await AsyncStorage.getItem('playlist');
    data = JSON.parse(data as string);
    let storedSong = await AsyncStorage.getItem('currentSong');
    storedSong = JSON.parse(storedSong as string);
    const dataPlaylist = data as any;
    const currentSong = storedSong as any;
    if (dataPlaylist.items.length > 0 && dataPlaylist) {
      await TrackPlayer.reset();
      setPlayList(dataPlaylist);
      await TrackPlayer.add(
        dataPlaylist.items.map((item: any) => {
          return {
            id: item?.encodeId,
            url: NULL_URL,
            title: item.title,
            artist: item.artistsNames,
            artwork: getThumbnail(item.thumbnail),
            duration: item.duration,
          };
        }),
      );
      const index = dataPlaylist.items.findIndex(
        (item: any) => item?.encodeId === currentSong?.id,
      );
      await TrackPlayer.skip(index === -1 ? 0 : index);
    } else {
      if (currentSong != null) {
        await TrackPlayer.add({
          id: currentSong?.id,
          url: NULL_URL,
          title: currentSong.title,
          artist: currentSong.artist,
          artwork: getThumbnail(currentSong.artwork),
          duration: currentSong.duration,
        });
      }
    }
    getSongColors();
  };

  useEffect(() => {
    initPlayer();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await AsyncStorage.setItem('playlist', JSON.stringify(playList));
      } catch (e) {
        console.log(e);
      }
    })();
  }, [playList.id]);

  useEffect(() => {
    (async () => {
      try {
        if (currentSong)
          await AsyncStorage.setItem(
            'currentSong',
            JSON.stringify(currentSong),
          );
      } catch (e) {
        console.log(e);
      }
    })();
  }, [currentSong?.id]);

  useEffect(() => {
    getSongColors();
  }, [currentSong?.id]);

  useEffect(() => {
    setLyrics([]);
    nodejs.channel.post('getLyric', currentSong?.id);
  }, [currentSong?.id]);

  return <PlayerContext.Provider value={{}}>{children}</PlayerContext.Provider>;
};

export default PlayerProvider;
