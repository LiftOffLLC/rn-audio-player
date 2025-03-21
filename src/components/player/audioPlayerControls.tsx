import { View, StyleSheet } from 'react-native';
import IconButton from '../iconButton';
import type {
  NextButtonProps,
  PlayerControlsProps,
  PlayPauseButtonProps,
  PreviousButtonProps,
  SkipBackwardButtonProps,
  SkipForwardButtonProps,
} from '../../types/audio-player-controls';

const SkipForwardButton = ({
  skipForwardComponent,
  onSkipForward,
  iconButtonProps,
}: SkipForwardButtonProps) => {
  return (
    <View>
      {skipForwardComponent ? (
        skipForwardComponent
      ) : (
        <IconButton
          {...iconButtonProps}
          name={iconButtonProps?.name ?? 'play-skip-forward-outline'}
          onPress={onSkipForward}
        />
      )}
    </View>
  );
};

const SkipBackwardButton = ({
  skipBackwardComponent,
  onPrevious,
  iconButtonProps,
}: SkipBackwardButtonProps) => {
  return (
    <View>
      {skipBackwardComponent ? (
        skipBackwardComponent
      ) : (
        <IconButton
          {...iconButtonProps}
          name={iconButtonProps?.name ?? 'play-skip-back-outline'}
          onPress={onPrevious}
        />
      )}
    </View>
  );
};

const NextButton = ({
  nextComponent,
  onNext,
  iconButtonProps,
}: NextButtonProps) => {
  return (
    <View>
      {nextComponent ? (
        nextComponent
      ) : (
        <IconButton
          {...iconButtonProps}
          name={iconButtonProps?.name ?? 'play-forward-outline'}
          onPress={onNext}
        />
      )}
    </View>
  );
};

const PreviousButton = ({
  previousComponent,
  onPrevious,
  iconButtonProps,
}: PreviousButtonProps) => {
  return (
    <View>
      {previousComponent ? (
        previousComponent
      ) : (
        <IconButton
          {...iconButtonProps}
          name={iconButtonProps?.name ?? 'play-back-outline'}
          onPress={onPrevious}
        />
      )}
    </View>
  );
};

const PlayPauseButton = ({
  playPauseComponent,
  isPlaying,
  isLoading,
  onPlay,
  onPause,
  iconButtonProps,
}: PlayPauseButtonProps) => {
  const isPlayingAndNotLoading = isPlaying && !isLoading;
  const iconName = isPlayingAndNotLoading ? 'pause' : 'play';
  const iconAction = isPlayingAndNotLoading ? onPause : onPlay;

  return (
    <View>
      {playPauseComponent ? (
        playPauseComponent
      ) : (
        <IconButton {...iconButtonProps} name={iconName} onPress={iconAction} />
      )}
    </View>
  );
};

const PlayerControls = ({
  isPlaying,
  onPlay,
  onPause,
  isLoading,
  onSeekForward,
  onSeekBackward,
  skipForwardComponent,
  skipBackwardComponent,
  nextComponent,
  previousComponent,
  playPauseComponent,
  iconButtonProps,
}: PlayerControlsProps) => {
  return (
    <View style={styles.container}>
      <SkipBackwardButton
        skipBackwardComponent={skipBackwardComponent}
        onPrevious={onSeekBackward}
        iconButtonProps={iconButtonProps}
      />
      <PreviousButton
        previousComponent={previousComponent}
        onPrevious={onSeekBackward}
        iconButtonProps={iconButtonProps}
      />
      <PlayPauseButton
        playPauseComponent={playPauseComponent}
        isPlaying={isPlaying}
        onPlay={onPlay}
        onPause={onPause}
        isLoading={isLoading}
        iconButtonProps={iconButtonProps}
      />
      <NextButton
        nextComponent={nextComponent}
        onNext={onSeekForward}
        iconButtonProps={iconButtonProps}
      />
      <SkipForwardButton
        skipForwardComponent={skipForwardComponent}
        onSkipForward={onSeekForward}
        iconButtonProps={iconButtonProps}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

export default PlayerControls;
