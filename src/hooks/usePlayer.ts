import { Platform } from 'react-native';
import type { IHookProps } from '../types';
import usePlayerIOS from './usePlayerIOS';
import usePlayerAndroid from './usePlayerAndroid';

// Create a factory function that returns the appropriate hook implementation
const createPlayerHook = () => {
  if (Platform.OS === 'ios') {
    return usePlayerIOS;
  } else {
    return usePlayerAndroid;
  }
};

// Get the platform-specific hook implementation
const platformSpecificHook = createPlayerHook();

// Export a hook that uses the platform-specific implementation
const usePlayer = (props?: IHookProps) => {
  return platformSpecificHook(props);
};

export default usePlayer;
