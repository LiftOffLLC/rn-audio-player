import { StyleSheet, Text, View } from 'react-native';
import { convertSecondsToTimeFormat } from '../../utils/utils';
import { useMemo } from 'react';

const ProgressBar = ({
  progress,
  color = '#6200ee',
  height = 10,
}: {
  progress: number;
  color?: string;
  height?: number;
}) => {
  // Ensure progress is clamped between 0 and 1
  const clampedProgress = Math.min(Math.max(progress, 0), 1);

  return (
    <View style={[styles.progressBarContainer, { height }]}>
      <View
        style={[
          styles.filledBar,
          { width: `${clampedProgress * 100}%`, backgroundColor: color },
        ]}
      />
    </View>
  );
};

export interface AudioPlayerDurationProps {
  totalDuration: number;
  progressIndicator?: React.ReactNode;
  indicatorColor?: string;
  indicatorHeight?: number;
  currentDuration: number;
  progress: number;
}

const AudioPlayerDuration = ({
  totalDuration = 0,
  currentDuration = 0,
  progress = 0,
}: AudioPlayerDurationProps) => {
  const formattedTotalDuration = useMemo(() => {
    return convertSecondsToTimeFormat(totalDuration);
  }, [totalDuration]);

  const formattedDuration = useMemo(() => {
    return convertSecondsToTimeFormat(currentDuration);
  }, [currentDuration]);

  const progressValue = useMemo(() => {
    return progress / 100;
  }, [progress]);

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.durationText}>{`${formattedDuration}`}</Text>
      </View>
      <ProgressBar progress={progressValue} />
      <View>
        <Text style={styles.durationText}>{`${formattedTotalDuration}`}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    marginHorizontal: 'auto',
    marginVertical: 20,
    overflow: 'hidden',
    flexGrow: 1,
    gap: 10,
  },
  progressBarContainer: {
    minWidth: '60%',
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
  },
  durationText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  filledBar: {
    height: '100%',
    borderRadius: 5,
  },
});

export default AudioPlayerDuration;
