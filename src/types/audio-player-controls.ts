import type { IconButtonPropsV2 } from './icon-button';

export interface SkipForwardButtonProps {
  skipForwardComponent: React.ReactNode;
  onSkipForward?: () => void;
  iconButtonProps?: IconButtonPropsV2;
}

export interface SkipBackwardButtonProps {
  skipBackwardComponent: React.ReactNode;
  onPrevious?: () => void;
  iconButtonProps?: IconButtonPropsV2;
}

export interface NextButtonProps {
  nextComponent: React.ReactNode;
  onNext?: () => void;
  iconButtonProps?: IconButtonPropsV2;
}

export interface PreviousButtonProps {
  previousComponent: React.ReactNode;
  onPrevious?: () => void;
  iconButtonProps?: IconButtonPropsV2;
}

export interface PlayPauseButtonProps {
  playPauseComponent: React.ReactNode;
  isPlaying: boolean;
  isLoading: boolean;
  onPlay: () => void;
  onPause: () => void;
  iconButtonProps?: IconButtonPropsV2;
}

export interface PlayerControlsProps {
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  isLoading: boolean;
  onSeekForward?: () => void;
  onSeekBackward?: () => void;
  skipForwardComponent?: React.ReactNode;
  skipBackwardComponent?: React.ReactNode;
  nextComponent?: React.ReactNode;
  previousComponent?: React.ReactNode;
  playPauseComponent?: React.ReactNode;
  iconButtonProps?: IconButtonPropsV2;
}
