# **`rn-audio-player`** 
**rn-audio-player** is a feature-rich package that allows apps to play audio from URL or file. Right now we are supporting IOS and Android. You can find the sample app using this here.

# **`Why this package`**
When there are existing solutions like expo-av, react-native-music-player, etc then what makes this package stands-out is the already integrated UI that comes in form of full-page player and a mini player, these UI components are fully-customizable and can be modified as per app's design theme. We also support background play, along with media controls and a hook that you can use directly in you app and have your own UI by extending this hook features. 😎

# **`Installation`**
**Note**- This package is supported for Node version 18 and above.
To install this package you can do 

npm install rn-audio-player
or 
yarn add rn-audio-player

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

Also if you are going to use Player or Mini-Player then it depends upon **`react-native-vector-icons`** so you have to add below permission.

```xml
<key>UIAppFonts</key>
<array>
    <string>Ionicons.ttf</string>
</array>

but if you are going with your own controls then the above step is not needed.

# **`Usage`**

**usePlayer** hook

```javascript
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

**AudioPlayer** component

```javascript
<AudioPlayer
  containerStyle={containerStyle}
  iconStyle={{
    container: iconContainerStyle,
    icon: iconStyle
  }}
  mediaStyle={{
    container: mediaContainerStyle,
    thumbnail: thumbnailStyle
  }}
  contentStyle={{
    container: contentContainerStyle,
    content: contentStyle,
    title: titleStyle,
    titleText: titleTextStyle,
    artist: artistStyle,
    artistText: artistTextStyle
  }}
  iconComponents={{
    playIcon: PlayIcon,
    pauseIcon: PauseIcon,
    forwardIcon: ForwardIcon,
    backwardIcon: BackwardIcon,
    nextIcon: NextIcon,
    previousIcon: PreviousIcon,
    repeatIcon: RepeatIcon,
    repeatOffIcon: RepeatOffIcon
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
/>
```

**MiniPlayer**
MiniPlayer also uses the same props as AudioPlayer.