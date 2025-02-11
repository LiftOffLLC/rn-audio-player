import { Image, StyleSheet, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

export interface AudioPlayerMediaProps {
  thumbnail?: string;
  containerStyle?: any;
  containerProps?: any;
  thumbnailStyle?: any;
  thumbnailProps?: any;
  size?: number;
}

const AudioPlayerMedia = ({
  containerStyle,
  containerProps,
  thumbnailProps,
  thumbnailStyle,
  size,
  thumbnail,
}: AudioPlayerMediaProps) => {
  const _size = size || 300;

  const getThumbnail = () => {
    if (!thumbnail) {
      return;
    }

    return (
      <Image
        style={{
          width: _size,
          height: _size,
          borderRadius: 5 as any,
          ...thumbnailStyle,
        }}
        source={thumbnail}
        {...thumbnailProps}
      />
    );
  };

  const getIconThumbnail = () => {
    if (thumbnail) {
      return;
    }

    return (
      <View
        style={{
          ...styles.container,
          ...styles.background,
        }}
      >
        <Icon name="musical-notes-outline" color={'#fff'} size={_size / 2} />
      </View>
    );
  };

  return (
    <View
      {...containerProps}
      style={{
        width: _size,
        height: _size,
        borderRadius: _size / 2,
        ...containerStyle,
        ...styles.container,
      }}
    >
      {getThumbnail()}
      {getIconThumbnail()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 'auto',
    marginVertical: 10,
  },
  background: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 5,
    width: 300,
    height: 300,
  },
});

export default AudioPlayerMedia;
