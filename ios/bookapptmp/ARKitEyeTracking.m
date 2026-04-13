#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

RCT_EXTERN_MODULE(ARKitEyeTracking, RCTEventEmitter)

RCT_EXTERN_METHOD(
  isSupported:(RCTPromiseResolveBlock)resolve
  reject:(RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(startTracking)
RCT_EXTERN_METHOD(stopTracking)
