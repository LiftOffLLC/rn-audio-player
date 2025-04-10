import { useCallback, useEffect, useRef } from 'react';
import { DeviceEventEmitter, NativeModules } from 'react-native';
import { PlayerState, type IHookProps } from '../types';
import { usePlayerContext } from '../provider';

const { AudioModule } = NativeModules;

const usePlayerAndroid = ({
  onPlay,
  onPause,
  onStop,
  onSeek,
  onReady,
  onProgress,
}: IHookProps = {}) => {
  const listenersSetupRef = useRef(false);
  const { setPlayerState, currentTrack, resetPlayerState } = usePlayerContext();

  // Memoize getStateEnum
  const getStateEnum = useCallback((state: string) => {
    switch (state) {
      case 'IDLE':
        return PlayerState.IDEAL;
      case 'LOADED':
        return PlayerState.LOADED;
      case 'PLAYING':
        return PlayerState.PLAYING;
      case 'PAUSED':
        return PlayerState.PAUSED;
      case 'STOPPED':
        return PlayerState.STOPPED;
      case 'COMPLETED':
        return PlayerState.COMPLETED;
      default:
        return PlayerState.IDEAL;
    }
  }, []);

  useEffect(() => {
    if (!AudioModule) return;

    // Avoid double-listener setup
    if (listenersSetupRef.current) return;
    listenersSetupRef.current = true;

    const progressSubscription = DeviceEventEmitter.addListener(
      'onAudioProgress',
      (event: any) => {
        const { currentTime, progress, totalDuration } = event;
        const progressPercentage = progress * 100;

        setPlayerState((prevState) => {
          if (
            prevState.elapsedTime === currentTime &&
            prevState.progress === progressPercentage &&
            prevState.totalDuration === totalDuration
          ) {
            return prevState;
          }

          return {
            ...prevState,
            elapsedTime: currentTime,
            progress: progressPercentage,
            totalDuration,
          };
        });

        onProgress?.(progressPercentage);
      }
    );

    const stateSubscription = DeviceEventEmitter.addListener(
      'onAudioStateChange',
      (event: any) => {
        const { state } = event;
        const newState = getStateEnum(state);

        setPlayerState((prevState) => {
          if (prevState.state === newState) return prevState;

          if (newState === PlayerState.LOADED) {
            return {
              ...prevState,
              state: newState,
              isPlaying: false,
              progress: 0,
              elapsedTime: 0,
              totalDuration: 0,
            };
          }

          return {
            ...prevState,
            state: newState,
            isPlaying: newState === PlayerState.PLAYING,
          };
        });
      }
    );

    return () => {
      listenersSetupRef.current = false;
      progressSubscription.remove();
      stateSubscription.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setPlayerState]);

  const getDuration = useCallback(async () => {
    try {
      const duration: number = await AudioModule.getTotalDuration();
      setPlayerState((prevState) => ({
        ...prevState,
        totalDuration: duration,
      }));
    } catch (error: any) {
      console.error('Error getting duration', error);
      throw new Error('Error getting duration');
    }
  }, [setPlayerState]);

  const loadContent = useCallback(async () => {
    try {
      if (!currentTrack?.url) {
        throw new Error('No track URL found');
      }

      await AudioModule.loadContent(currentTrack.url);
      await getDuration();
      onReady?.();
    } catch (error: any) {
      console.error('Error loading audio:', error);
      throw new Error('Error loading audio');
    }
  }, [currentTrack, getDuration, onReady]);

  const setTrackInfo = useCallback(async () => {
    try {
      if (!currentTrack) {
        throw new Error('No track info found');
      }
      await AudioModule.setMediaPlayerInfo(
        currentTrack.title,
        currentTrack.artist,
        currentTrack.album,
        currentTrack.artwork
      );
    } catch (error: any) {
      console.error('Error setting track info:', error);
      throw new Error('Error setting track info');
    }
  }, [currentTrack]);

  const playSound = useCallback(async () => {
    try {
      await AudioModule?.playAudio();
      setPlayerState((prevState) => ({ ...prevState, isPlaying: true }));
      await setTrackInfo();
      onPlay?.();
    } catch (error: any) {
      console.error('Error playing sound:', error);
      setPlayerState((prevState) => ({ ...prevState, isPlaying: false }));
      throw new Error('Error playing sound');
    }
  }, [setPlayerState, onPlay, setTrackInfo]);

  const pauseSound = useCallback(() => {
    try {
      AudioModule.pauseAudio();
      setPlayerState((prevState) => ({ ...prevState, isPlaying: false }));
      onPause?.();
    } catch (error: any) {
      console.error('Error pausing sound:', error);
    }
  }, [setPlayerState, onPause]);

  const resetPlayer = useCallback(() => {
    try {
      AudioModule.stopAudio();
      resetPlayerState();
      onStop?.();
    } catch (error: any) {
      console.error('Error stopping sound:', error);
    }
  }, [resetPlayerState, onStop]);

  return {
    play: playSound,
    pause: pauseSound,
    stop: resetPlayer,
    seek: useCallback(
      async (seekTo: number) => {
        try {
          await AudioModule.seek(seekTo);
          onSeek?.(seekTo);
        } catch (error: any) {
          console.error('Error seeking:', error);
          throw new Error('Error seeking');
        }
      },
      [onSeek]
    ),
    loadContent,
    toggleRepeat: useCallback(() => {
      setPlayerState((prevState) => ({
        ...prevState,
        repeat: !prevState.repeat,
      }));
    }, [setPlayerState]),
  };
};

export default usePlayerAndroid;
