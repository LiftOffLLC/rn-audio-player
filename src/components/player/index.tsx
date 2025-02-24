/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useCallback, useEffect, useState } from 'react';
import { SafeAreaView, ScrollView } from 'react-native';
import AudioPlayerContent from './audioPlayerContent';
import AudioPlayerDuration from './playerDuration';
import PlayerControls from './audioPlayerControls';
import { PlayerState, type IPlayerProps } from '../../types';
import { usePlayerContext } from '../../provider';
import usePlayer from '../../hooks/usePlayer';

function Player(props: IPlayerProps): React.JSX.Element {
  const {
    playerState: { elapsedTime, totalDuration, progress, state },
    playerControls,
    setCurrentTrack,
    currentTrack,
  } = usePlayerContext();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const { seekInterval = 3 } = props;

  usePlayer();
  const { play, pause, loadContent } = playerControls ?? {};

  useEffect(() => {
    if (play && pause && loadContent) {
      setIsLoaded(true);
    }
  }, [play, pause, loadContent]);

  useEffect(() => {
    if (props.trackInfo) {
      setCurrentTrack?.(props.trackInfo);
    }
  }, [props.trackInfo, loadContent, setCurrentTrack]);

  const handleAutoPlay = useCallback(() => {
    if (state === PlayerState.LOADED) {
      play?.();
    }
  }, [play, state]);

  const handleInit = useCallback(() => {
    loadContent?.();
  }, [loadContent]);

  useEffect(() => {
    if (currentTrack) {
      handleInit();
    }
  }, [currentTrack, handleInit, loadContent]);

  useEffect(() => {
    if (props.autoPlay) {
      handleAutoPlay();
    }
  }, [props.autoPlay, handleAutoPlay]);

  useEffect(() => {
    // TODO - Assign "state === PlayerState.PLAYING" to a variable and then use it in setting the state
    if (state === PlayerState.PLAYING) {
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  }, [state]);

  useEffect(() => {
    // TODO - Assign "state === PlayerState.LOADED" to a variable and then use it in setting the state
    if (state === PlayerState.LOADED) {
      setIsLoaded(true);
    } else {
      setIsLoaded(false);
    }
  }, [state]);

  const onPlay = () => {
    play?.();
  };

  const onPause = () => {
    pause?.();
  };

  const seekForward = () => {
    // TODO - Assign "(elapsedTime ?? 0) + seekInterval" to a variable and then use it
    // Seek forward 10 seconds
    const seekTo = Math.min((elapsedTime ?? 0) + seekInterval, totalDuration);
    playerControls?.seek?.(seekTo);
  };

  const seekBackward = () => {
    // TODO - Assign "(elapsedTime ?? 0) - seekInterval" to a variable and then use it
    // Seek backward 10 seconds
    const seekTo = Math.max((elapsedTime ?? 0) - seekInterval, 0);
    playerControls?.seek?.(seekTo);
  };

  return (
    <SafeAreaView>
      <ScrollView>
        <AudioPlayerContent {...props.contentStyle} />
        <AudioPlayerDuration
          totalDuration={totalDuration}
          currentDuration={elapsedTime ?? 0}
          progress={progress ?? 0}
        />
        <PlayerControls
          isPlaying={isPlaying}
          onPlay={onPlay}
          onPause={onPause}
          isLoading={isLoaded}
          onSeekForward={seekForward}
          onSeekBackward={seekBackward}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

export default Player;
