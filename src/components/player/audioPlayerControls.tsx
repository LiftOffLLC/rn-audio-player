import { View, StyleSheet } from 'react-native';
import IconButton, { type IconButtonPropsV2 } from '../iconButton';

// TODO - remove inline types and move it for better readability
const SkipForwardButton = ({
  skipForwardComponent,
  onSkipForward,
  iconButtonProps,
}: {
  skipForwardComponent: React.ReactNode;
  onSkipForward?: () => void;
  iconButtonProps?: IconButtonPropsV2;
}) => {
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
}: {
  skipBackwardComponent: React.ReactNode;
  onPrevious?: () => void;
  iconButtonProps?: IconButtonPropsV2;
}) => {
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
}: {
  nextComponent: React.ReactNode;
  onNext?: () => void;
  iconButtonProps?: IconButtonPropsV2;
}) => {
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
}: {
  previousComponent: React.ReactNode;
  onPrevious?: () => void;
  iconButtonProps?: IconButtonPropsV2;
}) => {
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
}: {
  playPauseComponent: React.ReactNode;
  isPlaying: boolean;
  isLoading: boolean;
  onPlay: () => void;
  onPause: () => void;
  iconButtonProps?: IconButtonPropsV2;
}) => {
  // TODO - Remove the inline condition and move it to a variable
  return (
    <View>
      {playPauseComponent ? (
        playPauseComponent
      ) : (
        <IconButton
          {...iconButtonProps}
          name={isPlaying && !isLoading ? 'pause' : 'play'}
          onPress={isPlaying && !isLoading ? onPause : onPlay}
        />
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
}: {
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  isLoading: boolean;
  onSeekForward?: () => void;
  onSeekBackward?: () => void;
  skipForwardComponent?: React.ReactNode;
  skipBackwardComponent?: React.ReactNode;
  nextComponent?: React.ReactNode;
  previousComponent?: React.ReactNode;
  playPauseComponent?: React.ReactNode;
  iconButtonProps?: IconButtonPropsV2;
}) => {
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
