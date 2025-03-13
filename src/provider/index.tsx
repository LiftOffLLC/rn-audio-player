import { useContext } from 'react';
import { createContext, useState } from 'react';
import {
  PlayerState,
  type IAudioPlayerState,
  type IPlayerControls,
  type ITrackInfo,
} from '../types';

export interface PlayerContextProps {
  playerState: IAudioPlayerState;
  playerControls: IPlayerControls | null;
  setPlayerState: React.Dispatch<React.SetStateAction<IAudioPlayerState>>;
  setPlayerControls: React.Dispatch<
    React.SetStateAction<IPlayerControls | null>
  >;
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
  const [playerControls, setPlayerControls] = useState<IPlayerControls | null>(
    null
  );
  const [currentTrack, setCurrentTrack] = useState<ITrackInfo | null>(null);

  return (
    <PlayerContext.Provider
      value={{
        playerState,
        setPlayerState,
        playerControls,
        setPlayerControls,
        currentTrack,
        setCurrentTrack,
        resetPlayerState: () =>
          setPlayerState((prevState) => ({
            ...prevState,
            currentTrack: null,
            totalDuration: 0,
            elapsedTime: 0,
            progress: 0,
            repeat: false,
            state: PlayerState.IDEAL,
          })),
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayerContext = () => {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayerContext must be used within a PlayerProvider');
  }
  return context;
};
