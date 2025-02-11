@file:UnstableApi package com.musicplayer

import android.annotation.SuppressLint
import android.app.PendingIntent
import android.content.Intent
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.util.Log
import androidx.annotation.OptIn
import androidx.annotation.RequiresApi
import androidx.media3.common.Player
import androidx.media3.common.util.UnstableApi
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.session.CommandButton
import androidx.media3.session.DefaultMediaNotificationProvider
import androidx.media3.session.MediaNotification
import androidx.media3.session.MediaSession
import androidx.media3.session.MediaSessionService
import androidx.media3.session.SessionCommand
import androidx.media3.session.SessionCommands
import androidx.media3.session.SessionResult
import com.google.common.collect.ImmutableList
import com.google.common.util.concurrent.Futures
import com.google.common.util.concurrent.ListenableFuture


class PlaybackService : MediaSessionService() {
    private var mediaSession: MediaSession? = null
    private lateinit var exoPlayer: ExoPlayer
    private val customCommandPlayPause = SessionCommand("PLAY_PAUSE", Bundle.EMPTY)
    private val customCommandNext = SessionCommand("NEXT", Bundle.EMPTY)
    private val customCommandPrevious = SessionCommand("PREVIOUS", Bundle.EMPTY)
    private val customCommandSeek = SessionCommand("SEEK", Bundle.EMPTY)
    private val notificationChannelId = "playback_channel"
    private val notificationId = 1
    private val handler = Handler(Looper.getMainLooper())

    private val playPauseButton = CommandButton.Builder()
        .setDisplayName("Play/Pause")
        .setIconResId(R.drawable.ic_play)
        .setSessionCommand(customCommandPlayPause)
        .build()

    private val nextButton = CommandButton.Builder()
        .setDisplayName("Next")
        .setIconResId(R.drawable.ic_next)
        .setSessionCommand(customCommandNext)
        .build()

    private val previousButton = CommandButton.Builder()
        .setDisplayName("Previous")
        .setIconResId(R.drawable.ic_prev)
        .setSessionCommand(customCommandPrevious)
        .build()

    @SuppressLint("UnspecifiedRegisterReceiverFlag")
    @RequiresApi(Build.VERSION_CODES.O)
    @OptIn(UnstableApi::class) override fun onCreate() {
        super.onCreate()
        exoPlayer = ExoPlayerSingleton.getInstance(applicationContext)
        Log.d("PlaybackService", exoPlayer.toString())
        val mediaNotificationProvider = DefaultMediaNotificationProvider.Builder(this)

            .build()
        // Build the session with the custom layout and control buttons
        mediaSession = MediaSession.Builder(this, exoPlayer)
            .setCallback(MyCallback())
            .setCustomLayout(ImmutableList.of(playPauseButton, nextButton, previousButton))
            .setMediaButtonPreferences(listOf(previousButton, playPauseButton, nextButton))
            .setMediaNotificationProvider(CustomMediaNotificationProvider(this, mediaSession!!))
            .setSessionActivity(
                PendingIntent.getActivity(
                    this,
                    0,
                    Intent(this, MainActivity::class.java),
                    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                )
            )
            .build()

        Log.d("PlaybackService", mediaSession.toString())
    }

    @RequiresApi(Build.VERSION_CODES.O)
    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        super.onStartCommand(intent, flags, startId)
        intent?.toString()?.let { Log.d("PlaybackService", it) }
        when (intent?.action) {
            "SHOW_NOTIFICATION" -> {
                val title = intent.getStringExtra("TITLE")
                val artist = intent.getStringExtra("ARTIST")
                val album = intent.getStringExtra("ALBUM")
                startForeground(
                    notificationId,
                    mediaPlayerNotification.createNotification(

                        title,
                        artist,
                        album
                    )
                )
                handler.post(updateNotificationRunnable)
            }

        }
        return START_STICKY
    }

    private inner class MyCallback : MediaSession.Callback {
        @OptIn(UnstableApi::class)
        override fun onConnect(
            session: MediaSession,
            controller: MediaSession.ControllerInfo
        ): MediaSession.ConnectionResult {
            return MediaSession.ConnectionResult.AcceptedResultBuilder(session)
                .setAvailablePlayerCommands(
                    Player.Commands.Builder()
                        .add(Player.COMMAND_PLAY_PAUSE)
                        .add(Player.COMMAND_SEEK_TO_NEXT)
                        .add(Player.COMMAND_SEEK_TO_PREVIOUS)
                        .add(Player.COMMAND_SEEK_TO_NEXT_MEDIA_ITEM)
                        .add(Player.COMMAND_SEEK_TO_PREVIOUS_MEDIA_ITEM)
                        .build()
                )
                .setAvailableSessionCommands(
                    SessionCommands.Builder()
                        .add(customCommandPlayPause)
                        .add(customCommandNext)
                        .add(customCommandPrevious)
                        .add(customCommandSeek)
                        .build()
                )
                .build()
        }

        override fun onCustomCommand(
            session: MediaSession,
            controller: MediaSession.ControllerInfo,
            customCommand: SessionCommand,
            args: Bundle
        ): ListenableFuture<SessionResult> {
            return when (customCommand.customAction) {
                "PLAY_PAUSE" -> {
                    if (exoPlayer.isPlaying) {
                        exoPlayer.pause()
    
                    } else {
                        exoPlayer.play()
                    }
                    Futures.immediateFuture(SessionResult(SessionResult.RESULT_SUCCESS))
                }
                "NEXT" -> {
                    exoPlayer.seekToNextMediaItem()
                    Futures.immediateFuture(SessionResult(SessionResult.RESULT_SUCCESS))
                }
                "PREVIOUS" -> {
                    exoPlayer.seekToPreviousMediaItem()
                    Futures.immediateFuture(SessionResult(SessionResult.RESULT_SUCCESS))
                }
                "SEEK" -> {
                    val seekPosition = args.getLong("SEEK_POSITION", 0)
                    exoPlayer.seekTo(seekPosition)
                    Futures.immediateFuture(SessionResult(SessionResult.RESULT_SUCCESS))
                }
                else -> super.onCustomCommand(session, controller, customCommand, args)
            }
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        ExoPlayerSingleton.releaseInstance() // Release ExoPlayer when the service is destroyed
        mediaSession?.release() // Release MediaSession
        handler.removeCallbacks(updateNotificationRunnable)
    }

    override fun onGetSession(controllerInfo: MediaSession.ControllerInfo): MediaSession? {
        return mediaSession
    }

    private val updateNotificationRunnable = object : Runnable {
        @RequiresApi(Build.VERSION_CODES.O)
        override fun run() {
            val title = exoPlayer.mediaMetadata.title?.toString()
            val artist = exoPlayer.mediaMetadata.artist?.toString()
            val album = exoPlayer.mediaMetadata.albumTitle?.toString()
            mediaPlayerNotification.createNotification(title, artist, album)
            handler.postDelayed(this, 1000) // Update every second
        }
    }
}
