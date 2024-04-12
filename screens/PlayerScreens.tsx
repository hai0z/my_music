import {
  View,
  Text,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';

import React, {useContext, useEffect, useState} from 'react';
import Entypo from 'react-native-vector-icons/Entypo';
import {LinearGradient} from 'react-native-linear-gradient';
import {playFromMapping, usePlayerStore} from '../store/playerStore';
import Player from '../components/Player/Player';
import {useNavigation} from '@react-navigation/native';
import Lyric from '../components/Player/Lyric';
import TextTicker from 'react-native-text-ticker';
import ImageSlider from '../components/Player/ImageSlider';
import ArtistCard from '../components/Player/ArtistCard';
import SongInfoCard from '../components/Player/SongInfoCard';
import {useActiveTrack} from 'react-native-track-player';
import useDarkColor from '../hooks/useDarkColor';
import useThemeStore from '../store/themeStore';
import tinycolor from 'tinycolor2';
import {DEFAULT_IMG} from '../constants';
import {PlayerContext} from '../context/PlayerProvider';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  FadeOut,
  FlipInEasyX,
  SlideInUp,
  StretchInX,
  ZoomIn,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import HeartButton from '../components/HeartButton';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

const TextAnimated = Animated.createAnimatedComponent(TextTicker);
const PlayerScreens = () => {
  const {playList, color, playFrom, isPlayFromLocal} = usePlayerStore(
    state => state,
  );
  const navigation = useNavigation<any>();
  const track = useActiveTrack();

  const {COLOR} = useThemeStore(state => state);

  const {showBottomSheet} = useContext(PlayerContext);

  const gradientColor = COLOR.isDark
    ? useDarkColor(color.dominant!, 35)
    : tinycolor(color.dominant!).isDark()
    ? tinycolor(color.dominant!).lighten(55).toString()
    : tinycolor(color.dominant!).darken(10).toString();

  const bgAnimated = useSharedValue(`transparent`);

  useEffect(() => {
    bgAnimated.value = withTiming(`${gradientColor}`, {
      duration: 750,
    });
  }, [gradientColor]);

  return (
    <ScrollView
      style={{backgroundColor: COLOR.BACKGROUND}}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingBottom: 100,
      }}>
      <View
        className="pt-[35px]"
        style={{
          height: SCREEN_HEIGHT * 0.75,
          backgroundColor: COLOR.BACKGROUND,
        }}>
        <LinearGradient
          colors={['transparent', COLOR.BACKGROUND]}
          style={[
            StyleSheet.absoluteFill,
            {
              width: SCREEN_WIDTH,
              height: SCREEN_HEIGHT,
              bottom: 0,
              zIndex: 1,
            },
          ]}
        />
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              width: SCREEN_WIDTH,
              height: SCREEN_HEIGHT,
              backgroundColor: bgAnimated,
            },
          ]}
        />
        <View className="flex flex-row items-center justify-between px-6">
          <TouchableOpacity
            className="z-50"
            onPress={() => navigation.goBack()}>
            <Entypo name="chevron-down" size={24} color={COLOR.TEXT_PRIMARY} />
          </TouchableOpacity>
          <View className="flex-1">
            <Text
              className=" uppercase text-center text-[12px]"
              style={{color: COLOR.TEXT_PRIMARY}}>
              Đang phát từ {playFromMapping[playFrom.id]}
            </Text>
            <Text
              className=" font-semibold text-center"
              style={{color: COLOR.TEXT_PRIMARY}}>
              {playFrom.name}
            </Text>
          </View>
          <TouchableOpacity onPress={() => showBottomSheet(track)}>
            <Entypo
              name="dots-three-vertical"
              size={20}
              color={COLOR.TEXT_PRIMARY}
            />
          </TouchableOpacity>
        </View>
        {playList?.items?.length > 0 ? (
          <ImageSlider />
        ) : (
          <View
            style={{
              marginTop: SCREEN_HEIGHT * 0.1,
              zIndex: 100,
              width: SCREEN_WIDTH,
            }}>
            <View
              style={{
                width: SCREEN_WIDTH,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Animated.Image
                entering={FadeIn.duration(300).springify().delay(300)}
                exiting={FadeOut.duration(300).springify()}
                source={{uri: track?.artwork || DEFAULT_IMG}}
                className="rounded-md z-20"
                style={{
                  height: SCREEN_WIDTH * 0.85,
                  width: SCREEN_WIDTH * 0.85,
                }}
              />
            </View>
          </View>
        )}
        <View
          className="flex flex-row justify-between px-6 items-center "
          style={{
            marginTop: SCREEN_HEIGHT * 0.1,
          }}>
          <Animated.View
            className="z-50 flex-1 mr-4"
            key={track?.id}
            entering={FadeInUp.duration(300).springify().delay(300)}
            exiting={FadeOut.duration(300)}>
            <TextAnimated
              key={track?.id}
              style={{color: COLOR.TEXT_PRIMARY}}
              className=" font-bold text-lg"
              duration={10000}
              loop
              bounce
              repeatSpacer={50}
              marqueeDelay={3000}>
              {track?.title}
            </TextAnimated>
            <Animated.Text
              className=" font-semibold"
              style={{color: COLOR.TEXT_SECONDARY}}>
              {track?.artist}
            </Animated.Text>
          </Animated.View>
          {!isPlayFromLocal && <HeartButton heartIconSize={28} />}
        </View>
      </View>
      <View className="px-6 w-full">
        <View className="mt-4">
          <Player />
        </View>
        <View className="flex flex-row justify-end mt-2">
          <TouchableOpacity onPress={() => navigation.navigate('Queue')}>
            <MaterialIcons
              name="queue-music"
              size={24}
              color={COLOR.TEXT_PRIMARY}
            />
          </TouchableOpacity>
        </View>
        <Lyric />
        <ArtistCard />
        <SongInfoCard />
      </View>
    </ScrollView>
  );
};

export default PlayerScreens;
