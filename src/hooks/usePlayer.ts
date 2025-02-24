import { Platform } from 'react-native';
import type { IHookProps } from '../types';

const usePlayer = (props?: IHookProps) => {
  // TODO
  if (Platform.OS === 'ios') {
    return require('./usePlayerIOS').default(props);
  } else {
    return require('./usePlayerAndroid').default(props);
  }
};

export default usePlayer;
