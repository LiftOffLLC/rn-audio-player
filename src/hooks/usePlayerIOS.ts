import { useCallback, useEffect, useMemo, useRef } from 'react';
import { NativeEventEmitter, NativeModules } from 'react-native';
import { PlayerState, type IHookProps } from '../types';
import { usePlayerContext } from '../provider';

const usePlayerIOS = ({
  onPlay,
  onPause,
  onStop,
  onSeek,
  onReady,
  onProgress,
}: IHookProps = {}) => {
  const { AudioModule } = NativeModules;
  const audioEventEmitter = useMemo(
    () => (AudioModule ? new NativeEventEmitter(AudioModule) : null),
    [AudioModule]
  );
  const {
    playerState,
    setPlayerState,
    setPlayerControls,
    currentTrack,
    resetPlayerState,
  } = usePlayerContext();
  const controlsSet = useRef(false);

  const getStateEnum = (state: string) => {
    // TODO - May be add "COMPLETED" state to let the user know that song is completed - Done
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
  };

  useEffect(() => {
    const progressEventHandler = audioEventEmitter?.addListener(
      'onAudioProgress',
      (event: any) => {
        const { currentTime, progress, totalDuration } = event;
        // TODO - move "progress * 100" to a variable and then use it - Not feasible as progress is coming from event
        setPlayerState((prevState) => ({
          ...prevState,
          elapsedTime: currentTime,
          progress: progress * 100,
          totalDuration: totalDuration,
        }));
        onProgress?.(progress * 100);
      }
    );

    const stateEventHandler = audioEventEmitter?.addListener(
      'onAudioStateChange',
      (event: any) => {
        const { state } = event;
        setPlayerState((prevState) => ({
          ...prevState,
          state: getStateEnum(state),
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
        currentTrack?.artwork
      );
    } catch (error) {
      console.error('Error setting track info', error);
    }
  }, [currentTrack, AudioModule]);

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
    // TODO - May be change the function name to "resetPlayerState" or something like that - Done
    resetPlayerState();
    onStop?.();
  }, [AudioModule, onStop, resetPlayerState]);

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

  const setControls = useCallback(() => {
    setPlayerControls({
      play: playSound,
      pause: pauseSound,
      toggleRepeat,
      stop: stopSound,
      loadContent,
      seek,
    });
  }, [
    setPlayerControls,
    playSound,
    pauseSound,
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
    // TODO - Reset the controls since the track has changed
    if (currentTrack === null) {
      controlsSet.current = false;
    }
  }, [currentTrack]);
};

export default usePlayerIOS;
