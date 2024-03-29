import {useEffect} from 'react';
import TrackPlayer, {
  AppKilledPlaybackBehavior,
  Capability,
  RepeatMode,
} from 'react-native-track-player';
import Navigation from './routes/';
import PlayerProvider from './context/PlayerProvider';

import AuthProvider from './context/AuthProvider';
import Toast from './components/toast/Toast';
import {addEventListener} from '@react-native-community/netinfo';
import useToastStore, {ToastTime} from './store/toastStore';
import React from 'react';
export default function App() {
  const [isFistInitialized, setIsFistInitialized] = React.useState(true);
  useEffect(() => {
    const setupPlayer = async () => {
      try {
        await TrackPlayer.setupPlayer();
        await TrackPlayer.setRepeatMode(RepeatMode.Queue);
        await TrackPlayer.setVolume(1);
        await TrackPlayer.updateOptions({
          capabilities: [
            Capability.Play,
            Capability.Pause,
            Capability.SkipToNext,
            Capability.SkipToPrevious,
            Capability.SeekTo,
          ],
          compactCapabilities: [
            Capability.Play,
            Capability.Pause,
            Capability.SkipToNext,
            Capability.SkipToPrevious,
          ],
          notificationCapabilities: [
            Capability.Play,
            Capability.Pause,
            Capability.SkipToNext,
            Capability.SkipToPrevious,
            Capability.SeekTo,
          ],
          android: {
            appKilledPlaybackBehavior:
              AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
            alwaysPauseOnInterruption: true,
          },
        });
      } catch (e) {}
    };
    setupPlayer();
    const unsubscribe = addEventListener(state => {
      if (isFistInitialized) {
        if (!state.isConnected)
          useToastStore.getState().show('Không có kết nối internet');
        setIsFistInitialized(false);
        return;
      }
      if (state.isConnected && !isFistInitialized) {
        useToastStore.getState().show('Đã khôi phục kết nối internet');
      }
    });
    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <AuthProvider>
      <PlayerProvider>
        <Navigation />
        <Toast />
      </PlayerProvider>
    </AuthProvider>
  );
}
