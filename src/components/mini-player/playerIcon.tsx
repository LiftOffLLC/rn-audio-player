import { StyleSheet, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import type { IAudioPlayerIcon } from '../../types';

interface MiniPlayerIconProps {
  iconNode?: React.ReactNode;
  iconStyle?: IAudioPlayerIcon;
}

const MiniPlayerIcon = (props: MiniPlayerIconProps) => {
  return (
    <View style={props.iconStyle?.container}>
      {props.iconNode ? (
        props.iconNode
      ) : (
        <Icon
          name={'musical-notes-sharp'}
          color={props.iconStyle?.iconColor ?? styles?.icon?.color}
          style={props.iconStyle?.icon}
          size={props.iconStyle?.iconSize}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  icon: {
    color: '#000',
  },
});

export default MiniPlayerIcon;
