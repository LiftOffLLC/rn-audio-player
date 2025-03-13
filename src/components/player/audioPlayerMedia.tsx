import { View } from 'react-native';
import type { IAudioPlayerMedia } from '../../types';

const AudioPlayerMedia = ({
  containerStyles,
  thumbnailContainerStyles,
  customMediaContent,
}: IAudioPlayerMedia) => {
  return (
    <View style={containerStyles}>
      <View style={thumbnailContainerStyles}>
        {customMediaContent && customMediaContent}
      </View>
    </View>
  );
};

export default AudioPlayerMedia;
