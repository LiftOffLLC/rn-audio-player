
package com.musicplayer

import android.content.Intent
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.util.Log
import androidx.annotation.OptIn
import androidx.annotation.RequiresApi
import androidx.media3.common.MediaItem
import androidx.media3.common.MediaMetadata
import androidx.media3.common.Player
import androidx.media3.common.util.UnstableApi
import androidx.media3.exoplayer.ExoPlayer
import com.facebook.react.bridge.*

class AudioModule(reactContext: ReactApplicationContext) :
        ReactContextBaseJavaModule(reactContext), Player.Listener {

    private var exoPlayer = ExoPlayerSingleton.getInstance(reactContext.applicationContext)
    private var isPlaying = false
    private var currentPlaybackPosition: Int = 0
    private var audioURL: String? = null
    private var progressHandler: Handler? = null

    init {
        exoPlayer.addListener(this) // Adding listener to handle events
    }

    companion object {
        private var shared: AudioModule? = null

        fun sharedInstance(reactContext: ReactApplicationContext): AudioModule {
            if (shared == null) {
                shared = AudioModule(reactContext)
            }
            return shared!!
        }
    }

    override fun getName(): String {
        return "AudioModule"
    }

    // In your AudioModule class
    private val mainHandler = Handler(Looper.getMainLooper())

    @RequiresApi(Build.VERSION_CODES.O)
    @ReactMethod
    fun playAudio(url: String, metaData: ReadableMap?, promise: Promise?) {
        mainHandler.post { // Run the code inside the post() block on the main thread
            if (Looper.myLooper()?.thread?.isAlive == true) {
                try {
                    // If the audio URL is the same, just resume playback
                    // Create media item with metadata
                    val title = metaData?.getString("title")
                    val artist = metaData?.getString("artist")
                    val album = metaData?.getString("album")

                    if (audioURL == url) {
                        exoPlayer.playWhenReady = true
                        startService(title, artist, album, url)
                        promise?.resolve(null)
                        return@post
                    }

                    val mediaItem =
                            MediaItem.Builder()
                                    .setUri(url)
                                    .setMediaMetadata(
                                            MediaMetadata.Builder()
                                                    .setTitle(title)
                                                    .setArtist(artist)
                                                    .setAlbumTitle(album)
                                                    .setMediaType(MediaMetadata.MEDIA_TYPE_MUSIC)
                                                    .build()
                                    )
                                    .build()

                    exoPlayer.setMediaItem(mediaItem)
                    exoPlayer.prepare()
                    audioURL = url
                    exoPlayer.seekTo(currentPlaybackPosition.toLong())
                    exoPlayer.playWhenReady = true
                    // Add a listener to wait for the player to be ready
                    startService(title!!, artist!!, album!!, url)
                    // AudioEventModule.sharedInstance(reactApplicationContext).emitStateChange("PLAYING")
                    promise?.resolve(null)
                } catch (e: Exception) {
                    promise?.reject("ERROR", "Failed to initialize audio player", e)
                }
            } else {
                Log.e("AudioModule", "Handler attempted to run on a dead thread")
                promise?.reject("THREAD_ERROR", "Handler is running on a dead thread")
            }
        }
    }

    private fun startService(title: String?, artist: String?, album: String?, url: String?) {
        mainHandler.post {
            try {
                exoPlayer.addListener(
                        object : Player.Listener {
                            override fun onPlaybackStateChanged(state: Int) {
                                if (state == Player.STATE_READY) {
                                    // Start the PlaybackService
                                    Log.d("AudioModule", "Starting playback service")
                                    val serviceIntent =
                                            Intent(
                                                            reactApplicationContext,
                                                            PlaybackService::class.java
                                                    )
                                                    .apply {
                                                        action = "SHOW_NOTIFICATION"
                                                        putExtra("MEDIA_URL", url)
                                                        putExtra("TITLE", title)
                                                        putExtra("ARTIST", artist)
                                                        putExtra("ALBUM", album)
                                                    }
                                    reactApplicationContext.startService(serviceIntent)
                                    Log.d("AudioModule", "Playback service started")
                                    // Remove the listener after getting the duration
                                    exoPlayer.removeListener(this)
                                }
                            }
                        }
                )
            } catch (e: Exception) {
                print("ERROR Failed to start service")
            }
        }
    }

    @ReactMethod
    fun pauseAudio() {
        mainHandler.post {
            try {
                exoPlayer.pause()
                isPlaying = false
                currentPlaybackPosition = exoPlayer.currentPosition.toInt()
            } catch (e: Exception) {
                print("ERROR Failed to pause audio")
            }
        }
    }

    @ReactMethod
    fun stopAudio() {
        mainHandler.post {
            try {
                exoPlayer.stop()
                exoPlayer.seekTo(0)
                isPlaying = false
                currentPlaybackPosition = 0
                // Stop the PlaybackService
                val serviceIntent = Intent(reactApplicationContext, PlaybackService::class.java)
                reactApplicationContext.stopService(serviceIntent)
            } catch (e: Exception) {
                print("ERROR Failed to stop audio")
            }
        }
    }

    @ReactMethod
    fun seek(timeInSeconds: Double) {
        mainHandler.post {
            try {
                val seekPosition = (timeInSeconds * 1000).toLong() // Convert to milliseconds
                exoPlayer.seekTo(seekPosition)
            } catch (e: Exception) {
                print("ERROR Failed to seek audio")
            }
        }
    }

    @OptIn(UnstableApi::class)
    @ReactMethod
    fun getTotalDuration(url: String, promise: Promise) {
        try {
            val mediaItem = MediaItem.fromUri(url)
            val tempExoPlayer = ExoPlayer.Builder(reactApplicationContext).build()
            tempExoPlayer.setMediaItem(mediaItem)
            tempExoPlayer.prepare()

            tempExoPlayer.addListener(
                    object : Player.Listener {
                        @Deprecated("This method overrides a deprecated member")
                        override fun onPlayerStateChanged(
                                playWhenReady: Boolean,
                                playbackState: Int
                        ) {
                            if (playbackState == Player.STATE_READY) {
                                val totalDuration =
                                        tempExoPlayer.duration / 1000.0 // Convert to seconds
                                promise.resolve(totalDuration)
                                tempExoPlayer.release()
                            }
                        }
                    }
            )
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to retrieve total duration", e)
        }
    }

    // This method is triggered on every playback state change (e.g., when the media starts playing)
    @Deprecated("Deprecated in Java")
    override fun onPlayerStateChanged(playWhenReady: Boolean, playbackState: Int) {
        Log.d("AudioModule", "Playback state changed: $playbackState")
        when (playbackState) {
            Player.STATE_IDLE, Player.STATE_ENDED -> {
                isPlaying = false
                stopProgressUpdates()
                AudioEventModule.sharedInstance(reactApplicationContext).emitStateChange("STOPPED")
            }

            Player.STATE_BUFFERING -> {
                Log.d("AudioModule", "Player is buffering")
            }

            Player.STATE_READY -> {
                Log.d("AudioModule", "Player is ready")
            }
        }
    }

    override fun onIsPlayingChanged(isPlaying: Boolean) {
        this@AudioModule.isPlaying = isPlaying
        if (isPlaying) {
            startProgressUpdates()
            AudioEventModule.sharedInstance(reactApplicationContext).emitStateChange("PLAYING")
        } else {
            stopProgressUpdates()
            AudioEventModule.sharedInstance(reactApplicationContext).emitStateChange("PAUSED")
        }
        // Update UI or state to reflect the playing state
        Log.d("AudioModule", "Is playing: $isPlaying")
    }

    private fun startProgressUpdates() {
        stopProgressUpdates()
        progressHandler = Handler(Looper.getMainLooper())
        progressHandler?.post(
                object : Runnable {
                    override fun run() {
                        if (isPlaying && Looper.myLooper()?.thread?.isAlive == true) {
                            sendProgressUpdate()
                            progressHandler?.postDelayed(this, 1000) // Update every second
                        }
                    }
                }
        )
    }

    private fun stopProgressUpdates() {
        progressHandler?.removeCallbacksAndMessages(null)
        progressHandler = null
    }

    private fun sendProgressUpdate() {
        val currentPosition = exoPlayer.currentPosition.toDouble()
        val totalDuration = exoPlayer.duration.toDouble()
        val progress = if (totalDuration > 0) currentPosition / totalDuration else 0.0

        AudioEventModule.sharedInstance(reactApplicationContext)
                .emitProgressUpdate(progress, currentPosition / 1000.0, totalDuration / 1000.0)
    }
}
