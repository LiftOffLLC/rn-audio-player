/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import usePlayer from '../../hooks/usePlayer';
import { mockAudioContent, mockTrackInfo } from '../../data/mockData';
// import AudioPlayerMedia from './audioPlayerMedia';
import AudioPlayerContent from './audioPlayerContent';
import AudioPlayerDuration from './playerDuration';
import PlayerControls from './audioPlayerControls';
import type { IPlayerProps } from '../../types';

function Player(props: IPlayerProps): React.JSX.Element {
  const {
    loadContent,
    playerState: { isPlaying, isLoading, elapsedTime, totalDuration, progress },
    playerControls: { play, pause, seekForward, seekBackward },
  } = usePlayer({
    autoPlay: props.autoPlay ?? false,
    trackInfo: props.trackInfo ?? mockTrackInfo,
    sourceUrl: props.sourceUrl ?? '',
  });

  console.log(
    'player state ->',
    isPlaying,
    isLoading,
    elapsedTime,
    totalDuration,
    progress
  );

  useEffect(() => {
    (async () => {
      await loadContent();
    })();
  }, [loadContent]);

  const onPlay = () => {
    play();
  };

  const onPause = () => {
    pause();
  };

  const MockContent = (
    <View style={styles.mockContent}>
      <Text style={styles.mockContentTitle}>{mockAudioContent.title}</Text>
      <Text style={styles.mockContentArtist}>{mockAudioContent.artist}</Text>
    </View>
  );

  return (
    <SafeAreaView>
      <ScrollView>
        {/* <AudioPlayerMedia
          thumbnail={require('./assets/images/sample-image.jpg')}
        /> */}
        <AudioPlayerContent content={MockContent} />
        <AudioPlayerDuration
          totalDuration={totalDuration}
          currentDuration={elapsedTime}
          progress={progress}
        />
        <PlayerControls
          isPlaying={isPlaying}
          onPlay={onPlay}
          onPause={onPause}
          isLoading={isLoading}
          onSeekForward={seekForward}
          onSeekBackward={seekBackward}
        />
      </ScrollView>
    </SafeAreaView>
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
    fontSize: 24,
    marginVertical: 5,
    fontWeight: 'bold',
  },
  mockContentArtist: {
    fontSize: 18,
    marginVertical: 5,
  },
});

export default Player;
