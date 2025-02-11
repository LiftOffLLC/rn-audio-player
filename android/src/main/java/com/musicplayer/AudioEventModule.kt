package com.musicplayer

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule

class AudioEventModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    companion object {
        private var shared: AudioEventModule? = null

        fun sharedInstance(reactContext: ReactApplicationContext): AudioEventModule {
            if (shared == null) {
                shared = AudioEventModule(reactContext)
            }
            return shared!!
        }
    }

    // MARK: - ReactContextBaseJavaModule Overrides
    override fun getName(): String {
        return "AudioEventModule" // This is how the module will be accessed in JS
    }

    // MARK: - Event Dispatch Methods
    fun emitStateChange(state: String, message: String? = null) {
        val event = Arguments.createMap()
        event.putString("state", state)
        message?.let { event.putString("message", it) }

        println("Sending state change event")
        reactApplicationContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit("onAudioStateChange", event)
    }

    fun emitProgressUpdate(progress: Double, currentTime: Double, totalDuration: Double) {
        val event = Arguments.createMap()
        event.putDouble("progress", progress)
        event.putDouble("currentTime", currentTime)
        event.putDouble("totalDuration", totalDuration)

        println("Sending progress event")
        reactApplicationContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit("onAudioProgress", event)
    }
}