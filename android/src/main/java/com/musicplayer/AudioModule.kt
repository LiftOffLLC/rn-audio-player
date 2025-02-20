package com.musicplayer

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.media.AudioAttributes
import android.media.AudioManager
import android.media.MediaPlayer
import android.media.session.MediaSession
import android.media.session.MediaSessionManager
import android.os.Build
import android.util.Log
import androidx.core.app.NotificationCompat
import com.facebook.react.bridge.*
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.modules.core.DeviceEventManagerModule

@ReactModule(name = AudioModule.NAME)
class AudioModule(reactContext: ReactApplicationContext) : NativeMusicPlayerSpec(reactContext) {

    private var mediaPlayer: MediaPlayer? = null
    private var isPlaying: Boolean = false
    private var isLoaded: Boolean = false

    private var mediaSession: MediaSession? = null
    private var audioManager: AudioManager? = null

    init {
        mediaPlayer = MediaPlayer()
        audioManager = reactContext.getSystemService(Context.AUDIO_SERVICE) as AudioManager
        setupMediaSession()
        createNotificationChannel()
    }

    override fun getName(): String {
        return NAME
    }

    @ReactMethod
    fun loadAudio(url: String, promise: Promise) {
        try {
            mediaPlayer?.reset()
            mediaPlayer?.setAudioAttributes(
                AudioAttributes.Builder()
                    .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                    .setUsage(AudioAttributes.USAGE_MEDIA)
                    .build()
            )
            mediaPlayer?.setDataSource(url)
            mediaPlayer?.prepareAsync()
            mediaPlayer?.setOnPreparedListener {
                isLoaded = true
                promise.resolve(null)
                emitAudioStateChange("LOADED")
            }
            mediaPlayer?.setOnErrorListener { _, what, extra ->
                Log.e(TAG, "MediaPlayer error: what=$what, extra=$extra")
                promise.reject("LOAD_ERROR", "Failed to load audio")
                true
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error loading audio: ${e.message}")
            promise.reject("LOAD_ERROR", "Failed to load audio", e)
        }
    }

    @ReactMethod
    fun playAudio() {
        if (!isLoaded) {
            Log.e(TAG, "Audio not loaded yet")
            return
        }
        if (!isPlaying) {
            mediaPlayer?.start()
            isPlaying = true
            updateNotification("Playing")
            mediaSession?.isActive = true
            emitAudioStateChange("PLAYING")
        }
    }

    @ReactMethod
    fun pauseAudio() {
        if (isPlaying) {
            mediaPlayer?.pause()
            isPlaying = false
            updateNotification("Paused")
            emitAudioStateChange("PAUSED")
        }
    }

    @ReactMethod
    fun stopAudio() {
        if (mediaPlayer?.isPlaying == true) {
            mediaPlayer?.stop()
            isPlaying = false
            isLoaded = false
            mediaSession?.isActive = false
            emitAudioStateChange("STOPPED")
        }
    }

    private fun setupMediaSession() {
        mediaSession = MediaSession(reactApplicationContext, "AudioSession").apply {
            setCallback(object : MediaSession.Callback() {
                override fun onPlay() {
                    playAudio()
                }

                override fun onPause() {
                    pauseAudio()
                }

                override fun onStop() {
                    stopAudio()
                }
            })
            isActive = true
        }
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID, "Audio Player", NotificationManager.IMPORTANCE_LOW
            )
            val manager = reactApplicationContext.getSystemService(NotificationManager::class.java)
            manager?.createNotificationChannel(channel)
        }
    }

    private fun updateNotification(state: String) {
        val notificationManager =
            reactApplicationContext.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        val notification = NotificationCompat.Builder(reactApplicationContext, CHANNEL_ID)
            .setContentTitle("Music Player")
            .setContentText(state)
            .setSmallIcon(android.R.drawable.ic_media_play)
            .setOngoing(isPlaying)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()

        notificationManager.notify(NOTIFICATION_ID, notification)
    }

    private fun emitAudioStateChange(state: String) {
        reactApplicationContext?.let {
            it.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                ?.emit("onAudioStateChange", state)
        } ?: Log.e(TAG, "React Context is null, cannot emit event")
    }

    override fun onCatalystInstanceDestroy() {
        super.onCatalystInstanceDestroy()
        mediaPlayer?.release()
        mediaPlayer = null
        mediaSession?.release()
    }

    companion object {
        const val NAME = "AudioModule"
        private const val TAG = "AudioModule"
        private const val CHANNEL_ID = "AUDIO_PLAYER_CHANNEL"
        private const val NOTIFICATION_ID = 101
    }
}
