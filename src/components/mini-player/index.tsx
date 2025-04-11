import { View, StyleSheet } from 'react-native';
import MiniPlayerIcon from './playerIcon';
import MiniPlayerContent from './playerContent';
import MiniPlayerActions from './playerActions';
import { PlayerState, type IMiniPlayerProps } from '../../types';
import { usePlayerContext } from '../../provider';
import usePlayer from '../../hooks/usePlayer';
import { useCallback, useEffect, useState } from 'react';

const MiniPlayer = (props: IMiniPlayerProps) => {
  const {
    playerState: { state },
    setCurrentTrack,
    currentTrack,
  } = usePlayerContext();
  const [isPlaying, setIsPlaying] = useState(false);

  const player = usePlayer()!;
  const { play, pause, loadContent } = player;

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
    if (state === PlayerState.PLAYING) {
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  }, [state]);

  const onPlay = () => {
    play?.();
  };

  const onPause = () => {
    pause?.();
  };

  return (
    <View style={{ ...styles.container, ...props.containerStyles }}>
      <MiniPlayerIcon
        iconNode={props.mediaPlayerIcon}
        iconStyle={props.iconStyle}
      />
      <MiniPlayerContent {...props.contentStyle} />
      <MiniPlayerActions
        onPlay={onPlay}
        onPause={onPause}
        onNext={props.onNext}
        onPrevious={props.onPrevious}
        isPlaying={isPlaying}
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    backgroundColor: 'lightgrey',
  },
});

export default MiniPlayer;
