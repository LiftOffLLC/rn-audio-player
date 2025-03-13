/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { SafeAreaView, ScrollView } from 'react-native';
import AudioPlayerContent from './audioPlayerContent';
import AudioPlayerDuration from './playerDuration';
import PlayerControls from './audioPlayerControls';
import { PlayerState, type IPlayerProps } from '../../types';
import { usePlayerContext } from '../../provider';
import usePlayer from '../../hooks/usePlayer';
import AudioPlayerMedia from './audioPlayerMedia';

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
  const loaded = useMemo(() => state === PlayerState.LOADED, [state]);
  const seekForwardTime = useMemo(
    () => (elapsedTime ?? 0) + seekInterval,
    [elapsedTime, seekInterval]
  );
  const seekBackwardTime = useMemo(
    () => (elapsedTime ?? 0) - seekInterval,
    [elapsedTime, seekInterval]
  );

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
    if (loaded) {
      play?.();
    }
  }, [loaded, play]);

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
    if (props.repeat && state === PlayerState.COMPLETED) {
      handleAutoPlay();
    }
  }, [props.repeat, playerControls, handleAutoPlay, state]);

  useEffect(() => {
    if (state === PlayerState.PLAYING) {
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  }, [state]);

  useEffect(() => {
    // TODO - Assign "loaded" to a variable and then use it in setting the state - Done
    if (loaded) {
      setIsLoaded(true);
    } else {
      setIsLoaded(false);
    }
  }, [loaded]);

  const onPlay = () => {
    play?.();
  };

  const onPause = () => {
    pause?.();
  };

  const seekForward = () => {
    // TODO - Assign "(elapsedTime ?? 0) + seekInterval" to a variable and then use it - Done
    // Seek forward 10 seconds
    const seekTo = Math.min(seekForwardTime, totalDuration);
    playerControls?.seek?.(seekTo);
  };

  const seekBackward = () => {
    // TODO - Assign "(elapsedTime ?? 0) - seekInterval" to a variable and then use it - Done
    // Seek backward 10 seconds
    const seekTo = Math.max(seekBackwardTime, 0);
    playerControls?.seek?.(seekTo);
  };

  return (
    <SafeAreaView>
      <ScrollView>
        <AudioPlayerMedia {...props.mediaStyle} />
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
