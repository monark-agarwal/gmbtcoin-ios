package com.monarkagarwal.gmbtcoinwallet

import com.facebook.react.*
import com.facebook.react.bridge.*
import com.facebook.react.uimanager.ViewManager

class GMBTPackage : ReactPackage {

    override fun createNativeModules(
        reactContext: ReactApplicationContext
    ): List<NativeModule> {
        return listOf(GMBTModule(reactContext))
    }

    override fun createViewManagers(
        reactContext: ReactApplicationContext
    ): List<ViewManager<*, *>> {
        return emptyList()
    }
}
