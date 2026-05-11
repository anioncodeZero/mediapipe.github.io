// ==========================
// INTERACTION OVERLAY
// ==========================
function drawInteractionOverlay(now, tanganKiri, tanganKanan) {
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

    // DETEKSI TANGAN KIRI JARI TELUNJUK DAN JARI JEMPOL MENDEKAT
    const centerxkiri = ((kiriJempol.x + kiriTelunjuk.x) / 2) * canvas.width;
    const centerykiri = ((kiriJempol.y + kiriTelunjuk.y) / 2) * canvas.height;
    const jarakkiri = Math.sqrt(
        Math.pow(kiriJempol.x - kiriTelunjuk.x, 2) +
        Math.pow(kiriJempol.y - kiriTelunjuk.y, 2)
    );
    const isFist = jarakkiri < 0.5; // threshold untuk deteksi kepalan

    console.log(`Jarak kiri: ${jarakkiri.toFixed(4)} - Mode: ${isFist ? "FIST" : "OPEN HAND"}`);
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

    if (jarakkiri < 0.1) {
        drawTriangleMode(now, centerX, centerY, angle, boxSize, half);
    } else {
        drawFrontBoxMode(now, centerX, centerY, angle, half);
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
    console.log(`Jarak kanan: ${jarak.toFixed(4)}`);
    console.log(`Jarak kiri: ${jarakkiri.toFixed(4)}`);

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

// ==========================
// TRIANGLE MODE (fist)
// ==========================
function drawTriangleMode(now, centerX, centerY, angle, boxSize, half) {
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
    ctx.arc(centerX, centerY, half + 40 + Math.sin(now * 0.003) * 10, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(0,255,255,0.15)";
    ctx.lineWidth = 2;
    ctx.shadowColor = "cyan";
    ctx.shadowBlur = 40;
    ctx.stroke();

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
    ctx.shadowBlur = 20;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.shadowBlur = 30;
    ctx.fill();

    
}

// ==========================
// FRONT BOX MODE (open hand)
// ==========================
function drawFrontBoxMode(now, centerX, centerY, angle, half) {
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

    // Glass panel & scanline
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(angle);
    const glass = ctx.createLinearGradient(-half, -half, half, half);
    glass.addColorStop(0, "rgba(0,255,255,0.10)");
    glass.addColorStop(0.5, "rgba(255,255,255,0.02)");
    glass.addColorStop(1, "rgba(0,100,255,0.05)");
    ctx.fillStyle = glass;
    ctx.fillRect(-half, -half, half * 2, half * 2);
    const scan = (now * 0.35) % (half * 2);
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

    // Energy particles
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

    // Corner dots
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