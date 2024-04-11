import {View, Text, Image} from 'react-native';
import React, {useEffect, useMemo, useState} from 'react';
import useThemeStore from '../store/themeStore';

import AntDesign from 'react-native-vector-icons/AntDesign';
import {playFromMapping, usePlayerStore} from '../store/playerStore';
import {useNavigation} from '@react-navigation/native';

import {TouchableOpacity} from 'react-native-gesture-handler';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {FlashList} from '@shopify/flash-list';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
  ReduceMotion,
  SharedTransition,
} from 'react-native-reanimated';
import PlayButton from '../components/Player/Control/PlayButton';
import PrevButton from '../components/Player/Control/PrevButton';
import NextButton from '../components/Player/Control/NextButton';
import TrackPlayer, {useProgress} from 'react-native-track-player';
import LinearGradient from 'react-native-linear-gradient';
import useDarkColor from '../hooks/useDarkColor';
import tinycolor from 'tinycolor2';
import Entypo from 'react-native-vector-icons/Entypo';
const Queue = () => {
  const {COLOR} = useThemeStore(state => state);

  const {playFrom, currentSong, playList, color} = usePlayerStore(
    state => state,
  );

  const navigation = useNavigation<any>();

  const trackIndex = playList.items.findIndex(
    item => item.encodeId == currentSong?.id,
  );
  const [copyPlaylist, setCopyPlaylist] = useState([...playList.items]);

  const progress = useProgress(100);

  const gradientColor = useMemo(() => {
    return COLOR.isDark
      ? useDarkColor(color.dominant!, 35)
      : tinycolor(color.dominant!).isDark()
      ? tinycolor(color.dominant!).lighten(55).toString()
      : tinycolor(color.dominant!).lighten(10).toString();
  }, [color.dominant, COLOR]);

  const handlePlay = async (item: any) => {
    const index = playList.items.findIndex(
      items => items.encodeId == item?.encodeId,
    );
    await TrackPlayer.skip(index);
  };

  useEffect(() => {
    setCopyPlaylist(
      playList.items
        .filter(item => item.encodeId !== currentSong?.id)
        .splice(trackIndex, playList.items.length - trackIndex),
    );
  }, [currentSong?.id]);
  return (
    <View
      className="pt-[35px] flex-1"
      style={{backgroundColor: COLOR.BACKGROUND}}>
      <LinearGradient
        colors={[gradientColor!, `${gradientColor}50`, COLOR.BACKGROUND]}
        className="absolute top-0 left-0 right-0"
        style={{height: hp(25)}}
      />
      <View className="flex flex-row items-center justify-between px-6">
        <Animated.View entering={FadeIn.duration(300)} exiting={FadeOut}>
          <TouchableOpacity
            className="z-50"
            onPress={() => navigation.goBack()}>
            <AntDesign name="close" size={24} color={COLOR.TEXT_PRIMARY} />
          </TouchableOpacity>
        </Animated.View>
        <View className="flex-1">
          <Animated.Text
            entering={FadeInDown.duration(300).springify()}
            className=" uppercase text-center text-[12px]"
            style={{color: COLOR.TEXT_PRIMARY}}>
            Đang phát từ {playFromMapping[playFrom.id]}
          </Animated.Text>
          <Animated.Text
            entering={FadeInDown.duration(300).delay(300).springify()}
            className=" font-semibold text-center"
            style={{color: COLOR.TEXT_PRIMARY}}>
            {playFrom.name}
          </Animated.Text>
        </View>
        <TouchableOpacity>
          <Entypo
            name="dots-three-vertical"
            size={20}
            color={COLOR.TEXT_PRIMARY}
          />
        </TouchableOpacity>
      </View>
      <View className="mt-4 flex-1 px-6">
        <FlashList
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={() => (
            <View>
              <View>
                <Text style={{color: COLOR.TEXT_PRIMARY}} className="font-bold">
                  Đang phát
                </Text>
                <View>
                  <Animated.View className="flex flex-row mt-2">
                    <Image
                      className="rounded-md"
                      src={currentSong?.artwork}
                      style={{width: wp(14), height: wp(14)}}
                    />
                    <View className="flex justify-center ml-2 flex-1 ">
                      <Text
                        className="font-semibold"
                        numberOfLines={1}
                        style={{
                          color: COLOR.TEXT_PRIMARY,
                          fontSize: wp(4),
                        }}>
                        {playList.items[trackIndex].title}
                      </Text>
                      <Text
                        numberOfLines={1}
                        style={{
                          color: COLOR.TEXT_SECONDARY,
                          fontSize: wp(3.5),
                        }}>
                        {playList.items[trackIndex].artistsNames}
                      </Text>
                    </View>
                  </Animated.View>
                </View>
              </View>
              <View className="mt-6">
                <Text style={{color: COLOR.TEXT_PRIMARY}} className="font-bold">
                  Phát tiếp từ: {playFrom.name}
                </Text>
              </View>
            </View>
          )}
          data={copyPlaylist}
          estimatedItemSize={70}
          keyExtractor={item => item.encodeId}
          renderItem={({item, index}) => {
            return (
              <TrackItem
                COLOR={COLOR}
                item={item}
                index={index}
                onClick={handlePlay}
              />
            );
          }}
        />
      </View>
      <View className=" py-4 flex items-center justify-center w-full">
        <View className="absolute top-0 w-full">
          <View
            style={{
              height: 2.5,
              maxWidth: '100%',
              position: 'relative',
              marginHorizontal: 8,
              borderRadius: 2.5,
              backgroundColor: COLOR.isDark ? '#ffffff90' : '#00000020',
              zIndex: 2,
            }}>
            <View
              style={{
                width: `${(progress.position / progress.duration) * 100}%`,
                height: 2.5,
                backgroundColor: COLOR.TEXT_PRIMARY,
                position: 'absolute',
                borderTopLeftRadius: 2.5,
                borderBottomLeftRadius: 2.5,
              }}
            />
          </View>
        </View>
        <Animated.View className="flex flex-row justify-center items-center px-6">
          <PrevButton />
          <PlayButton />
          <NextButton />
        </Animated.View>
      </View>
    </View>
  );
};

const TrackItem = React.memo((props: any) => {
  const {item, onClick, COLOR} = props;
  return (
    <TouchableOpacity
      style={{opacity: item?.streamingStatus === 1 ? 1 : 0.5}}
      activeOpacity={0.8}
      disabled={item?.streamingStatus === 2}
      className="flex flex-row  items-center my-2"
      onPress={() => onClick(item)}>
      <Image
        source={{
          uri: item.thumbnail,
        }}
        key={item.encodeId}
        className="rounded-md"
        style={{width: wp(14), height: wp(14)}}
      />

      <View className="flex justify-center ml-2 flex-1 ">
        <Text
          className="font-semibold"
          numberOfLines={1}
          style={{
            color: COLOR.TEXT_PRIMARY,
            fontSize: wp(4),
          }}>
          {item?.title}
        </Text>

        <Text
          numberOfLines={1}
          style={{color: COLOR.TEXT_SECONDARY, fontSize: wp(3.5)}}>
          {item?.artistsNames}
        </Text>
      </View>
    </TouchableOpacity>
  );
});
export default Queue;
