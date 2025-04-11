package com.musicplayer

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.graphics.Bitmap
import android.net.Uri
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.util.Log
import androidx.annotation.RequiresApi
import com.facebook.react.bridge.*
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.google.android.exoplayer2.*
import com.google.android.exoplayer2.ui.PlayerNotificationManager

@RequiresApi(Build.VERSION_CODES.O)
@ReactModule(name = AudioModule.NAME)
class AudioModule(private val reactContext: ReactApplicationContext) :
        NativeAudioModuleSpec(reactContext) {

    private var exoPlayer: ExoPlayer? = null
    private var progressHandler: Handler? = Handler(Looper.getMainLooper())
    private var progressRunnable: Runnable? = null
    private var playerNotificationManager: PlayerNotificationManager? = null

    private var currentTitle: String = "Unknown"
    private var currentArtist: String = "Unknown"
    private var currentAlbum: String = "Unknown"
    private var currentArtwork: String = ""

    private val playerListener =
            object : Player.Listener {
                override fun onPlaybackStateChanged(state: Int) {
                    when (state) {
                        Player.STATE_BUFFERING -> emitAudioStateChange("BUFFERING")
                        Player.STATE_READY -> emitAudioStateChange("LOADED")
                        Player.STATE_ENDED -> emitAudioStateChange("COMPLETED")
                        Player.STATE_IDLE -> emitAudioStateChange("IDLE")
                    }
                }

                override fun onPlayerError(error: PlaybackException) {
                    Log.e(TAG, "ExoPlayer Error: ${error.message}")
                    emitAudioStateChange("ERROR", error.message)
                }
            }

    init {
        reactContext.runOnUiQueueThread {
            initializeProgressRunnable()
            createNotificationChannel()
        }
    }

    @RequiresApi(Build.VERSION_CODES.O)
    private fun createNotificationChannel() {
        val channel =
                NotificationChannel(CHANNEL_ID, "Audio Player", NotificationManager.IMPORTANCE_LOW)
        val notificationManager =
                reactContext.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        notificationManager.createNotificationChannel(channel)
    }

    private fun ensurePlayerReady() {
        if (exoPlayer == null) {
            exoPlayer =
                    ExoPlayer.Builder(reactContext).build().apply {
                        addListener(playerListener) // Add the persistent listener here
                    }
        }
    }

    @ReactMethod override fun addListener(eventName: String) {}
    @ReactMethod override fun removeListeners(count: Double) {}

    @ReactMethod
    override fun setMediaPlayerInfo(
            title: String?,
            artist: String?,
            album: String?,
            artwork: String?,
            promise: Promise
    ) {
        reactContext.runOnUiQueueThread {
            try {
                if (exoPlayer == null) {
                    ensurePlayerReady()
                }

                currentTitle = title ?: "Unknown"
                currentArtist = artist ?: "Unknown"
                currentAlbum = album ?: "Unknown"
                currentArtwork = artwork ?: ""

                try {
                    updateNotification()
                } catch (e: Exception) {
                    Log.e(TAG, "Error updating notification: ${e.message}")
                }

                promise.resolve(null)
            } catch (e: Exception) {
                Log.e(TAG, "Error setting media info: ${e.message}", e)
                promise.reject(
                        "ERROR",
                        "Error setting media player info: ${e.message ?: "Unknown error"}",
                        e
                )
            }
        }
    }

    @ReactMethod
    override fun loadContent(url: String, promise: Promise) {
        reactContext.runOnUiQueueThread {
            try {
                if (url.isBlank()) throw IllegalArgumentException("URL cannot be empty")
                ensurePlayerReady()

                val mediaItem = MediaItem.fromUri(Uri.parse(url))
                exoPlayer?.setMediaItem(mediaItem)

                val listener =
                        object : Player.Listener {
                            override fun onPlaybackStateChanged(state: Int) {
                                if (state == Player.STATE_READY) {
                                    promise.resolve(null)
                                    exoPlayer?.removeListener(this)
                                } else if (state == Player.STATE_IDLE || state == Player.STATE_ENDED
                                ) {
                                    // optional: reject if idle/ended
                                    promise.reject("LOAD_FAILED", "Failed to load media")
                                    exoPlayer?.removeListener(this)
                                }
                            }

                            override fun onPlayerError(error: PlaybackException) {
                                promise.reject("LOAD_ERROR", error.message)
                                exoPlayer?.removeListener(this)
                            }
                        }

                exoPlayer?.addListener(listener)
                exoPlayer?.prepare()
            } catch (e: Exception) {
                Log.e(TAG, "Error loading audio: ${e.message}")
                promise.reject("ERROR", e.message)
            }
        }
    }

    @ReactMethod
    override fun playAudio() {
        reactContext.runOnUiQueueThread {
            ensurePlayerReady()
            exoPlayer?.playWhenReady = true
            emitAudioStateChange("PLAYING")
            progressRunnable?.let { progressHandler?.post(it) }
        }
    }

    @ReactMethod
    override fun pauseAudio() {
        reactContext.runOnUiQueueThread {
            exoPlayer?.playWhenReady = false
            emitAudioStateChange("PAUSED")
            progressRunnable?.let { progressHandler?.removeCallbacks(it) }
        }
    }

    @ReactMethod
    override fun stopAudio() {
        reactContext.runOnUiQueueThread {
            exoPlayer?.stop()
            emitAudioStateChange("STOPPED")
            progressRunnable?.let { progressHandler?.removeCallbacks(it) }
        }
    }

    @ReactMethod
    override fun seek(timeInSeconds: Double) {
        reactContext.runOnUiQueueThread {
            exoPlayer?.seekTo((timeInSeconds * 1000).toLong())
        }
    }

    @ReactMethod
    override fun getTotalDuration(promise: Promise) {
        reactContext.runOnUiQueueThread {
            try {
                if (exoPlayer == null) {
                    promise.reject("ERROR", "Player not initialized")
                    return@runOnUiQueueThread
                }

                if (exoPlayer?.playbackState != Player.STATE_READY) {
                    promise.reject("ERROR", "Player not ready")
                    return@runOnUiQueueThread
                }

                val duration = exoPlayer?.duration
                if (duration == C.TIME_UNSET) {
                    promise.reject("ERROR", "Duration not available")
                    return@runOnUiQueueThread
                }

                promise.resolve(duration?.toDouble()?.div(1000) ?: 0.0)
            } catch (e: Exception) {
                Log.e(TAG, "Error getting duration: ${e.message}")
                promise.reject("ERROR", "Failed to get duration: ${e.message}")
            }
        }
    }

    private fun emitAudioStateChange(state: String, message: String? = null) {
        val params =
                Arguments.createMap().apply {
                    putString("state", state)
                    message?.let { putString("message", it) }
                }
        reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                ?.emit("onAudioStateChange", params)
    }

    private fun initializeProgressRunnable() {
        progressRunnable =
                object : Runnable {
                    override fun run() {
                        if (exoPlayer?.isPlaying == true) {
                            val currentPosition = exoPlayer?.currentPosition?.toDouble() ?: 0.0
                            val duration = exoPlayer?.duration?.toDouble() ?: 1.0

                            val params =
                                    Arguments.createMap().apply {
                                        putDouble("progress", currentPosition / duration)
                                        putDouble("currentTime", currentPosition / 1000)
                                        putDouble("totalDuration", duration / 1000)
                                    }

                            reactContext
                                    .getJSModule(
                                            DeviceEventManagerModule.RCTDeviceEventEmitter::class
                                                    .java
                                    )
                                    ?.emit("onAudioProgress", params)
                            progressHandler?.postDelayed(this, 1000)
                        }
                    }
                }
    }

    override fun onCatalystInstanceDestroy() {
        reactContext.runOnUiQueueThread {
            progressRunnable?.let { progressHandler?.removeCallbacks(it) }
            progressHandler = null
            exoPlayer?.removeListener(playerListener) // Remove the listener
            exoPlayer?.release()
            exoPlayer = null
        }
    }

    private fun updateNotification() {
        if (playerNotificationManager == null) {
            playerNotificationManager =
                    PlayerNotificationManager.Builder(reactContext, NOTIFICATION_ID, CHANNEL_ID)
                            .setMediaDescriptionAdapter(
                                    object : PlayerNotificationManager.MediaDescriptionAdapter {
                                        override fun getCurrentContentTitle(player: Player) =
                                                currentTitle
                                        override fun createCurrentContentIntent(
                                                player: Player
                                        ): PendingIntent? = null
                                        override fun getCurrentContentText(player: Player) =
                                                currentArtist
                                        override fun getCurrentSubText(player: Player) =
                                                currentAlbum
                                        override fun getCurrentLargeIcon(
                                                player: Player,
                                                callback: PlayerNotificationManager.BitmapCallback
                                        ): Bitmap? = null
                                    }
                            )
                            .build()
                            .apply { setPlayer(exoPlayer) }
        } else {
            playerNotificationManager?.setPlayer(exoPlayer)
        }
    }

    companion object {
        const val NAME = "AudioModule"
        private const val TAG = "AudioModule"
        private const val CHANNEL_ID = "audio_player_channel"
        private const val NOTIFICATION_ID = 1001
    }
}
