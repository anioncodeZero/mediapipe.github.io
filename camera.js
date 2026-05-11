// ==========================
// CAMERA
// ==========================
let lastProcessTime = null;

const camera = new Camera(video, {
    onFrame: async () => {
        const now = Date.now();
        // Cuma kirim frame setiap FRAME_INTERVAL
        if (now - lastProcessTime < FRAME_INTERVAL) return;
        lastProcessTime = now;
        await hands.send({ image: video });
    },
    width: CAMERA_WIDTH,
    height: CAMERA_HEIGHT
});

camera.start();