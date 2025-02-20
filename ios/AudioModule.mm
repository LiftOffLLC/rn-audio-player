//
//  AudioModule.m
//  MusicPlayer
//
//  Created by Liftoff on 20/01/25.
//

#import "AudioModule.h"
#import <os/log.h>

@implementation AudioModule

RCT_EXPORT_MODULE(AudioModule);

- (instancetype)init {
  self = [super init];
  if (self) {
    self.artworkCache = [[NSCache alloc] init];
    [self.artworkCache setCountLimit:10]; // Cache up to 10 images
    [self.artworkCache setTotalCostLimit:10 * 1024 * 1024]; // 10MB limit
    [self setUpSession];
  }
  return self;
}

+ (BOOL)requiresMainQueueSetup {
  return YES;
}

// Add listener tracking
- (void)startObserving {
  self.hasListeners = YES;
}

- (void)stopObserving {
  self.hasListeners = NO;
}

- (NSArray<NSString *> *)supportedEvents {
  return @[ @"onAudioStateChange", @"onAudioProgress" ];
}

- (void)setUpSession {
  @try {
    AVAudioSession *session = [AVAudioSession sharedInstance];
    [session setCategory:AVAudioSessionCategoryPlayback
                    mode:AVAudioSessionModeDefault
                 options:AVAudioSessionCategoryOptionAllowBluetooth
                   error:nil];
    [session setActive:YES error:nil];

    // Ensure this runs on the main thread
    dispatch_async(dispatch_get_main_queue(), ^{
      [[UIApplication sharedApplication] beginReceivingRemoteControlEvents];

      // Enhanced command center setup
      MPRemoteCommandCenter *commandCenter =
          [MPRemoteCommandCenter sharedCommandCenter];

      // Clear previous targets if any
      [commandCenter.playCommand removeTarget:nil];
      [commandCenter.pauseCommand removeTarget:nil];
      [commandCenter.togglePlayPauseCommand removeTarget:nil];

      // Enable commands
      commandCenter.playCommand.enabled = YES;
      commandCenter.pauseCommand.enabled = YES;
      commandCenter.togglePlayPauseCommand.enabled = YES;

      // Add handlers with diagnostic logging
      [commandCenter.playCommand addTarget:self
                                    action:@selector(handlePlayCommand:)];
      [commandCenter.pauseCommand addTarget:self
                                     action:@selector(handlePauseCommand:)];
      [commandCenter.togglePlayPauseCommand
          addTarget:self
             action:@selector(handleTogglePlayPauseCommand:)];

      NSLog(@"Remote command center initialized successfully");
    });
  } @catch (NSException *exception) {
    os_log(OS_LOG_DEFAULT, "Failed to set up audio session: %@",
           exception.reason);
  }
}

// Add this missing handler
- (MPRemoteCommandHandlerStatus)handleTogglePlayPauseCommand:
    (MPRemoteCommandEvent *)event {
  NSLog(@"Toggle play/pause command received");
  if (self.isPlaying) {
    return [self handlePauseCommand:event];
  } else {
    return [self handlePlayCommand:event];
  }
}
- (MPRemoteCommandHandlerStatus)handlePlayCommand:
    (MPRemoteCommandEvent *)event {
  if (!self.isPlaying) {
    [self playAudio]; // Your internal play function
    self.isPlaying = YES;
    [self updateNowPlayingInfo];
    return MPRemoteCommandHandlerStatusSuccess;
  }
  return MPRemoteCommandHandlerStatusCommandFailed;
}

- (MPRemoteCommandHandlerStatus)handlePauseCommand:
    (MPRemoteCommandEvent *)event {
  if (self.isPlaying) {
    [self pauseAudio]; // Your internal pause function
    self.isPlaying = NO;
    [self updateNowPlayingInfo];
    return MPRemoteCommandHandlerStatusSuccess;
  }
  return MPRemoteCommandHandlerStatusCommandFailed;
}

- (void)setMediaPlayerInfo:(NSString *)title
                    artist:(NSString *)artist
                     album:(NSString *)album
                   artwork:(NSString *)artwork
                   resolve:(RCTPromiseResolveBlock)resolve
                    reject:(RCTPromiseRejectBlock)reject {
  @try {
    // Get the duration from the player itself
    double duration = 0;
    if (self.audioPlayer.currentItem) {
      CMTime time = self.audioPlayer.currentItem.duration;
      duration = CMTimeGetSeconds(time);
      if (isnan(duration) || duration <= 0) {
        duration = 0;
      }
    }
    duration = ceil(duration * 1000) / 1000; // Round to milliseconds
    self.currentTitle = title ?: @"Unknown Title";
    self.currentArtist = artist ?: @"Unknown Artist";
    self.currentAlbum = album ?: @"Unknown Album";
    self.currentArtwork = artwork ?: @"";
    self.currentDuration = duration;

    [self updateNowPlayingInfo];
    resolve(@YES);
  } @catch (NSException *exception) {
    reject(@"ERROR", @"Failed to update now playing info", nil);
  }
}

