import React from 'react';
import { StyleSheet, View } from 'react-native';

export interface AudioPlayerContentProps {
  containerStyle?: any;
  containerProps?: any;
  content?: React.ReactNode;
}

const AudioPlayerContent = ({
  containerStyle,
  containerProps,
  content,
}: AudioPlayerContentProps) => {
  return (
    <View
      style={{ ...styles.container, ...containerStyle }}
      {...containerProps}
    >
      {content}
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
});

export default AudioPlayerContent;
