import Foundation
import Mobile
import React

@objc(GMBTModule)
class GMBTModule: NSObject {

  // MARK: - Generate New Mnemonic Seed
  @objc
  func newWordSeed(_ resolve: @escaping RCTPromiseResolveBlock,
                   rejecter reject: @escaping RCTPromiseRejectBlock) {
    do {
      let seed = try MobileNewWordSeed()
      resolve(seed)
    } catch {
      reject("SEED_ERROR", "Failed to generate seed", error)
    }
  }

  // MARK: - Generate Addresses
  @objc
  func getAddresses(_ seed: String,
                    num: NSNumber,
                    resolver resolve: @escaping RCTPromiseResolveBlock,
                    rejecter reject: @escaping RCTPromiseRejectBlock) {
    do {
      let result = try MobileGetAddresses(seed, num.intValue)
      resolve(result)
    } catch {
      reject("ADDRESS_ERROR", "Failed to generate addresses", error)
    }
  }

  // MARK: - Prepare Transaction
  @objc
  func prepareTransaction(_ inputsBody: String,
                          outputsBody: String,
                          resolver resolve: @escaping RCTPromiseResolveBlock,
                          rejecter reject: @escaping RCTPromiseRejectBlock) {
    do {
      let tx = MobilePrepareTransaction(inputsBody, outputsBody)
      resolve(tx)
    } catch {
      reject("TX_ERROR", "Failed to prepare transaction", error)
    }
  }

  @objc
  static func requiresMainQueueSetup() -> Bool {
    return false
  }
}