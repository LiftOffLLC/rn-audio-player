import { useCallback, useContext, useMemo } from 'react';
import { createContext, useState } from 'react';
import { PlayerState, type IAudioPlayerState, type ITrackInfo } from '../types';

export interface PlayerContextProps {
  playerState: IAudioPlayerState;
  setPlayerState: React.Dispatch<React.SetStateAction<IAudioPlayerState>>;
  currentTrack: ITrackInfo | null;
  setCurrentTrack: React.Dispatch<React.SetStateAction<ITrackInfo | null>>;
  resetPlayerState: () => void;
}

const PlayerContext = createContext<PlayerContextProps | undefined>(undefined);

export const PlayerProvider = ({ children }: { children: React.ReactNode }) => {
  const [playerState, setPlayerState] = useState<IAudioPlayerState>({
    currentTrack: null,
    totalDuration: 0,
    elapsedTime: 0,
    progress: 0,
    repeat: false,
    state: PlayerState.IDEAL,
  });
  const [currentTrack, setCurrentTrack] = useState<ITrackInfo | null>(null);

  const resetPlayerState = useCallback(() => {
    setPlayerState({
      currentTrack: null,
      totalDuration: 0,
      elapsedTime: 0,
      progress: 0,
      repeat: false,
      state: PlayerState.IDEAL,
    });
  }, []);

  const value = useMemo(() => {
    return {
      playerState,
      setPlayerState,
      currentTrack,
      setCurrentTrack,
      resetPlayerState,
    };
  }, [
    playerState,
    setPlayerState,
    currentTrack,
    setCurrentTrack,
    resetPlayerState,
  ]);

  return (
    <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
  );
};

export const usePlayerContext = () => {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayerContext must be used within a PlayerProvider');
  }
  return context;
};
