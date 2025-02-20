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
@property (nonatomic, assign) float wasPlayingBeforeInterruption;
@property (nonatomic, copy) NSString* currentTitle;
@property (nonatomic, copy) NSString* currentArtist;
@property (nonatomic, copy) NSString* currentAlbum;
@property (nonatomic, copy) NSString* currentArtwork;
@property (nonatomic, assign) double currentDuration;
@property (nonatomic, strong) NSCache *artworkCache;

// Internal methods (private implementation)
- (void)setUpSession;
- (void)observeProgressUpdates;
- (void)emitProgressUpdate;
- (void)emitStateChange;
- (void)setupRemoteCommandCenter;
- (void)updateNowPlayingInfo;
- (void)handleSecondaryAudio;
- (void)handleAudioSessionInterruption;
- (void)handleRouteChange;

// Required TurboModule method
- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params;

// Required method for RCTEventEmitter
- (NSArray<NSString *> *)supportedEvents;

@end
