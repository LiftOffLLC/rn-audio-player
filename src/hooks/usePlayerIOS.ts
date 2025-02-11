import { useCallback, useEffect, useState, useMemo } from 'react';
import { NativeEventEmitter, NativeModules } from 'react-native';
import type { IHookProps, IHookReturn } from '../types';

const usePlayerIOS = ({
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
  seekInterval = 3,
  autoPlay = false,
}: IHookProps) => {
  const { AudioModule } = NativeModules;
  const audioEventEmitter = useMemo(
    () => (AudioModule ? new NativeEventEmitter(AudioModule) : null),
    [AudioModule]
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [totalDuration, setTotalDuration] = useState(0);
  const [_repeat, setRepeat] = useState(repeat);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [elapsedTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const progressEventHandler = audioEventEmitter?.addListener(
      'onAudioProgress',
      (event: any) => {
        const { currentTime, progress } = event;
        setCurrentTime(currentTime);
        setCurrentProgress(progress * 100);
        onProgress?.(progress * 100);
      }
    );

    const stateEventHandler = audioEventEmitter?.addListener(
      'onAudioStateChange',
      (event: any) => {
        const { state } = event;
        setIsPlaying(state === 'PLAYING');
      }
    );

    return () => {
      progressEventHandler?.remove();
      stateEventHandler?.remove();
    };
  }, [audioEventEmitter, onProgress]);

  const toggleRepeat = () => {
    setRepeat(!_repeat);
  };

  const getDuration = useCallback(async () => {
    try {
      const duration: number = await AudioModule.getTotalDuration();
      setTotalDuration(duration);
    } catch (error) {
      console.error('Error getting duration', error);
    }
  }, [AudioModule]);

  const loadContent = useCallback(async () => {
    try {
      await AudioModule.loadContent(sourceUrl);
      await getDuration();
      onReady?.();
    } catch (error) {
      console.error('Error loading audio', error);
    }
  }, [AudioModule, sourceUrl, getDuration, onReady]);

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
  }, [AudioModule, onPlay]);

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
      async () => {
        await loadContent();
        playSound();
      };
    }
  }, [autoPlay, loadContent, playSound]);

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

export default usePlayerIOS;
