package com.monarkagarwal.gmbtcoinwallet
import com.facebook.react.bridge.*
import mobile.Mobile

class GMBTModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "GMBTModule"
    }

    @ReactMethod
    fun getAddresses(seed: String, num: Int, promise: Promise) {
        try {
            val result = Mobile.getAddresses(seed, num.toLong())
            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("GET_ADDRESSES_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun prepareTransaction(
        inputsBody: String,
        outputsBody: String,
        promise: Promise
    ) {
        try {
            val tx = Mobile.prepareTransaction(inputsBody, outputsBody)
            promise.resolve(tx)
        } catch (e: Exception) {
            promise.reject("PREPARE_TX_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun newWordSeed(promise: Promise) {
        try {
            val seed = Mobile.newWordSeed()
            promise.resolve(seed)
        } catch (e: Exception) {
            promise.reject("NEW_SEED_ERROR", e.message, e)
        }
    }
}