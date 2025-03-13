import Player from './components/player';
import usePlayer from './hooks/usePlayer';
import MiniPlayerComponent from './components/mini-player';
import {
  PlayerProvider as PlayerProviderComponent,
  usePlayerContext as _usePlayerContext,
} from './provider';
import type { ITrackInfo, IPlayerControls } from './types';
import { PlayerState } from './types';

export {
  PlayerState,
  usePlayer as usePlayerHook,
  Player as AudioPlayer,
  MiniPlayerComponent as MiniPlayer,
  PlayerProviderComponent as PlayerProvider,
  _usePlayerContext as usePlayerContext,
};

export type { ITrackInfo, IPlayerControls };
