import { StyleSheet, View } from 'react-native';
import type { AudioPlayerContentProps } from '../player/audioPlayerContent';

const MiniPlayerContent = (props: AudioPlayerContentProps) => {
  return (
    <View
      style={{ ...styles.container, ...props.containerStyle }}
      {...props.containerProps}
    >
      {props.content}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
  },
});

export default MiniPlayerContent;
