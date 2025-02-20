import { StyleSheet, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import type { IconButtonProps } from 'react-native-vector-icons/Icon';

export interface IconButtonPropsV2 extends IconButtonProps {
  key?: string;
  containerStyles?: any;
}

const IconButton = ({ key, containerStyles, ...props }: IconButtonPropsV2) => {
  return (
    <View key={key} style={{ ...styles.container, ...containerStyles }}>
      <Icon.Button
        size={props.size ?? 25}
        color={props?.color ?? '#000'}
        backgroundColor={props?.backgroundColor ?? 'transparent'}
        underlayColor={props?.underlayColor ?? 'transparent'}
        style={{ ...styles.iconButton, ...props.style }}
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
  },
  iconButton: {
    marginHorizontal: 10,
  },
});

export default IconButton;
