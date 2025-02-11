import { View, StyleSheet } from 'react-native';
import { AudioPlayer } from '@shreyanshsingh/react-native-audio-player';

const sourceURL =
  'https://commondatastorage.googleapis.com/codeskulptor-demos/DDR_assets/Sevish_-__nbsp_.mp3';

export default function App() {
  return (
    <View style={styles.container}>
      <AudioPlayer sourceUrl={sourceURL} autoPlay={true} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
