// Import the Swift class
#import "generated/RNMusicPlayerSpec/RNMusicPlayerSpec.h"

//
//  AudioModule.h
//  MusicPlayer
//
//  Created by Liftoff on 20/01/25.
//

#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>
#import <Foundation/Foundation.h>
#import <AVFoundation/AVFoundation.h>
#import <MediaPlayer/MediaPlayer.h>

@interface AudioModule : RCTEventEmitter <RCTBridgeModule, NativeAudioModuleSpec>

@property (nonatomic, assign) BOOL hasListeners;
@property (nonatomic, strong) AVPlayer *audioPlayer;
@property (nonatomic, strong) AVPlayerItem *playerItem;
@property (nonatomic, strong) id timeObserver;
@property (nonatomic, assign) BOOL isPlaying;
@property (nonatomic, strong) NSURL *audioURL;

// Internal methods (private implementation)
- (void)setMediaPlayerInfo:(NSString *)title 
                       artist:(NSString *)artist 
                        album:(NSString *)album 
                     duration:(NSString *)duration;
- (void)loadContentImpl:(NSString *)urlString;
- (void)playAudioImpl;
- (void)pauseAudioImpl;
- (void)stopAudioImpl;
- (void)seekImpl:(double)timeInSeconds;
- (void)setupMediaPlayerNotificationView;
- (void)setUpSession;
- (void)observeProgressUpdates;

// Required TurboModule method
- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params;

// Required method for RCTEventEmitter
- (NSArray<NSString *> *)supportedEvents;

@end