import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  ImageBackground,
  StyleSheet,
  Image,
} from 'react-native';
import React, {useEffect} from 'react';
import useKeyBoardStatus from '../../hooks/useKeyBoardStatus';
import TrackPlayer, {State, usePlaybackState} from 'react-native-track-player';
import Entypo from 'react-native-vector-icons/Entypo';
import {useNavigation} from '@react-navigation/native';
import {usePlayerStore} from '../../store/playerStore';
import TextTicker from 'react-native-text-ticker';
import {MINI_PLAYER_HEIGHT, TABBAR_HEIGHT} from '../../constants';
import useThemeStore from '../../store/themeStore';
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeOut,
  FadeOutDown,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import HeartButton from '../HeartButton';
import useImageColor from '../../hooks/useImageColor';
import MiniPlayerProgress from './Control/MiniPlayerProgress';
import {objectToTrack} from '../../service/trackPlayerService';

const SCREEN_WIDTH = Dimensions.get('window').width;
const MiniPlayer = () => {
  const navigation = useNavigation<any>();

  const keyboardVisible = useKeyBoardStatus();

  const currentSong = usePlayerStore(state => state.currentSong);

  const setCurrentSong = usePlayerStore(state => state.setCurrentSong);
  const isPlayFromLocal = usePlayerStore(state => state.isPlayFromLocal);

  const loading = usePlayerStore(state => state.homeLoading);

  const COLOR = useThemeStore(state => state.COLOR);

  const offlineMode = usePlayerStore(state => state.offlineMode);

  const playerState = usePlaybackState();

  const {dominantColor: gradientColor} = useImageColor();

  const bgAnimated = useSharedValue('#494949');

  const isBlur = usePlayerStore(state => state.isBlur);

  const setNextTrackLoaded = usePlayerStore(state => state.setNextTrackLoaded);

  const togglePlay = (state: State | undefined) => {
    if (state !== State.Playing) {
      TrackPlayer.play();
    } else {
      TrackPlayer.pause();
    }
  };

  const handleButtonNext = async () => {
    if (!isPlayFromLocal) setNextTrackLoaded(false);
    const nextTrack = usePlayerStore
      .getState()
      .playList.items.findIndex(item => item.encodeId === currentSong?.id);
    const queue = usePlayerStore.getState().playList.items;
    if (nextTrack === queue.length - 1) {
      setCurrentSong(objectToTrack(queue[0]));
    } else {
      setCurrentSong(objectToTrack(queue[nextTrack + 1]));
    }
    await TrackPlayer.skipToNext();
  };
  useEffect(() => {
    if (!isBlur) {
      bgAnimated.value = withTiming(`${gradientColor}`, {
        duration: 550,
      });
    }
  });

  if (!currentSong || keyboardVisible || loading) {
    return null;
  }
  return (
    <Animated.View
      exiting={FadeOutDown.springify()}
      entering={FadeInDown.duration(500)}>
      <Animated.View
        className="flex flex-col justify-center absolute"
        style={[
          {
            width: SCREEN_WIDTH * 0.96,
            height: MINI_PLAYER_HEIGHT,
            transform: [{translateX: SCREEN_WIDTH * 0.02}],
            backgroundColor: isBlur ? COLOR.BACKGROUND : bgAnimated,
            borderRadius: 6,
            overflow: 'hidden',
            bottom: offlineMode ? 0 : TABBAR_HEIGHT,
          },
        ]}>
        {isBlur && (
          <View
            style={{
              width: SCREEN_WIDTH,
              height: MINI_PLAYER_HEIGHT,
              position: 'absolute',
            }}>
            <Animated.Image
              exiting={FadeOut.duration(1500)}
              key={currentSong?.id}
              blurRadius={125}
              source={{uri: currentSong?.artwork?.replace('r1x1', 'r16x9')}}
              style={[
                StyleSheet.absoluteFill,
                {
                  width: SCREEN_WIDTH,
                  height: MINI_PLAYER_HEIGHT,
                  zIndex: -1,
                },
              ]}></Animated.Image>
            <View
              style={{
                width: SCREEN_WIDTH,
                height: MINI_PLAYER_HEIGHT,
                backgroundColor: COLOR.isDark
                  ? 'rgba(0,0,0,0.25)'
                  : 'rgba(255,255,255,0.5)',
              }}
            />
          </View>
        )}
        <TouchableOpacity
          onPress={() => navigation.navigate('PlayerStack')}
          activeOpacity={1}
          style={{
            flexDirection: 'column',
            justifyContent: 'center',
            height: MINI_PLAYER_HEIGHT,
          }}>
          <Animated.View
            key={currentSong?.id}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <Animated.Image
              exiting={FadeOutDown.duration(300).springify()}
              entering={FadeInUp.duration(300).springify()}
              source={{
                uri: currentSong?.artwork,
              }}
              style={{
                width: 40,
                height: 40,
                borderRadius: 4,
                marginLeft: SCREEN_WIDTH * 0.02,
                zIndex: 10,
              }}
            />
            <Animated.View
              style={{
                marginLeft: 10,
                flex: 1,
                marginRight: 10,
              }}
              entering={FadeInUp.duration(300).springify()}
              exiting={FadeOutDown.duration(300).springify()}>
              <TextTicker
                duration={6000}
                loop
                bounce
                repeatSpacer={50}
                marqueeDelay={1000}
                style={{
                  color: COLOR.TEXT_PRIMARY,
                  fontWeight: '600',
                }}>
                {currentSong?.title}
              </TextTicker>

              <Text
                style={{
                  color: COLOR.TEXT_PRIMARY,
                  fontSize: 12,
                }}
                numberOfLines={1}>
                {currentSong?.artist}
              </Text>
            </Animated.View>

            <View
              style={{
                marginLeft: 'auto',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
              }}>
              {!isPlayFromLocal && <HeartButton heartIconSize={24} />}
              <TouchableOpacity onPress={() => togglePlay(playerState.state)}>
                <Entypo
                  name={
                    playerState.state !== State.Playing
                      ? 'controller-play'
                      : 'controller-paus'
                  }
                  size={28}
                  color={COLOR.TEXT_PRIMARY}
                />
              </TouchableOpacity>
              <TouchableOpacity className=" mr-4" onPress={handleButtonNext}>
                <Entypo
                  name={'controller-fast-forward'}
                  size={28}
                  color={COLOR.TEXT_PRIMARY}
                />
              </TouchableOpacity>
            </View>
          </Animated.View>
        </TouchableOpacity>
        <MiniPlayerProgress />
      </Animated.View>
    </Animated.View>
  );
};

export default MiniPlayer;
