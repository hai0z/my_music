import {View, Text} from 'react-native';
import React from 'react';
import useThemeStore from '../../store/themeStore';
import {useProgress} from 'react-native-track-player/lib/hooks';

const ProgressBar = () => {
  const {COLOR} = useThemeStore();

  const progress = useProgress(1000 / 120); //120fps
  return (
    <View className="absolute top-0 w-full">
      <View
        style={{
          height: 2.5,
          maxWidth: '100%',
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
  );
};

export default ProgressBar;
