import type { ViewStyle } from 'react-native';
import React from 'react';

/**
 * Interface representing the information of a track.
 */
export interface ITrackInfo {
  /**
   * The title of the track.
   */
  title: string;

  /**
   * The artist of the track. This field is optional.
   */
  artist?: string;

  /**
   * The album of the track. This field is optional.
   */
  album?: string;

  /**
   * The artwork URL of the track. This field is optional.
   */
  artwork?: string;

  /**
   * The URL of the track. This field is required.
   */
  url: string;
}

/**
 * Interface representing the audio player functionality and configuration.
 */
export interface IAudioPlayer {
  /**
   * Callback function to be called when the play action is triggered. This field is optional.
   */
  onPlay?: () => void;

  /**
   * Callback function to be called when the pause action is triggered. This field is optional.
   */
  onPause?: () => void;

  /**
   * Callback function to be called when the seek action is triggered. This field is optional.
   */
  onSeek?: (time: number) => void;

  /**
   * Callback function to be called when the next track action is triggered. This field is optional.
   */
  onNext?: () => void;

  /**
   * Callback function to be called when the previous track action is triggered. This field is optional.
   */
  onPrevious?: () => void;

  /**
   * Callback function to be called when the seek forward action is triggered. This field is optional.
   */
  onSeekForward?: () => void;

  /**
   * Callback function to be called when the seek backward action is triggered. This field is optional.
   */
  onSeekBackward?: () => void;

  /**
   * Callback function to be called when the audio playback is finished. This field is optional.
   */
  onFinished?: () => void;

  /**
   * The URL of the audio source. This field is optional.
   */
  sourceUrl?: string;

  /**
   * Information about the current track. This field is optional.
   */
  trackInfo: ITrackInfo;

  /**
   * Indicates whether the audio should play automatically. This field is optional.
   */
  autoPlay?: boolean;

  /**
   * The file path of the audio source. This field is optional.
   */
  filePath?: string;

  /**
   * Indicates whether the track should repeat. This field is optional.
   */
  repeat?: boolean;

  /**
   * Interval in milliseconds to seek the audio. This field is optional. Default value is 3000.
   */
  seekInterval?: number;

  /**
   * Indicates whether the controls should be shown. This field is optional.
   */
  shouldShowControls?: boolean;

  /**
   * Indicates whether the media should be shown. This field is optional.
   */
  shouldShowMedia?: boolean;

  /**
   * Indicates whether the content should be shown. This field is optional.
   */
  shouldShowContent?: boolean;

  /**
   * Indicates whether the duration should be shown. This field is optional.
   */
  shouldShowDuration?: boolean;

  /**
   * Custom progress indicator component. This field is optional.
   */
  customProgressIndicator?: React.ReactNode;

  /**
   * Custom controls component. This field is optional.
   */
  customControls?: React.ReactNode;
}

export enum PlayerState {
  'IDEAL',
  'LOADED',
  'PLAYING',
  'PAUSED',
  'STOPPED',
  'SEEKING',
}

/**
 * Interface representing the state of the audio player.
 */
export interface IAudioPlayerState {
  /**
   * The total duration of the audio.
   */
  totalDuration: number;

  /**
   * The current progress of the audio. This field is optional.
   */
  progress?: number;

  /**
   * The elapsed time of the audio. This field is optional.
   */
  elapsedTime?: number;

  /**
   * The current track information. This field is optional.
   */
  currentTrack: ITrackInfo | null;

  /**
   * Indicates whether the audio is in repeat mode.
   */
  repeat?: boolean;

  /**
   * The current state of the player.
   */
  state: PlayerState;
}

/**
 * Interface representing the style of the audio player icon.
 */
export interface IAudioPlayerIcon {
  /**
   * Style for the icon container. This field is optional.
   */
  container?: ViewStyle;

  /**
   * Style for the icon itself. This field is optional.
   */
  icon?: ViewStyle;

  /**
   * Size of the icon. This field is optional.
   */
  iconSize?: number;

  /**
   * Color of the icon. This field is optional.
   */
  iconColor?: string;

  /**
   * Background color of the icon. This field is optional.
   */
  backgroundColor?: string;

  /**
   * Underlay color of the icon. This field is optional.
   */
  underlayColor?: string;
}

/**
 * Interface representing the style of the audio player media.
 */
export interface IAudioPlayerMedia {
  /**
   * Style for the media container. This field is optional.
   */
  container?: ViewStyle;

  /**
   * Style for the media thumbnail. This field is optional.
   */
  thumbnail?: ViewStyle;
}

/**
 * Interface representing the style of the audio player content.
 */
export interface AudioPlayerContentProps {
  /**
   * Style for the content container. This field is optional.
   */
  container?: ViewStyle;

