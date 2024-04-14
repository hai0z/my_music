import {Text} from 'react-native';
import React, {useEffect, useState} from 'react';
import {usePlayerStore} from '../../store/playerStore';
import dayjs from 'dayjs';
import nodejs from 'nodejs-mobile-react-native';
import tinycolor from 'tinycolor2';
import useThemeStore from '../../store/themeStore';
import Animated from 'react-native-reanimated';
const SongInfoCard = () => {
  const {color: bgColor} = usePlayerStore(state => state);

  const currentSong = usePlayerStore(state => state.currentSong);

  const {COLOR} = useThemeStore(state => state);

  const bg = COLOR.isDark
    ? bgColor.vibrant === '#0098DB'
      ? tinycolor(bgColor.average).isDark()
        ? tinycolor(bgColor.average).lighten(20).toString()
        : bgColor.average
      : bgColor.vibrant
    : tinycolor(bgColor.dominant!).isDark()
    ? tinycolor(bgColor.dominant!).lighten(30).toString()
    : tinycolor(bgColor.dominant!).darken().toString();

  const [data, setData] = useState<any>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    nodejs.channel.addListener('getSongInfo', (data: any) => {
      setData(data);
      setLoading(false);
    });
    nodejs.channel.post('getSongInfo', currentSong?.id);
  }, [currentSong?.id]);

  if (
    loading ||
    currentSong === undefined ||
    usePlayerStore.getState().isPlayFromLocal
  ) {
    return null;
  }
  return (
    <Animated.View
      style={{backgroundColor: bg, elevation: 10}}
      className="w-full mt-8 rounded-2xl px-4 py-2 flex justify-between">
      <Text
        className="font-bold text-[18px]"
        style={{color: COLOR.TEXT_PRIMARY}}>
        {data.releaseDate ? (
          <Text>
            Phát hành lúc {dayjs.unix(data?.releaseDate).format('DD/MM/YYYY')}
          </Text>
        ) : (
          'Phát hành lúc: không rõ'
        )}
      </Text>
      <Text style={{color: COLOR.TEXT_PRIMARY}}>
        Tác giả :{' '}
        {data?.composers?.map((e: any) => e?.name).join(', ') || 'không rõ'}
      </Text>
      <Text style={{color: COLOR.TEXT_PRIMARY}}>
        Thể loại: {data?.genres?.map((e: any) => e?.name).join(', ')}
      </Text>
      <Text style={{color: COLOR.TEXT_PRIMARY}}>
        Nghệ sĩ: {data?.artists?.map((e: any) => e?.name).join(', ')}
      </Text>
      <Text style={{color: COLOR.TEXT_PRIMARY}}>{data?.like} lượt thích</Text>
    </Animated.View>
  );
};

export default SongInfoCard;
