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

  const player = usePlayer()!;
  const { play, pause, loadContent, seek } = player;

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

  const handleInit = useCallback(async () => {
    await loadContent?.();
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
  }, [props.repeat, handleAutoPlay, state]);

  useEffect(() => {
    setIsPlaying(state === PlayerState.PLAYING);
  }, [state]);

  useEffect(() => {
    setIsLoaded(loaded);
  }, [loaded]);

  const onPlay = () => {
    play?.();
  };

  const onPause = () => {
    pause?.();
  };

  const seekForward = () => {
    // Seek forward 10 seconds
    const seekTo = Math.min(seekForwardTime, totalDuration);
    seek?.(seekTo);
  };

  const seekBackward = () => {
    // Seek backward 10 seconds
    const seekTo = Math.max(seekBackwardTime, 0);
    seek?.(seekTo);
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
