import { type TurboModule, TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  setMediaPlayerInfo(
    title: string,
    artist: string,
    album: string,
    artwork: string
  ): Promise<void>;
  loadContent(urlString: string): Promise<void>;
  playAudio(): void;
  pauseAudio(): void;
  stopAudio(): void;
  seek(timeInSeconds: number): void;
  getTotalDuration(): Promise<number>;
  addListener(eventName: string): void;
  removeListeners(count: number): void;
}

export default TurboModuleRegistry.getEnforcing<Spec>('AudioModule');
