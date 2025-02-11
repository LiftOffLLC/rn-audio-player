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
        [self setUpSession];
    }
    return self;
}

+ (BOOL)requiresMainQueueSetup
{
    return YES;
}

// Add listener tracking
- (void)startObserving {
    os_log(OS_LOG_DEFAULT, "Starting to observe");
    self.hasListeners = YES;
}

- (void)stopObserving {
    os_log(OS_LOG_DEFAULT, "Stopping to observe");
    self.hasListeners = NO;
}

- (NSArray<NSString *> *)supportedEvents {
    os_log(OS_LOG_DEFAULT, "Supported events");
    return @[@"onAudioStateChange", @"onAudioProgress"];
}

- (void)setUpSession {
    @try {
        AVAudioSession *session = [AVAudioSession sharedInstance];
        [session setCategory:AVAudioSessionCategoryPlayback mode:AVAudioSessionModeDefault options:AVAudioSessionCategoryOptionAllowBluetooth error:nil];
        [session setActive:YES error:nil];
        [[UIApplication sharedApplication] beginReceivingRemoteControlEvents];
    } @catch (NSException *exception) {
        os_log(OS_LOG_DEFAULT, "Failed to set up audio session: %@", exception.reason);
    }
}

- (void)setMediaPlayerInfo:(NSString *)title
    withArtist:(NSString *)artist 
    withAlbum:(NSString *)album 
    withDuration:(NSString *)duration
{
    NSMutableDictionary *nowPlayingInfo = [NSMutableDictionary dictionary];
    nowPlayingInfo[MPMediaItemPropertyTitle] = title;
    nowPlayingInfo[MPMediaItemPropertyArtist] = artist;
    nowPlayingInfo[MPMediaItemPropertyAlbumTitle] = album;
    nowPlayingInfo[MPMediaItemPropertyPlaybackDuration] = duration;
    nowPlayingInfo[MPNowPlayingInfoPropertyPlaybackRate] = @1.0;

    [MPNowPlayingInfoCenter defaultCenter].nowPlayingInfo = nowPlayingInfo;
}

- (void)loadContent:(NSString *)urlString {
    self.audioURL = [NSURL URLWithString:urlString];
    self.playerItem = [AVPlayerItem playerItemWithURL:self.audioURL];
    self.audioPlayer = [AVPlayer playerWithPlayerItem:self.playerItem];

    [self emitStateChange:@"loaded" message:@"Content loaded successfully"];
    [self setupMediaPlayerNotificationView];
}

- (void)playAudio {
    if (self.audioPlayer) {
        [self.audioPlayer play];
        self.isPlaying = YES;
        [self emitStateChange:@"PLAYING" message:@""];
        [self observeProgressUpdates];
    }
}

- (void)pauseAudio {
    if (self.audioPlayer) {
        [self.audioPlayer pause];
        self.isPlaying = NO;
        [self emitStateChange:@"PAUSED" message:@""];
    }
}

- (void)stopAudio {
    if (self.audioPlayer) {
        [self.audioPlayer pause];
        self.audioPlayer = nil;
        self.playerItem = nil;
        self.isPlaying = NO;
        [self emitStateChange:@"STOPPED" message:@""];
    }
}

- (void)seek:(double)timeInSeconds {
    if (self.audioPlayer) {
        CMTime seekTime = CMTimeMakeWithSeconds(timeInSeconds, NSEC_PER_SEC);
        [self.audioPlayer seekToTime:seekTime completionHandler:^(BOOL finished) {
            if (finished) {
                [self emitStateChange:@"SKEEING" message:[NSString stringWithFormat:@"Seeked to %f seconds", timeInSeconds]];
            }
        }];
    }
}

- (void)getTotalDuration:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
    if (self.playerItem) {
        CMTime duration = self.playerItem.asset.duration;
        float seconds = CMTimeGetSeconds(duration);
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
        self.timeObserver = [self.audioPlayer addPeriodicTimeObserverForInterval:CMTimeMakeWithSeconds(1, NSEC_PER_SEC) queue:dispatch_get_main_queue() usingBlock:^(CMTime time) {
            __strong AudioModule *strongSelf = weakSelf;
            if (!strongSelf) return;

            float currentTime = CMTimeGetSeconds(time);
            float duration = CMTimeGetSeconds(strongSelf.audioPlayer.currentItem.duration);
            if (duration > 0) {
                float progress = currentTime / duration;
                [self emitProgressUpdate:progress currentTime:currentTime totalDuration:duration];
            }
        }];
    }
}

- (void)setupMediaPlayerNotificationView {
    MPRemoteCommandCenter *commandCenter = [MPRemoteCommandCenter sharedCommandCenter];

    commandCenter.playCommand.enabled = YES;
    [commandCenter.playCommand addTargetWithHandler:^MPRemoteCommandHandlerStatus(MPRemoteCommandEvent *event) {
        [self playAudio];
        return MPRemoteCommandHandlerStatusSuccess;
    }];

    commandCenter.pauseCommand.enabled = YES;
    [commandCenter.pauseCommand addTargetWithHandler:^MPRemoteCommandHandlerStatus(MPRemoteCommandEvent *event) {
        [self pauseAudio];
        return MPRemoteCommandHandlerStatusSuccess;
    }];

    commandCenter.stopCommand.enabled = YES;
    [commandCenter.stopCommand addTargetWithHandler:^MPRemoteCommandHandlerStatus(MPRemoteCommandEvent *event) {
        [self stopAudio];
        return MPRemoteCommandHandlerStatusSuccess;
    }];

    MPNowPlayingInfoCenter *infoCenter = [MPNowPlayingInfoCenter defaultCenter];
    NSMutableDictionary *nowPlayingInfo = [NSMutableDictionary dictionary];
    nowPlayingInfo[MPMediaItemPropertyTitle] = @"Unknown Title";
    nowPlayingInfo[MPMediaItemPropertyArtist] = @"Unknown Artist";
    nowPlayingInfo[MPNowPlayingInfoPropertyPlaybackRate] = @(1.0);
    infoCenter.nowPlayingInfo = nowPlayingInfo;
}

- (void)dealloc {
    if (self.timeObserver) {
        [self.audioPlayer removeTimeObserver:self.timeObserver];
        self.timeObserver = nil;
    }
    self.audioPlayer = nil;
    self.playerItem = nil;
}

- (void)emitStateChange:(NSString *)state message:(NSString * _Nullable)message {
    if (!self.hasListeners) {
        os_log(OS_LOG_DEFAULT, "No listeners to emit state change event");
        return;
    }
    NSMutableDictionary *event = [NSMutableDictionary dictionaryWithObject:state forKey:@"state"];
    if (message) {
        [event setObject:message forKey:@"message"];
    }
    os_log(OS_LOG_DEFAULT, "Sending state change event");
    [self sendEventWithName:@"onAudioStateChange" body:event];
}

- (void)emitProgressUpdate:(double)progress currentTime:(double)currentTime totalDuration:(double)totalDuration {
    if (!self.hasListeners) {
        os_log(OS_LOG_DEFAULT, "No listeners to emit progress event");
        return;
    }
    NSDictionary *event = @{
        @"progress": @(progress),
        @"currentTime": @(currentTime),
        @"totalDuration": @(totalDuration)
    };
    os_log(OS_LOG_DEFAULT, "Sending progress event");
    [self sendEventWithName:@"onAudioProgress" body:event];
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::NativeAudioModuleSpecJSI>(params);
}

@end

