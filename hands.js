// ==========================
// MEDIAPIPE HANDS
// ==========================
const hands = new Hands({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
});
hands.setOptions({
    maxNumHands: HANDS_MAX_NUM_HANDS,
    modelComplexity: HANDS_MODEL_COMPLEXITY,
    minDetectionConfidence: HANDS_MIN_DETECTION_CONFIDENCE,
    minTrackingConfidence: HANDS_MIN_TRACKING_CONFIDENCE
});
hands.onResults(onResults);