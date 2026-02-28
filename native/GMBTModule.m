#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(GMBTModule, NSObject)

RCT_EXTERN_METHOD(newWordSeed:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getAddresses:(NSString *)seed
                  num:(nonnull NSNumber *)num
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(prepareTransaction:(NSString *)inputsBody
                  outputsBody:(NSString *)outputsBody
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end