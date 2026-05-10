// ==========================
// ELEMENT
// ==========================
const video = document.querySelector(".input_video");
const canvas = document.querySelector(".output_canvas");
const ctx = canvas.getContext("2d");

// ==========================
// CANVAS SIZE
// ==========================
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// ==========================
// ROTATE POINT
// ==========================
function rotatePoint(x, y, angle) {
    return {
        x: x * Math.cos(angle) - y * Math.sin(angle),
        y: x * Math.sin(angle) + y * Math.cos(angle)
    };
}

// ==========================
// MAIN (ringan & gabung path)
// ==========================
function onResults(results) {
    const now = Date.now(); // hanya satu kali per frame

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

    // GRID BACKGROUND - semua garis dalam satu path
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
            const kiriJempol = tanganKiri[4];
            const kiriTelunjuk = tanganKiri[8];
            const kananJempol = tanganKanan[4];
            const kananTelunjuk = tanganKanan[8];

            const centerX = ((kiriJempol.x + kiriTelunjuk.x) / 2) * canvas.width;
            const centerY = ((kiriJempol.y + kiriTelunjuk.y) / 2) * canvas.height;
            const angle = Math.atan2(
                kiriTelunjuk.y - kiriJempol.y,
                kiriTelunjuk.x - kiriJempol.x
            );

            const jarak = Math.sqrt(
                Math.pow(kananJempol.x - kananTelunjuk.x, 2) +
                Math.pow(kananJempol.y - kananTelunjuk.y, 2)
            );
            const pulse = Math.sin(now * 0.004) * 20;
            const boxSize = Math.max(160, jarak * 2400) + pulse;
            const half = boxSize / 2;

            // DETEKSI KEPAL
            const rightPalm = tanganKanan[0];
            const dIndex = Math.hypot(tanganKanan[8].x - rightPalm.x, tanganKanan[8].y - rightPalm.y);
            const dMiddle = Math.hypot(tanganKanan[12].x - rightPalm.x, tanganKanan[12].y - rightPalm.y);
            const dRing = Math.hypot(tanganKanan[16].x - rightPalm.x, tanganKanan[16].y - rightPalm.y);
            const dPinky = Math.hypot(tanganKanan[20].x - rightPalm.x, tanganKanan[20].y - rightPalm.y);
            const isFist = dIndex < 0.18 && dMiddle < 0.18 && dRing < 0.18 && dPinky < 0.18;

            // LOADING UI
            const loadingX = kananJempol.x * canvas.width;
            const loadingY = kananJempol.y * canvas.height;
            ctx.save();
            ctx.translate(loadingX, loadingY);
            ctx.beginPath();
            ctx.arc(0, 0, 45, 0, Math.PI * 2);
            ctx.strokeStyle = "rgba(255,255,255,0.15)";
            ctx.lineWidth = 5;
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(0, 0, 45, now * 0.002, now * 0.002 + Math.PI * 1.5);
            ctx.strokeStyle = "#00ffff";
            ctx.shadowColor = "cyan";
            ctx.shadowBlur = 25;
            ctx.lineWidth = 5;
            ctx.stroke();
            ctx.shadowBlur = 0;
            ctx.fillStyle = "rgba(255,255,255,0.8)";
            ctx.font = "12px monospace";
            ctx.fillText("SCANNING", -35, 70);
            ctx.restore();

            if (isFist) {
                // SEGITIGA
                const ts = boxSize * 0.7;
                const th = ts / 2;
                let pts = [
                    { x: 0, y: -th },
                    { x: th, y: th },
                    { x: -th, y: th }
                ];
                pts = pts.map(p => {
                    const r = rotatePoint(p.x, p.y, angle);
                    return { x: r.x + centerX, y: r.y + centerY };
                });
                ctx.beginPath();
                ctx.moveTo(pts[0].x, pts[0].y);
                ctx.lineTo(pts[1].x, pts[1].y);
                ctx.lineTo(pts[2].x, pts[2].y);
                ctx.closePath();
                const tg = ctx.createLinearGradient(pts[0].x, pts[0].y, pts[1].x, pts[1].y);
                tg.addColorStop(0, "#00ffff");
                tg.addColorStop(1, "#0044ff");
                ctx.strokeStyle = tg;
                ctx.lineWidth = 4;
                ctx.shadowColor = "cyan";
                ctx.shadowBlur = 35;
                ctx.stroke();
                ctx.fillStyle = "rgba(0,255,255,0.08)";
                ctx.fill();
                ctx.beginPath();
                ctx.arc(centerX, centerY, ts, now * 0.001, now * 0.001 + Math.PI);
                ctx.strokeStyle = "rgba(0,255,255,0.4)";
                ctx.lineWidth = 2;
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
                ctx.fillStyle = "white";
                ctx.shadowBlur = 30;
                ctx.fill();
            } else {
                // FRONT BOX
                let front = [
                    { x: -half, y: -half },
                    { x: half, y: -half },
                    { x: half, y: half },
                    { x: -half, y: half }
                ];
                front = front.map(p => {
                    const r = rotatePoint(p.x, p.y, angle);
                    return { x: r.x + centerX, y: r.y + centerY };
                });
                const depth = 45 + Math.sin(now * 0.003) * 15;
                const back = front.map(p => ({ x: p.x + depth, y: p.y - depth }));

                // Outer ring
                ctx.beginPath();
                ctx.arc(centerX, centerY, half + 40 + Math.sin(now * 0.003) * 10, 0, Math.PI * 2);
                ctx.strokeStyle = "rgba(0,255,255,0.15)";
                ctx.lineWidth = 2;
                ctx.shadowColor = "cyan";
                ctx.shadowBlur = 40;
                ctx.stroke();

                // Glass panel & scanline (gabung)
                ctx.save();
                ctx.translate(centerX, centerY);
                ctx.rotate(angle);
                const glass = ctx.createLinearGradient(-half, -half, half, half);
                glass.addColorStop(0, "rgba(0,255,255,0.10)");
                glass.addColorStop(0.5, "rgba(255,255,255,0.02)");
                glass.addColorStop(1, "rgba(0,100,255,0.05)");
                ctx.fillStyle = glass;
                ctx.fillRect(-half, -half, boxSize, boxSize);
                const scan = (now * 0.35) % boxSize;
                ctx.beginPath();
                ctx.moveTo(-half, -half + scan);
                ctx.lineTo(half, -half + scan);
                ctx.strokeStyle = "rgba(0,255,255,0.9)";
                ctx.lineWidth = 3;
                ctx.shadowBlur = 30;
                ctx.stroke();
                ctx.strokeStyle = "rgba(255,255,255,0.03)";
                ctx.lineWidth = 1;
                ctx.shadowBlur = 0;
                ctx.beginPath();
                for (let y = -half; y < half; y += 12) {
                    ctx.moveTo(-half, y);
                    ctx.lineTo(half, y);
                }
                ctx.stroke();
                ctx.restore();

                // Front box
                ctx.beginPath();
                ctx.moveTo(front[0].x, front[0].y);
                for (let i = 1; i < 4; i++) ctx.lineTo(front[i].x, front[i].y);
                ctx.closePath();
                const fg = ctx.createLinearGradient(front[0].x, front[0].y, front[2].x, front[2].y);
                fg.addColorStop(0, "#00ffff");
                fg.addColorStop(0.5, "#ffffff");
                fg.addColorStop(1, "#0055ff");
                ctx.strokeStyle = fg;
                ctx.lineWidth = 3;
                ctx.shadowBlur = 40;
                ctx.stroke();

                // Back box
                ctx.beginPath();
                ctx.moveTo(back[0].x, back[0].y);
                for (let i = 1; i < 4; i++) ctx.lineTo(back[i].x, back[i].y);
                ctx.closePath();
                ctx.strokeStyle = "rgba(255,255,255,0.25)";
                ctx.lineWidth = 1;
                ctx.shadowBlur = 10;
                ctx.stroke();

                // Connector lines
                ctx.beginPath();
                for (let i = 0; i < 4; i++) {
                    ctx.moveTo(front[i].x, front[i].y);
                    ctx.lineTo(back[i].x, back[i].y);
                }
                ctx.strokeStyle = "rgba(0,255,255,0.4)";
                ctx.lineWidth = 1.5;
                ctx.stroke();

                // Energy particles (gabung dalam satu fill)
                ctx.beginPath();
                for (let i = 0; i < 12; i++) {
                    const t = now * 0.001 + i * 0.5;
                    const px = centerX + Math.cos(t) * (half + 60);
                    const py = centerY + Math.sin(t) * (half + 60);
                    const r = 2 + Math.sin(t * 3) * 2;
                    ctx.moveTo(px + r, py);
                    ctx.arc(px, py, r, 0, Math.PI * 2);
                }
                ctx.fillStyle = "rgba(0,255,255,0.8)";
                ctx.shadowBlur = 20;
                ctx.fill();

                // Corner dots (gabung fill)
                ctx.beginPath();
                front.forEach(p => {
                    ctx.moveTo(p.x + 4, p.y);
                    ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
                });
                ctx.fillStyle = "#ffffff";
                ctx.shadowColor = "cyan";
                ctx.shadowBlur = 25;
                ctx.fill();
            }

            // CONTROL LINE
            const kx1 = kananJempol.x * canvas.width;
            const ky1 = kananJempol.y * canvas.height;
            const kx2 = kananTelunjuk.x * canvas.width;
            const ky2 = kananTelunjuk.y * canvas.height;
            ctx.beginPath();
            ctx.moveTo(kx1, ky1);
            ctx.lineTo(kx2, ky2);
            const cg = ctx.createLinearGradient(kx1, ky1, kx2, ky2);
            cg.addColorStop(0, "#ffcc00");
            cg.addColorStop(1, "#ff6600");
            ctx.strokeStyle = cg;
            ctx.lineWidth = 5;
            ctx.shadowColor = "orange";
            ctx.shadowBlur = 30;
            ctx.stroke();

            // CONTROL ORBS
            [kananJempol, kananTelunjuk].forEach(p => {
                const x = p.x * canvas.width;
                const y = p.y * canvas.height;
                ctx.beginPath();
                ctx.arc(x, y, 22, 0, Math.PI * 2);
                const og = ctx.createRadialGradient(x, y, 2, x, y, 22);
                og.addColorStop(0, "rgba(255,255,255,1)");
                og.addColorStop(1, "rgba(255,140,0,0)");
                ctx.fillStyle = og;
                ctx.fill();
            });

            // HUD TEXT
            ctx.shadowBlur = 0;
            ctx.font = "14px monospace";
            ctx.fillStyle = "rgba(0,255,255,0.7)";
            ctx.fillText("NEURAL INTERFACE", centerX - 70, centerY - half - 40);
            ctx.fillText(`ENERGY ${Math.floor(boxSize)}`, centerX - 60, centerY + half + 45);
        }
    }
    ctx.restore();
}

// ==========================
// MEDIAPIPE
// ==========================
const hands = new Hands({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
});
hands.setOptions({
    maxNumHands: 2,
    modelComplexity: 1,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
});
hands.onResults(onResults);

// ==========================
// CAMERA
// ==========================
const camera = new Camera(video, {
    onFrame: async () => {
        await hands.send({ image: video });
    },
    width: 1280,
    height: 720
});
camera.start();