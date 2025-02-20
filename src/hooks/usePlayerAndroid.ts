import { useCallback, useEffect, useMemo, useRef } from 'react';
import { NativeEventEmitter, NativeModules } from 'react-native';
import { PlayerState, type IHookProps } from '../types';
import { usePlayerContext } from '../provider';

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
  seekInterval = 3,
}: IHookProps = {}) => {
  const { AudioModule } = NativeModules;
  const audioEventEmitter = useMemo(
    () => (AudioModule ? new NativeEventEmitter(AudioModule) : null),
    [AudioModule]
  );
  const { playerState, setPlayerState, setPlayerControls, currentTrack } =
    usePlayerContext();
  const controlsSet = useRef(false);

  useEffect(() => {
    const progressEventHandler = audioEventEmitter?.addListener(
      'onAudioProgress',
      (event: any) => {
        const { currentTime, progress, totalDuration } = event;
        console.log('Progress event', event);
        setPlayerState((prevState) => ({
          ...prevState,
          elapsedTime: currentTime,
          progress: progress * 100,
          totalDuration: totalDuration,
          isPlaying: Math.abs(currentTime - totalDuration) > 1,
        }));
        onProgress?.(progress * 100);
      }
    );

    const stateEventHandler = audioEventEmitter?.addListener(
      'onAudioStateChange',
      (event: any) => {
        const { state } = event;
        console.log('State event', event);
        setPlayerState((prevState) => ({
          ...prevState,
          state: state,
        }));
      }
    );

    return () => {
      progressEventHandler?.remove();
      stateEventHandler?.remove();
    };
  }, [audioEventEmitter, onProgress, playerState, setPlayerState]);

  const toggleRepeat = useCallback(() => {
    setPlayerState((prevState) => ({
      ...prevState,
      repeat: !playerState.repeat,
    }));
  }, [playerState, setPlayerState]);

  const getDuration = useCallback(async () => {
    try {
      const duration: number = await AudioModule.getTotalDuration();
      setPlayerState((prevState) => ({
        ...prevState,
        totalDuration: duration,
      }));
    } catch (error) {
      console.error('Error getting duration', error);
    }
  }, [AudioModule, setPlayerState]);

  const loadContent = useCallback(async () => {
    try {
      if (playerState.state === PlayerState.IDEAL) {
        console.log('Loading content');
        const { url } = currentTrack ?? {};
        if (!url) {
          throw new Error('No track URL found');
        }
        await AudioModule.loadContent(url);
        await getDuration();
        onReady?.();
      }
    } catch (error) {
      console.error('Error loading audio', error);
    }
  }, [playerState.state, currentTrack, AudioModule, getDuration, onReady]);

  const setTrackInfo = useCallback(async () => {
    try {
      if (!currentTrack) {
        throw new Error('No track info found');
      }
      await AudioModule.setMediaPlayerInfo(
        currentTrack?.title,
        currentTrack?.artist,
        currentTrack?.album,
        `${playerState.totalDuration ?? 0}`
      );
    } catch (error) {
      console.error('Error setting track info', error);
    }
  }, [currentTrack, AudioModule, playerState.totalDuration]);

  const playSound = useCallback(async () => {
    try {
      setPlayerState((prevState) => ({ ...prevState, isPlaying: true }));
      await AudioModule?.playAudio();
      onPlay?.();
      await setTrackInfo();
    } catch (error) {
      console.error('Error playing sound', error);
      setPlayerState((prevState) => ({ ...prevState, isPlaying: false }));
    }
  }, [AudioModule, onPlay, setPlayerState, setTrackInfo]);

  const pauseSound = useCallback(() => {
    AudioModule.pauseAudio();
    setPlayerState((prevState) => ({ ...prevState, isPlaying: false }));
    onPause?.();
  }, [AudioModule, onPause, setPlayerState]);

  const stopSound = useCallback(() => {
    AudioModule.stopAudio();
    setPlayerState((prevState) => ({
      ...prevState,
      isPlaying: false,
      currentTrack: null,
    }));
    onStop?.();
  }, [AudioModule, onStop, setPlayerState]);

  const seek = useCallback(
    async (seekTo: number) => {
      try {
        await AudioModule.seek(seekTo);
        onSeek?.(seekTo);
      } catch (error) {
        console.error('Error seeking', error);
      }
    },
    [AudioModule, onSeek]
  );

  const _onSeekForward = useCallback(async () => {
    try {
      const { elapsedTime, totalDuration } = playerState;
      const seekTo =
        (elapsedTime ?? 0) + seekInterval > totalDuration
          ? totalDuration
          : (elapsedTime ?? 0) + seekInterval;
      await AudioModule.seek(seekTo);
      onSeekForward?.();
    } catch (error) {
      console.error('Error seeking forward', error);
    }
  }, [AudioModule, onSeekForward, playerState, seekInterval]);

  const _onSeekBackward = useCallback(async () => {
    try {
      const { elapsedTime } = playerState;
      const seekTo =
        (elapsedTime ?? 0) - seekInterval < 0
          ? 0
          : (elapsedTime ?? 0) - seekInterval;
      await AudioModule.seek(seekTo);
      onSeekBackward?.();
    } catch (error) {
      console.error('Error seeking backward', error);
    }
  }, [AudioModule, onSeekBackward, playerState, seekInterval]);

  useEffect(() => {
    const { progress, repeat: _repeat } = playerState;
    if (progress === 100) {
      if (!_repeat) {
        pauseSound();
        onFinished?.();
      } else {
        seek(0);
        playSound();
      }
    }
  }, [onFinished, pauseSound, playSound, playerState, repeat, seek]);

  const setControls = useCallback(() => {
    setPlayerControls({
      play: playSound,
      pause: pauseSound,
      seekForward: _onSeekForward,
      seekBackward: _onSeekBackward,
      toggleRepeat,
      stop: stopSound,
      loadContent,
      seek,
    });
  }, [
    setPlayerControls,
    playSound,
    pauseSound,
    _onSeekForward,
    _onSeekBackward,
    toggleRepeat,
    stopSound,
    loadContent,
    seek,
  ]);

  // Only set controls once when the player has a track
  useEffect(() => {
    if (currentTrack && !controlsSet.current) {
      setControls();
      controlsSet.current = true;
    }
  }, [currentTrack, setControls]);

  // Reset the controls flag if track changes
  useEffect(() => {
    if (currentTrack === null) {
      controlsSet.current = false;
    }
  }, [currentTrack]);
};

export default usePlayerIOS;