- (void)updateNowPlayingInfoWithArtworkURL:(NSString *)imageUrl {
    NSURL *url = [NSURL URLWithString:imageUrl];
    if (!url) return;

    // Check cache first
    UIImage *cachedImage = [self.artworkCache objectForKey:imageUrl];
    if (cachedImage) {
        return;
    }

    // Download image asynchronously if not cached
    NSURLSessionDataTask *downloadTask = [[NSURLSession sharedSession] dataTaskWithURL:url completionHandler:^(NSData * _Nullable data, NSURLResponse * _Nullable response, NSError * _Nullable error) {
        if (error) {
            NSLog(@"Failed to load artwork: %@", error.localizedDescription);
            return;
        }

        if (data) {
            UIImage *artworkImage = [UIImage imageWithData:data];
            if (artworkImage) {
                // Store image in cache
                [self.artworkCache setObject:artworkImage forKey:imageUrl];
            }
        }
    }];
    
    [downloadTask resume];
}

- (void)updateNowPlayingInfo {
  if (!self.audioPlayer)
    return;

  if ([MPNowPlayingInfoCenter defaultCenter].nowPlayingInfo) {
    NSLog(@"Now Playing Info: %@",
          [MPNowPlayingInfoCenter defaultCenter].nowPlayingInfo);
  } else {
    NSLog(@"Now Playing Info is nil");
  }

  NSMutableDictionary *nowPlayingInfo = [NSMutableDictionary dictionary];

  nowPlayingInfo[MPMediaItemPropertyTitle] =
      self.currentTitle ?: @"Unknown Title";
  nowPlayingInfo[MPMediaItemPropertyArtist] =
      self.currentArtist ?: @"Unknown Artist";
  nowPlayingInfo[MPMediaItemPropertyAlbumTitle] =
      self.currentAlbum ?: @"Unknown Album";

  float currentTime = CMTimeGetSeconds(self.audioPlayer.currentTime);
  float duration = self.currentDuration > 0
                       ? self.currentDuration
                       : CMTimeGetSeconds(self.playerItem.duration);

  NSURL *url = [NSURL URLWithString:self.currentArtwork];

    if (url) {
        // if url is present download the image
        [self updateNowPlayingInfoWithArtworkURL:self.currentArtwork];
        UIImage *artworkImage = [self.artworkCache objectForKey:self.currentArtwork];
        if (artworkImage) {
            MPMediaItemArtwork *artwork = [[MPMediaItemArtwork alloc] initWithImage:artworkImage];
            nowPlayingInfo[MPMediaItemPropertyArtwork] = artwork;
        }
    }
  
  nowPlayingInfo[MPNowPlayingInfoPropertyElapsedPlaybackTime] = @(currentTime);
  nowPlayingInfo[MPMediaItemPropertyPlaybackDuration] = @(duration);
  nowPlayingInfo[MPNowPlayingInfoPropertyPlaybackRate] = @1.0;
  nowPlayingInfo[MPNowPlayingInfoPropertyDefaultPlaybackRate] = @1.0;

  dispatch_async(dispatch_get_main_queue(), ^{
    [MPNowPlayingInfoCenter defaultCenter].nowPlayingInfo = nowPlayingInfo;
  });
}

- (void)loadContent:(NSString *)urlString {
  self.audioURL = [NSURL URLWithString:urlString];
  self.playerItem = [AVPlayerItem playerItemWithURL:self.audioURL];
  self.audioPlayer = [AVPlayer playerWithPlayerItem:self.playerItem];

  [self emitStateChange:@"LOADED" message:@"Content loaded successfully"];
}

- (void)playAudio {
  if (self.audioPlayer) {
    [self.audioPlayer play];
    self.isPlaying = YES;
    [self updateNowPlayingInfo];
    [self emitStateChange:@"PLAYING" message:@""];
    [self observeProgressUpdates];
  }
}

- (void)pauseAudio {
  if (self.audioPlayer) {
    [self.audioPlayer pause];
    self.isPlaying = NO;
    [self updateNowPlayingInfo];
    [self emitStateChange:@"PAUSED" message:@""];
  }
}

