package com.musicplayer

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager
import com.facebook.react.BaseReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider
import java.util.HashMap

class AudioModulePackage : BaseReactPackage() {

    override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? {
        return if (name == AudioModule.NAME) {
            AudioModule(reactContext)
        } else {
          null
        }
    }

    override fun getReactModuleInfoProvider(): ReactModuleInfoProvider {
        return ReactModuleInfoProvider {
            val moduleInfos: MutableMap<String, ReactModuleInfo> = HashMap()
            moduleInfos[AudioModule.NAME] = ReactModuleInfo(
                AudioModule.NAME,
                AudioModule.NAME,
            false,  // canOverrideExistingModule
            false,  // needsEagerInit
            false,  // isCxxModule
            true // isTurboModule
            )
            moduleInfos
        }
    }
}
