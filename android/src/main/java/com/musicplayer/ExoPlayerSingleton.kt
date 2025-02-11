package com.musicplayer

import androidx.media3.exoplayer.ExoPlayer
import android.content.Context

object ExoPlayerSingleton {
    private var exoPlayer: ExoPlayer? = null

    fun getInstance(context: Context): ExoPlayer {
        if (exoPlayer == null) {
            exoPlayer = ExoPlayer.Builder(context.applicationContext).build()
        }
        return exoPlayer!!
    }

    fun releaseInstance() {
        exoPlayer?.release()
        exoPlayer = null
    }
}