- (void)stopAudio {
  if (self.audioPlayer) {
    [self.audioPlayer pause];
    self.audioPlayer = nil;
    [self.playerItem removeObserver:self forKeyPath:@"status"];
    self.playerItem = nil;
    self.isPlaying = NO;
    [self updateNowPlayingInfo];
    [self emitStateChange:@"STOPPED" message:@""];
  }
}

- (void)seek:(double)timeInSeconds {
  if (self.audioPlayer) {
    os_log(OS_LOG_DEFAULT, "Seeking to %f seconds", timeInSeconds);
    CMTime seekTime = CMTimeMakeWithSeconds(timeInSeconds, NSEC_PER_SEC);
    [self.audioPlayer seekToTime:seekTime
               completionHandler:^(BOOL finished) {
                 if (finished) {
                   os_log(OS_LOG_DEFAULT, "Seek completed successfully");
                   [self updateNowPlayingInfo];
                 } else {
                   os_log(OS_LOG_DEFAULT, "Seek failed");
                 }
               }];
  }
}

- (void)getTotalDuration:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject {
  if (self.playerItem) {
    CMTime duration = self.playerItem.asset.duration;
    float seconds = ceil(CMTimeGetSeconds(duration) * 1000) / 1000;
    if (seconds > 0) {
      resolve(@(seconds));
    } else {
      reject(@"ERROR", @"Failed to retrieve total duration", nil);
    }
  } else {
    reject(@"NO_CONTENT", @"No audio loaded", nil);
  }
}

- (void)observeProgressUpdates {
  if (self.audioPlayer) {
    __weak AudioModule *weakSelf = self;
    self.timeObserver = [self.audioPlayer
        addPeriodicTimeObserverForInterval:CMTimeMakeWithSeconds(1,
                                                                 NSEC_PER_SEC)
                                     queue:dispatch_get_main_queue()
                                usingBlock:^(CMTime time) {
                                  __strong AudioModule *strongSelf = weakSelf;
                                  if (!strongSelf)
                                    return;

                                  float currentTime = ceil(
                                      (CMTimeGetSeconds(time) * 1000) / 1000);
                                  float duration =
                                      ceil((CMTimeGetSeconds(
                                                strongSelf.audioPlayer
                                                    .currentItem.duration) *
                                            1000) /
                                           1000);
                                  if (duration > 0) {
                                    float progress = currentTime / duration;
                                    [strongSelf updateNowPlayingInfo];
                                    [self emitProgressUpdate:progress
                                                 currentTime:currentTime
                                               totalDuration:duration];
                                  }
                                }];
  }
}

- (void)dealloc {
  if (self.timeObserver) {
    [self.audioPlayer removeTimeObserver:self.timeObserver];
    self.timeObserver = nil;
  }
  self.audioPlayer = nil;
  self.playerItem = nil;
}

- (void)emitStateChange:(NSString *)state message:(NSString *_Nullable)message {
  if (!self.hasListeners) {
    os_log(OS_LOG_DEFAULT, "No listeners to emit state change event");
    return;
  }
  NSMutableDictionary *event =
      [NSMutableDictionary dictionaryWithObject:state forKey:@"state"];
  if (message) {
    [event setObject:message forKey:@"message"];
  }
  [self sendEventWithName:@"onAudioStateChange" body:event];
}

- (void)emitProgressUpdate:(double)progress
               currentTime:(double)currentTime
             totalDuration:(double)totalDuration {
  if (!self.hasListeners) {
    os_log(OS_LOG_DEFAULT, "No listeners to emit progress event");
    return;
  }

  if (isnan(progress) || isnan(currentTime) || isnan(totalDuration)) {
    os_log(OS_LOG_DEFAULT, "Invalid progress values");
    [self emitStateChange:@"ERROR" message:@"Invalid progress values"];
    [self stopObserving];
    return;
  }

  if (progress < 0 || progress > 1 || currentTime < 0 || totalDuration < 0) {
    os_log(OS_LOG_DEFAULT, "Invalid progress values");
    [self emitStateChange:@"ERROR" message:@"Invalid progress values"];
    [self stopObserving];
    return;
  }

  if (currentTime > totalDuration) {
    os_log(OS_LOG_DEFAULT, "Current time exceeds total duration");
    return;
  }

  if (progress == 1) {
    [self.audioPlayer pause];
    self.isPlaying = NO;
    [self emitStateChange:@"COMPLETED" message:@""];
  }
  NSDictionary *event = @{
    @"progress" : @(progress),
    @"currentTime" : @(currentTime),
    @"totalDuration" : @(totalDuration)
  };
  [self sendEventWithName:@"onAudioProgress" body:event];
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::NativeAudioModuleSpecJSI>(params);
}

@end
