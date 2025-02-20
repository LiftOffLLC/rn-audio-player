import Player from './components/player';
import usePlayer from './hooks/usePlayer';
import MiniPlayerComponent from './components/mini-player';
import {
  PlayerProvider as PlayerProviderComponent,
  usePlayerContext as _usePlayerContext,
} from './provider';

export const usePlayerHook = usePlayer;
export const AudioPlayer = Player;
export const MiniPlayer = MiniPlayerComponent;
export const PlayerProvider = PlayerProviderComponent;
export const usePlayerContext = _usePlayerContext;
