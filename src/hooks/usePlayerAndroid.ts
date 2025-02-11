import { useCallback, useEffect, useMemo, useState } from 'react';
import { DeviceEventEmitter, NativeModules } from 'react-native';
import type { IHookProps, IHookReturn } from '../types';

const { AudioModule } = NativeModules;

const usePlayerAndroid = ({
  onPlay,
  onFinished,
  onPause,
  repeat,
  onStop,
  onSeek,
  onSeekForward,
  onReady,
  onSeekBackward,
  onProgress,
  sourceUrl,
  seekInterval = 3000,
  autoPlay = false,
}: IHookProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [totalDuration, setTotalDuration] = useState(0);
  const [_repeat, setRepeat] = useState(repeat);
  const eventHandler = useMemo(() => DeviceEventEmitter, []);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [elapsedTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const progressEventHandler = eventHandler.addListener(
      'onAudioProgress',
      (event: any) => {
        const { currentTime, progress } = event;
        setCurrentTime(currentTime);
        setCurrentProgress(progress * 100);
        onProgress?.(progress * 100);
      }
    );

    return () => {
      progressEventHandler.remove();
    };
  }, [eventHandler, onProgress]);

  useEffect(() => {
    const stateEventHandler = eventHandler.addListener(
      'onAudioStateChange',
      (event: any) => {
        const { state } = event;
        setIsPlaying(state === 'PLAYING');
      }
    );

    return () => {
      stateEventHandler.remove();
    };
  }, [eventHandler]);

  const toggleRepeat = () => {
    setRepeat(!_repeat);
  };

  const getDuration = useCallback(async () => {
    try {
      const duration: number = await AudioModule.getTotalDuration(sourceUrl);
      setTotalDuration(duration);
    } catch (error) {
      console.error('Error getting duration', error);
    }
  }, [sourceUrl]);

  const loadContent = useCallback(async () => {
    try {
      await AudioModule.loadAudio(sourceUrl);
      onReady?.();
    } catch (error) {
      console.error('Error loading audio', error);
    }
  }, [sourceUrl, onReady]);

  const playSound = useCallback(async () => {
    try {
      setIsLoading(true);
      await AudioModule?.playAudio();
      setIsPlaying(true);
      onPlay?.();
    } catch (error) {
      console.error('Error playing sound', error);
    } finally {
      setIsLoading(false);
    }
  }, [onPlay]);

  const pauseSound = () => {
    AudioModule.pauseAudio();
    setIsPlaying(false);
    onPause?.();
  };

  const stopSound = () => {
    AudioModule.stopAudio();
    setIsPlaying(false);
    onStop?.();
  };

  const seek = async (seekTo: number) => {
    try {
      await AudioModule.seek(seekTo);
      onSeek?.(seekTo);
    } catch (error) {
      console.error('Error seeking', error);
    }
  };

  const _onSeekForward = async () => {
    try {
      const seekTo =
        elapsedTime + seekInterval > totalDuration
          ? totalDuration
          : elapsedTime + seekInterval;
      await AudioModule.seek(seekTo);
      onSeekForward?.();
    } catch (error) {
      console.error('Error seeking forward', error);
    }
  };

  const _onSeekBackward = async () => {
    try {
      const seekTo =
        elapsedTime - seekInterval < 0 ? 0 : elapsedTime - seekInterval;
      await AudioModule.seek(seekTo);
      onSeekBackward?.();
    } catch (error) {
      console.error('Error seeking backward', error);
    }
  };

  useEffect(() => {
    if (autoPlay) {
      playSound();
    }
  }, [autoPlay, playSound]);

  useEffect(() => {
    if (currentProgress === 100) {
      if (!_repeat) {
        setIsPlaying(false);
        onFinished?.();
      } else {
        setCurrentProgress(0);
        setCurrentTime(0);
        playSound();
      }
    }
  }, [_repeat, currentProgress, onFinished, playSound, repeat]);

  useEffect(() => {
    getDuration();
  }, [getDuration]);

  return {
    playerState: {
      isLoading,
      isPlaying,
      totalDuration,
      progress: currentProgress,
      elapsedTime,
    },
    playerControls: {
      play: playSound,
      pause: pauseSound,
      stop: stopSound,
      seek,
      seekForward: _onSeekForward,
      seekBackward: _onSeekBackward,
      toggleRepeat,
    },
    loadContent,
  } as IHookReturn;
};

export default usePlayerAndroid;
