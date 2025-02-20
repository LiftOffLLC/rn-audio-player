import { View, StyleSheet, type ViewStyle } from 'react-native';
import IconButton from '../iconButton';
import type { IAudioPlayerIcon } from '../../types';

interface MiniPlayerActionsProps {
  isPlaying: boolean;
  onPlay?: () => void;
  onPause?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  playIcon?: (args: any) => React.ReactNode;
  pauseIcon?: (args: any) => React.ReactNode;
  nextIcon?: (args: any) => React.ReactNode;
  previousIcon?: (args: any) => React.ReactNode;
  iconStyle?: IAudioPlayerIcon;
  actionContainerStyle?: ViewStyle;
}

const MiniPlayerActions = (props: MiniPlayerActionsProps) => {
  return (
    <View style={{ ...styles.container, ...props.actionContainerStyle }}>
      {props.previousIcon ? (
        props.previousIcon({ onPress: props.onPrevious })
      ) : (
        <View style={props.iconStyle?.container}>
          <IconButton
            name={'play-skip-back-outline'}
            backgroundColor={props?.iconStyle?.backgroundColor ?? 'lightgrey'}
            underlayColor={props?.iconStyle?.underlayColor ?? 'lightgrey'}
            onPress={props.onPrevious}
            color={props?.iconStyle?.iconColor ?? 'black'}
          />
        </View>
      )}
      {props.isPlaying ? (
        props.pauseIcon ? (
          props.pauseIcon({ onPress: props.onPause })
        ) : (
          <View style={props.iconStyle?.container}>
            <IconButton
              name={'pause-outline'}
              backgroundColor={props?.iconStyle?.backgroundColor ?? 'lightgrey'}
              underlayColor={props?.iconStyle?.underlayColor ?? 'lightgrey'}
              onPress={props.onPause}
              color={props?.iconStyle?.iconColor ?? 'black'}
            />
          </View>
        )
      ) : props.playIcon ? (
        props.playIcon({ onPress: props.onPlay })
      ) : (
        <View style={props.iconStyle?.container}>
          <IconButton
            name={'play-outline'}
            backgroundColor={props?.iconStyle?.backgroundColor ?? 'lightgrey'}
            underlayColor={props?.iconStyle?.underlayColor ?? 'lightgrey'}
            onPress={props.onPlay}
            color={props?.iconStyle?.iconColor ?? 'black'}
          />
        </View>
      )}
      {props.nextIcon ? (
        props.nextIcon({ onPress: props.onNext })
      ) : (
        <View style={props.iconStyle?.container}>
          <IconButton
            name={'play-skip-forward-outline'}
            backgroundColor={props?.iconStyle?.backgroundColor ?? 'lightgrey'}
            underlayColor={props?.iconStyle?.underlayColor ?? 'lightgrey'}
            onPress={props.onNext}
            color={props?.iconStyle?.iconColor ?? 'black'}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  icon: {
    color: '#000',
    backgroundColor: 'lightgrey',
  },
});

export default MiniPlayerActions;
