import ARKit
import Foundation

@objc(ARKitEyeTracking)
class ARKitEyeTracking: RCTEventEmitter, ARSessionDelegate {

  private var session: ARSession?
  private var isTracking = false
  private var lastIsLooking: Bool?
  private var debounceWork: DispatchWorkItem?

  // MARK: - RCTEventEmitter

  override static func requiresMainQueueSetup() -> Bool { true }

  override func supportedEvents() -> [String]! {
    ["onAttentionChange"]
  }

  // MARK: - JS-exposed methods

  @objc func isSupported(
    _ resolve: @escaping RCTPromiseResolveBlock,
    reject _: RCTPromiseRejectBlock
  ) {
    resolve(ARFaceTrackingConfiguration.isSupported)
  }

  @objc func startTracking() {
    guard ARFaceTrackingConfiguration.isSupported, !isTracking else { return }
    DispatchQueue.main.async { [weak self] in
      guard let self else { return }
      let arSession = ARSession()
      arSession.delegate = self
      let config = ARFaceTrackingConfiguration()
      config.isLightEstimationEnabled = false
      arSession.run(config, options: [])
      self.session = arSession
      self.isTracking = true
    }
  }

  @objc func stopTracking() {
    debounceWork?.cancel()
    debounceWork = nil
    DispatchQueue.main.async { [weak self] in
      guard let self else { return }
      self.session?.pause()
      self.session = nil
      self.isTracking = false
      self.lastIsLooking = nil
    }
  }

  // MARK: - ARSessionDelegate

  func session(_: ARSession, didUpdate anchors: [ARAnchor]) {
    guard let face = anchors.compactMap({ $0 as? ARFaceAnchor }).first else { return }

    // Eyes open check
    let leftBlink = face.blendShapes[.eyeBlinkLeft]?.floatValue ?? 0
    let rightBlink = face.blendShapes[.eyeBlinkRight]?.floatValue ?? 0
    let eyesOpen = leftBlink < 0.6 && rightBlink < 0.6

    // Gaze toward device:
    // lookAtPoint is in world space; when looking at phone (camera ≈ origin)
    // the point is close to the origin → small magnitude.
    let gazeDistance = simd_length(face.lookAtPoint)
    let lookingAtDevice = gazeDistance < 0.45 // ~45 cm tolerance

    let isAttentive = eyesOpen && lookingAtDevice
    guard isAttentive != lastIsLooking else { return }

    // Debounce 500ms to avoid rapid flicker
    debounceWork?.cancel()
    let work = DispatchWorkItem { [weak self] in
      guard let self else { return }
      self.lastIsLooking = isAttentive
      self.sendEvent(withName: "onAttentionChange", body: ["isLooking": isAttentive])
    }
    debounceWork = work
    DispatchQueue.main.asyncAfter(deadline: .now() + 0.5, execute: work)
  }

  func session(_: ARSession, didFailWithError error: Error) {
    sendEvent(withName: "onAttentionChange", body: ["isLooking": false, "error": error.localizedDescription])
  }
}
