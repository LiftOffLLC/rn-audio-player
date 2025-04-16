import { useCallback, useEffect, useMemo, useRef } from 'react';
import { NativeEventEmitter, NativeModules } from 'react-native';
import { PlayerState, type IHookProps } from '../types';
import { usePlayerContext } from '../provider';

const { AudioModule } = NativeModules;

const usePlayerIOS = ({
  onPlay,
  onPause,
  onStop,
  onSeek,
  onReady,
  onProgress,
}: IHookProps = {}) => {
  const audioEventEmitter = useRef<NativeEventEmitter | null>(null);
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

    // Initialize the NativeEventEmitter if not already done
    if (!audioEventEmitter.current) {
      audioEventEmitter.current = new NativeEventEmitter(AudioModule);
    }

    // Avoid double-listener setup
    if (listenersSetupRef.current) return;
    listenersSetupRef.current = true;

    const emitter = audioEventEmitter.current;

    const progressEventHandler = emitter.addListener(
      'onAudioProgress',
      (event: any) => {
        const { currentTime, progress, totalDuration } = event;
        const progressPercentage = progress * 100;

        setPlayerState((prevState) => {
          // Prevent redundant re-renders
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

    const stateEventHandler = emitter.addListener(
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

    // Cleanup
    return () => {
      listenersSetupRef.current = false;
      progressEventHandler.remove();
      stateEventHandler.remove();
    };
  }, [getStateEnum, onProgress, setPlayerState]);

  const toggleRepeat = useCallback(() => {
    setPlayerState((prevState) => ({
      ...prevState,
      repeat: !prevState.repeat,
    }));
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
      const { url } = currentTrack ?? {};
      if (!url) {
        throw new Error('No track URL found');
      }

      await AudioModule.loadContent(url);
      await getDuration();
      onReady?.();
      console.log('Audio loaded successfully');
    } catch (error: any) {
      console.error('Error loading audio', error);
      throw new Error('Error loading audio');
    }
  }, [currentTrack, getDuration, onReady]);

  const setTrackInfo = useCallback(async () => {
    try {
      if (!currentTrack) {
        throw new Error('No track info found');
      }
      await AudioModule.setMediaPlayerInfo(
        currentTrack?.title,
        currentTrack?.artist,
        currentTrack?.album,
        currentTrack?.artwork
      );
    } catch (error: any) {
      console.error('Error setting track info', error);
      throw new Error('Error setting track info');
    }
  }, [currentTrack]);

  const playSound = useCallback(async () => {
    try {
      setPlayerState((prevState) => ({ ...prevState, isPlaying: true }));
      await AudioModule?.playAudio();
      onPlay?.();
      await setTrackInfo();
    } catch (error: any) {
      console.error('Error playing sound', error);
      setPlayerState((prevState) => ({ ...prevState, isPlaying: false }));
      throw new Error('Error playing sound');
    }
  }, [setPlayerState, onPlay, setTrackInfo]);

  const pauseSound = useCallback(() => {
    AudioModule.pauseAudio();
    setPlayerState((prevState) => ({ ...prevState, isPlaying: false }));
    onPause?.();
  }, [setPlayerState, onPause]);

  const resetPlayer = useCallback(() => {
    AudioModule.stopAudio();
    resetPlayerState();
    onStop?.();
  }, [resetPlayerState, onStop]);

  const seek = useCallback(
    async (seekTo: number) => {
      try {
        await AudioModule.seek(seekTo);
        onSeek?.(seekTo);
      } catch (error: any) {
        console.error('Error seeking', error);
        throw new Error('Error seeking');
      }
    },
    [onSeek]
  );

  return useMemo(
    () => ({
      play: playSound,
      pause: pauseSound,
      stop: resetPlayer,
      seek,
      loadContent,
      toggleRepeat,
    }),
    [playSound, pauseSound, resetPlayer, seek, loadContent, toggleRepeat]
  );
};

export default usePlayerIOS;