  /**
   * Custom content component. This field is optional.
   */
  content: React.ReactNode;
}

/**
 * Interface representing the icon components of the audio player.
 */
export interface IAudioPlayerIconComponents {
  /**
   * Custom play icon component. This field is optional.
   */
  playIcon?: React.ReactNode;

  /**
   * Custom pause icon component. This field is optional.
   */
  pauseIcon?: React.ReactNode;

  /**
   * Custom forward icon component. This field is optional.
   */
  forwardIcon?: React.ReactNode;

  /**
   * Custom backward icon component. This field is optional.
   */
  backwardIcon?: React.ReactNode;

  /**
   * Custom next icon component. This field is optional.
   */
  nextIcon?: React.ReactNode;

  /**
   * Custom previous icon component. This field is optional.
   */
  previousIcon?: React.ReactNode;

  /**
   * Custom repeat icon component. This field is optional.
   */
  repeatIcon?: React.ReactNode;

  /**
   * Custom repeat off icon component. This field is optional.
   */
  repeatOffIcon?: React.ReactNode;
}

/**
 * Interface representing the props of the audio player component.
 */
export interface IPlayerProps extends IAudioPlayer {
  /**
   * The style of the audio player. This field is optional.
   */
  containerStyle?: ViewStyle;

  /**
   * The style of the audio player icon. This field is optional.
   */
  iconStyle?: IAudioPlayerIcon;

  /**
   * The style of the audio player media. This field is optional.
   */
  mediaStyle?: IAudioPlayerMedia;

  /**
   * The style of the audio player content. This field is optional.
   */
  contentStyle?: AudioPlayerContentProps;

  /**
   * The style of the audio player icon components. This field is optional.
   */
  iconComponents?: IAudioPlayerIconComponents;
}

/**
 * Interface representing the properties for a music player hook.
 */
export interface IHookProps {
  /**
   * Whether the audio should play automatically.
   */
  autoPlay?: boolean;
  /**
   * Whether the track should repeat after finishing.
   */
  repeat?: boolean;

  /**
   * The interval in seconds for seeking forward or backward.
   */
  seekInterval?: number;

  /**
   * Whether the audio should continue playing in the background.
   */
  shouldPlayInBackground?: boolean;

  /**
   * Callback function to be called when playback starts.
   */
  onPlay?: () => void;

  /**
   * Callback function to be called when playback is paused.
   */
  onPause?: () => void;

  /**
   * Callback function to be called when seeking to a specific time.
   * @param time - The time in seconds to seek to.
   */
  onSeek?: (time: number) => void;

  /**
   * Callback function to be called when skipping to the next track.
   */
  onNext?: () => void;

  /**
   * Callback function to be called when going back to the previous track.
   */
  onPrevious?: () => void;

  /**
   * Callback function to be called when seeking forward.
   */
  onSeekForward?: () => void;

  /**
   * Callback function to be called when seeking backward.
   */
  onSeekBackward?: () => void;

  /**
   * Callback function to be called when the track finishes playing.
   */
  onFinished?: () => void;

  /**
   * Callback function to be called when the audio is stopped.
   */
  onStop?: () => void;

  /**
   * Callback function to be called when the audio player is ready.
   */
  onReady?: () => void;

  /**
   * Callback function for progress updates.
   * @param progress - The current progress of the audio.
   */
  onProgress?: (progress: number) => void;
}

export interface IPlayerControls {
  /**
   * Play the audio.
   */
  play?: () => void;

  /**
   * Pause the audio.
   */
  pause?: () => void;

  /**
   * Stop the audio.
   */
  stop?: () => void;

  /**
   * Seek to a specific time in the audio.
   * @param time - The time in seconds to seek to.
   */
  seek?: (time: number) => void;

  /**
   * Seek forward by the specified interval.
   */
  seekForward?: () => void;

  /**
   * Seek backward by the specified interval.
   */
  seekBackward?: () => void;

  /**
   * Toggle the repeat mode.
   */
  toggleRepeat?: () => void;

  /**
   * Load content from the specified track.
   */
  loadContent?: () => Promise<void>;
}

export interface IMiniPlayerProps {
  containerStyles?: ViewStyle;
  iconStyle?: IAudioPlayerIcon;
  contentStyle?: AudioPlayerContentProps;
  iconComponents?: IAudioPlayerIconComponents;
  autoPlay?: boolean;
  trackInfo: ITrackInfo;
  mediaPlayerIcon?: React.ReactNode;
  playIcon?: (args: any) => React.ReactNode;
  pauseIcon?: (args: any) => React.ReactNode;
  nextIcon?: (args: any) => React.ReactNode;
  previousIcon?: (args: any) => React.ReactNode;
  onNext?: () => void;
  onPrevious?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
}
