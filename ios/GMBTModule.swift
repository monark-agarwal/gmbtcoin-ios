import Foundation
import Mobile
import React

@objc(GMBTModule)
class GMBTModule: NSObject {

  // MARK: - Generate New Mnemonic Seed
  @objc
  func newWordSeed(_ resolve: @escaping RCTPromiseResolveBlock,
                   rejecter reject: @escaping RCTPromiseRejectBlock) {

    var error: NSError?
    let seed = MobileNewWordSeed(&error)

    if let error = error {
      reject("SEED_ERROR", "Failed to generate seed", error)
    } else {
      resolve(seed)
    }
  }

  // MARK: - Generate Addresses
  @objc
  func getAddresses(_ seed: String,
                    num: NSNumber,
                    resolver resolve: @escaping RCTPromiseResolveBlock,
                    rejecter reject: @escaping RCTPromiseRejectBlock) {

    var error: NSError?
    let result = MobileGetAddresses(seed, num.intValue, &error)

    if let error = error {
      reject("ADDRESS_ERROR", "Failed to generate addresses", error)
    } else {
      resolve(result)
    }
  }

  // MARK: - Prepare Transaction
  @objc
  func prepareTransaction(_ inputsBody: String,
                          outputsBody: String,
                          resolver resolve: @escaping RCTPromiseResolveBlock,
                          rejecter reject: @escaping RCTPromiseRejectBlock) {

    var error: NSError?
    let tx = MobilePrepareTransaction(inputsBody, outputsBody, &error)

    if let error = error {
      reject("TX_ERROR", "Failed to prepare transaction", error)
    } else {
      resolve(tx)
    }
  }

  @objc
  static func requiresMainQueueSetup() -> Bool {
    return false
  }
}
