/* eslint-disable react-native/no-inline-styles */
import { StyleSheet, Text, View } from 'react-native';
import {
  AudioPlayer,
  MiniPlayer,
  PlayerProvider,
  usePlayerContext,
} from '@liftoffllc/rn-audio-player';
import { mockAudioContent } from '../data/mockData.native';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { PlayerState } from '../../src/types';

const sourceURL =
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

const trackInfo = {
  title: 'Sevish',
  artist: 'Sevish',
  album: 'Sevish',
  artwork:
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQAu2qz2_GGhotIzQJvsAY-GHK6NRmZzDDWCw&s',
  url: sourceURL,
};

const CustomPlayIcon = (props: any) => {
  return <Icon name="circle-play" size={30} color="green" {...props} />;
};

const CustomPauseIcon = (props: any) => {
  return <Icon name="pause-circle" size={30} color="red" {...props} />;
};

const CustomNextIcon = (props: any) => {
  return <Icon name="circle-arrow-right" size={30} color="red" {...props} />;
};

const CustomPreviousIcon = (props: any) => {
  return <Icon name="circle-arrow-left" size={30} color="red" {...props} />;
};

const PlayerIcon = () => {
  return <Icon name="music" size={30} color="pink" />;
};

const CustomPlayer = (
  state: PlayerState,
  onPlay: () => void,
  onPause: () => void
) => {
  return (
    <>
      {state === PlayerState.PLAYING ? (
        <Icon name="pause-circle" onPress={onPause} size={30} color="red" />
      ) : (
        <Icon name="circle-play" onPress={onPlay} size={30} color="green" />
      )}
    </>
  );
};

export default function App() {
  return (
    <PlayerProvider>
      <PlayerContent />
    </PlayerProvider>
  );
}

function PlayerContent() {
  const { playerControls, playerState } = usePlayerContext();

  const MockContent1 = (
    <View style={styles.mockContent}>
      <Text style={styles.mockContentTitle}>{mockAudioContent.title}</Text>
      <Text style={styles.mockContentArtist}>{mockAudioContent.artist}</Text>
    </View>
  );

  const MockContent2 = (
    <View style={styles.mockContent}>
      <Text style={styles.mockContentTitle1}>{mockAudioContent.title}</Text>
      <Text style={styles.mockContentArtist}>{mockAudioContent.artist}</Text>
    </View>
  );

  return (
    <>
      <View>
        <AudioPlayer
          trackInfo={trackInfo}
          autoPlay={true}
          contentStyle={{ content: MockContent1 }}
        />
        <MiniPlayer
          trackInfo={trackInfo}
          contentStyle={{ content: MockContent1 }}
          iconStyle={{
            iconSize: 30,
            iconColor: 'yellow',
          }}
        />
        <MiniPlayer
          trackInfo={trackInfo}
          contentStyle={{ content: MockContent2 }}
          mediaPlayerIcon={<PlayerIcon />}
          playIcon={CustomPlayIcon}
          pauseIcon={CustomPauseIcon}
          nextIcon={CustomNextIcon}
          previousIcon={CustomPreviousIcon}
          containerStyles={{ backgroundColor: 'whitesmoke', margin: 10 }}
        />
      </View>
      <View>
        {CustomPlayer(
          playerState.state,
          playerControls?.play!,
          playerControls?.pause!
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  mockContent: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
  },
  mockContentTitle: {
    fontSize: 20,
    marginVertical: 5,
    fontWeight: 'bold',
  },
  mockContentTitle1: {
    fontSize: 20,
    marginVertical: 5,
    fontWeight: 'bold',
    color: 'red',
  },
  mockContentArtist: {
    fontSize: 18,
    marginVertical: 5,
  },
});
