import { Platform } from 'react-native';
import type { IHookProps } from '../types';
import usePlayerIOS from './usePlayerIOS';
import usePlayerAndorid from './usePlayerAndroid';

const usePlayer = (props?: IHookProps) => {
  const playerIOS = usePlayerIOS(props);
  const playerAndroid = usePlayerAndorid(props);

  return Platform.OS === 'ios' ? playerIOS : playerAndroid;
};

export default usePlayer;
