// ==========================
// MAIN (tanpa throttle render)
// ==========================
function onResults(results) {
    const now = Date.now();

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(-1, 1);
    ctx.translate(-canvas.width, 0);

    // CAMERA
    ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

    // CINEMATIC OVERLAY
    const vignette = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 200,
        canvas.width / 2, canvas.height / 2, canvas.width
    );
    vignette.addColorStop(0, "rgba(0,0,0,0)");
    vignette.addColorStop(1, "rgba(0,0,0,0.45)");
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // GRID BACKGROUND
    ctx.strokeStyle = "rgba(0,255,255,0.03)";
    ctx.lineWidth = 1;
    const gridSize = 40;
    ctx.beginPath();
    for (let x = 0; x <= canvas.width; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
    }
    for (let y = 0; y <= canvas.height; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
    }
    ctx.stroke();

    let tanganKiri = null;
    let tanganKanan = null;

    if (results.multiHandLandmarks) {
        for (let i = 0; i < results.multiHandLandmarks.length; i++) {
            const landmarks = results.multiHandLandmarks[i];
            let handtype = results.multiHandedness[i].label;
            if (handtype === "Left") handtype = "Kanan";
            else handtype = "Kiri";

            if (handtype === "Kiri") tanganKiri = landmarks;
            else tanganKanan = landmarks;

            // HAND AURA
            ctx.shadowColor = "#00ffff";
            ctx.shadowBlur = 25;
            drawConnectors(ctx, landmarks, HAND_CONNECTIONS, {
                color: "rgba(0,255,255,0.85)",
                lineWidth: 2
            });
            ctx.shadowBlur = 0;
            drawLandmarks(ctx, landmarks, {
                color: "#ffffff",
                lineWidth: 1
            });
        }

        if (tanganKiri && tanganKanan) {
            drawInteractionOverlay(now, tanganKiri, tanganKanan);
        }
    }
    ctx.restore();
}