package com.musicplayer

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.graphics.Bitmap
import android.net.Uri
import android.os.Handler
import android.os.Looper
import android.util.Log
import com.facebook.react.bridge.*
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.google.android.exoplayer2.*
import com.google.android.exoplayer2.ui.PlayerNotificationManager

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

    init {
        reactContext.runOnUiQueueThread {
            initializePlayer()
            initializeProgressRunnable()
            createNotificationChannel()
        }
    }

    private fun createNotificationChannel() {
        val channel = NotificationChannel(
            CHANNEL_ID,
            "Audio Player",
            NotificationManager.IMPORTANCE_LOW
        )
        val notificationManager = reactContext.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        notificationManager.createNotificationChannel(channel)
    }

    private fun initializePlayer() {
        if (exoPlayer == null) {
            exoPlayer = ExoPlayer.Builder(reactContext).build().apply {
                addListener(object : Player.Listener {
                    override fun onPlaybackStateChanged(state: Int) {
                        when (state) {
                            Player.STATE_BUFFERING -> emitAudioStateChange("BUFFERING")
                            Player.STATE_READY -> emitAudioStateChange("LOADED")
                            Player.STATE_ENDED -> emitAudioStateChange("COMPLETED")
                        }
                    }

                    override fun onPlayerError(error: PlaybackException) {
                        Log.e(TAG, "ExoPlayer Error: ${error.message}")
                        emitAudioStateChange("ERROR", error.message)
                    }
                })
            }
        }
    }

    @ReactMethod
    override fun addListener(eventName: String) {
        // Required for RN event emitter
    }

    @ReactMethod
    override fun removeListeners(count: Double) {
        // Required for RN event emitter
    }

    @ReactMethod
    override fun setMediaPlayerInfo(title: String?, artist: String?, album: String?, artwork: String?, promise: Promise) {
        try {
            currentTitle = title ?: "Unknown"
            currentArtist = artist ?: "Unknown"
            currentAlbum = album ?: "Unknown"
            currentArtwork = artwork ?: ""
            
            updateNotification()
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("ERROR", "Error setting media player info: ${e.message}")
        }
    }

    @ReactMethod
    override fun loadContent(url: String) {
        reactContext.runOnUiQueueThread {
            try {
                if (url.isBlank()) throw IllegalArgumentException("URL cannot be empty")
                initializePlayer()
                val mediaItem = MediaItem.fromUri(Uri.parse(url))
                exoPlayer?.setMediaItem(mediaItem)
                exoPlayer?.prepare()
            } catch (e: Exception) {
                Log.e(TAG, "Error loading audio: ${e.message}")
                emitAudioStateChange("ERROR", e.message)
            }
        }
    }

    @ReactMethod
    override fun playAudio() {
        reactContext.runOnUiQueueThread {
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
            emitAudioStateChange("SEEKED")
        }
    }

    @ReactMethod
    override fun getTotalDuration(promise: Promise) {
        reactContext.runOnUiQueueThread {
            val duration = exoPlayer?.duration?.toDouble() ?: 0.0
            promise.resolve(duration / 1000) // Convert to seconds
        }
    }

    private fun emitAudioStateChange(state: String, message: String? = null) {
        val params = Arguments.createMap().apply {
            putString("state", state)
            message?.let { putString("message", it) }
        }
        reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            ?.emit("onAudioStateChange", params)
    }

    private fun initializeProgressRunnable() {
        progressRunnable = object : Runnable {
            override fun run() {
                if (exoPlayer?.isPlaying == true) {
                    val currentPosition = exoPlayer?.currentPosition?.toDouble() ?: 0.0
                    val duration = exoPlayer?.duration?.toDouble() ?: 1.0

                    val params = Arguments.createMap().apply {
                        putDouble("progress", currentPosition / duration)
                        putDouble("currentTime", currentPosition / 1000)
                        putDouble("totalDuration", duration / 1000)
                    }

                    reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
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
            exoPlayer?.release()
            exoPlayer = null
        }
    }

    private fun updateNotification() {
        if (playerNotificationManager == null) {
            playerNotificationManager = PlayerNotificationManager.Builder(reactContext, NOTIFICATION_ID, CHANNEL_ID)
                .setMediaDescriptionAdapter(object : PlayerNotificationManager.MediaDescriptionAdapter {
                    override fun getCurrentContentTitle(player: Player) = currentTitle
                    override fun createCurrentContentIntent(player: Player): PendingIntent? = null
                    override fun getCurrentContentText(player: Player) = currentArtist
                    override fun getCurrentSubText(player: Player) = currentAlbum
                    override fun getCurrentLargeIcon(player: Player, callback: PlayerNotificationManager.BitmapCallback): Bitmap? = null
                })
                .build()
        }
        playerNotificationManager?.setPlayer(exoPlayer)
    }

    companion object {
        const val NAME = "AudioModule"
        private const val TAG = "AudioModule"
        private const val CHANNEL_ID = "audio_player_channel"
        private const val NOTIFICATION_ID = 1001
    }
}