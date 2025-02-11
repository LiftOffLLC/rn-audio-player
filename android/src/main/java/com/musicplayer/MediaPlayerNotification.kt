package com.musicplayer

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.annotation.OptIn
import androidx.annotation.RequiresApi
import androidx.core.app.NotificationCompat
import androidx.media3.session.MediaNotification
import androidx.media3.session.MediaSession
import androidx.media3.session.CommandButton
import androidx.media3.common.util.UnstableApi
import com.google.common.collect.ImmutableList

@UnstableApi
class CustomMediaNotificationProvider(
    private val context: Context,
    private val mediaSession: MediaSession
) : MediaNotification.Provider {

    companion object {
        const val ACTION_PLAY_PAUSE = "com.musicplayer.ACTION_PLAY_PAUSE"
        const val ACTION_NEXT = "com.musicplayer.ACTION_NEXT"
        const val ACTION_PREVIOUS = "com.musicplayer.ACTION_PREVIOUS"
        const val NOTIFICATION_ID = 1
        const val CHANNEL_ID = "media_playback_channel"
    }

    // Implementing the required handleCustomCommand method
    override fun handleCustomCommand(
        mediaSession: MediaSession,
        customCommand: String,
        extras: Bundle
    ): Boolean {
        val player = mediaSession.player
        when (customCommand) {
            ACTION_PLAY_PAUSE -> {
                if (player.isPlaying) {
                    player.pause() // Pause the player
                } else {
                    player.play() // Resume playback
                }
                return true
            }
            ACTION_NEXT -> {
                mediaSession.skipToNextMediaItem() // Skip to next
                return true
            }
            ACTION_PREVIOUS -> {
                mediaSession.skipToPreviousMediaItem() // Skip to previous
                return true
            }
            else -> return false
        }
    }

    @OptIn(UnstableApi::class)
    @RequiresApi(Build.VERSION_CODES.O)
    override fun createNotification(
        mediaSession: MediaSession,
        mediaButtonPreferences: ImmutableList<CommandButton>,
        actionFactory: MediaNotification.ActionFactory,
        onNotificationChangedCallback: MediaNotification.Provider.Callback
    ): MediaNotification {
        createNotificationChannel()

        val title = "Song Title" // Dynamically set
        val artist = "Artist Name" // Dynamically set
        val album = "Album Name" // Dynamically set

        val playPauseIntent = PendingIntent.getBroadcast(
            context,
            0,
            Intent(ACTION_PLAY_PAUSE),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val skipNextIntent = PendingIntent.getBroadcast(
            context,
            1,
            Intent(ACTION_NEXT),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val skipPrevIntent = PendingIntent.getBroadcast(
            context,
            2,
            Intent(ACTION_PREVIOUS),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notification = NotificationCompat.Builder(context, CHANNEL_ID)
            .setStyle(
                androidx.media.app.NotificationCompat.MediaStyle()
                    .setMediaSession(mediaSession.sessionCompatToken)
                    .setShowActionsInCompactView(0, 1, 2)
            )
            .setContentTitle(title)
            .setContentText(artist)
            .setSubText(album)
            .setSmallIcon(R.drawable.ic_music_note)
            .addAction(R.drawable.ic_prev, "Previous", skipPrevIntent)
            .addAction(R.drawable.ic_play, "Play/Pause", playPauseIntent)
            .addAction(R.drawable.ic_next, "Next", skipNextIntent)
            .setOngoing(true)
            .build()

        return object : MediaNotification {
            override fun getNotificationId(): Int = NOTIFICATION_ID
            override fun getNotification(): android.app.Notification = notification
        }
    }

    @RequiresApi(Build.VERSION_CODES.O)
    private fun createNotificationChannel() {
        val channel = NotificationChannel(
            CHANNEL_ID,
            "Media Playback",
            NotificationManager.IMPORTANCE_LOW
        ).apply {
            description = "Media playback controls"
        }

        val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        manager.createNotificationChannel(channel)
    }
}
