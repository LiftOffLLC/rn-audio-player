# **`rn-audio-player`**

**rn-audio-player** is a feature-rich package that allows apps to play audio from URL or file. Right now we are supporting IOS and Android. You can find the sample app using this [here](https://github.com/LiftOffLLC/rn-audio-player/tree/main/example)

# **`Why this package`**

When there are existing solutions like expo-av, react-native-music-player, etc then what makes this package stands-out is

1. The already integrated UI that comes in form of full-page player and a mini player.
2. These UI components are fully-customizable and can be modified as per app's design theme.
3. We also support background play, along with media controls
4. A hook that you can use directly in you app and have your own UI by extending this hook features. 😎
5. A context that you can use to manage multiple media player sessions.

# **`Installation`**

**Note**- This package is supported for Node version 18 and above.
To install this package you can do

```
npm install @liftoffllc/rn-audio-player
```

or

```
yarn add @liftoffllc/rn-audio-player
```

# **`Prerequisites`**

For IOS you have to add these permissions in your app's Info.Plist file

```xml
<key>NSMicrophoneUsageDescription</key>
<string>We need access to the microphone for audio playback</string>
<key>UIBackgroundModes</key>
<array>
    <string>audio</string>
    <string>processing</string>
    <string>fetch</string>
    <string>remote-notification</string>
</array>
```

Also if you are going to use Player or Mini-Player then it depends upon **`react-native-vector-icons`** so you have to add below permission.

```xml
<key>UIAppFonts</key>
<array>
    <string>Ionicons.ttf</string>
</array>
```

but if you are going with your own controls then the above step is not needed.

## xcode Configuration

![open xcode project and add ```"AVFoundation" "AVFAudio" "CoreMedia" "MediaPlayer"``` inside "Frameworks, Libraries, and Embedded Content" section.](./docs/screenshots/xcode-config.png)

# **`Usage`**

**usePlayer** hook

```javascript
import { usePlayer } from '@liftoffllc/rn-audio-player';

const {
    playerState: {
        isPlaying,
        isLoading,
        totalDuration,
        progress,
        elapsedTime
    },
    playerControls: {
        play,
        pause,
        stop,
        seek,
        seekForward,
        seekBackward,
        toggleRepeat
    },
    loadContent
} = usePlayer({
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
    seekInterval = 3, // default is 3 secs
    autoPlay = false, // default is false
})
```

You can use these functions directly in your app to handle player and its state.

**Note** To use our UI components you have to wrap your application in wrapper which is used to manage multiple instances of audio player.

```javascript
import { PlayerProvider } from '@liftoffllc/rn-audio-player';

export default function App() {
  return (
    <PlayerProvider>
      <MyApp />
    </PlayerProvider>
  );
}
```

**AudioPlayer** component

```javascript
import { AudioPlayer } from '@liftoffllc/rn-audio-player';

<AudioPlayer
  containerStyle={containerStyle}
  iconStyle={{
    container: iconContainerStyle,
    icon: iconStyle,
  }}
  mediaStyle={{
    container: mediaContainerStyle,
    thumbnail: thumbnailStyle,
  }}
  contentStyle={{
    container: contentContainerStyle,
    content: contentStyle,
    title: titleStyle,
    titleText: titleTextStyle,
    artist: artistStyle,
    artistText: artistTextStyle,
  }}
  iconComponents={{
    playIcon: PlayIcon,
    pauseIcon: PauseIcon,
    forwardIcon: ForwardIcon,
    backwardIcon: BackwardIcon,
    nextIcon: NextIcon,
    previousIcon: PreviousIcon,
    repeatIcon: RepeatIcon,
    repeatOffIcon: RepeatOffIcon,
  }}
  onPlay={handlePlay}
  onPause={handlePause}
  onSeek={handleSeek}
  onNext={handleNext}
  onPrevious={handlePrevious}
  onSeekForward={handleSeekForward}
  onSeekBackward={handleSeekBackward}
  onFinished={handleFinished}
  sourceUrl={sourceUrl}
  trackInfo={trackInfo}
  autoPlay={autoPlay}
  filePath={filePath}
  repeat={repeat}
  seekInterval={seekInterval}
  shouldShowControls={shouldShowControls}
  shouldShowMedia={shouldShowMedia}
  shouldShowContent={shouldShowContent}
  shouldShowDuration={shouldShowDuration}
  customProgressIndicator={CustomProgressIndicator}
  customControls={CustomControls}
/>;
```

**MiniPlayer** component

```javascript
import { MiniPlayer } from '@liftoffllc/rn-audio-player';

<MiniPlayer
  containerStyles={containerStyles}
  iconStyle={iconStyle}
  iconComponents={
    playIcon={playIcon}
    pauseIcon={pauseIcon}
    forwardIcon={forwardIcon}
    backwardIcon={backwardIcon}
    nextIcon={nextIcon}
    previousIcon={previousIcon}
    repeatIcon={repeatIcon}
    repeatOffIcon={repeatOffIcon}
  }
  autoPlay={autoPlay}
  repeat={repeat}
  trackInfo={trackInfo}
  mediaPlayerIcon={mediaPlayerIcon}
  playIcon={(...args) => React.ReactNode}
  pauseIcon={(...args) =>  React.ReactNode}
  nextIcon={(...args) =>  React.ReactNode}
  previousIcon={(...args) =>  React.ReactNode}
  onNext={onNext}
  onPreivous={onPrevious}
  onPlay={onPlay}
  onPause={onPause}
>
```
