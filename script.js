// ==========================
// ELEMENT
// ==========================

const video = document.querySelector(".input_video");
const canvas = document.querySelector(".output_canvas");
const ctx = canvas.getContext("2d");


// ==========================
// CANVAS SIZE
// ==========================

function resizeCanvas(){

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();

window.addEventListener("resize", resizeCanvas);


// ==========================
// ROTATE POINT
// ==========================

function rotatePoint(x, y, angle){

    return {

        x: x * Math.cos(angle) - y * Math.sin(angle),

        y: x * Math.sin(angle) + y * Math.cos(angle)
    };
}


// ==========================
// DRAW CORNER BOX
// ==========================

function drawCornerBox(points, color, glow = 20){

    const corner = 35;

    ctx.shadowColor = color;
    ctx.shadowBlur = glow;

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;

    for(let i = 0; i < 4; i++){

        const p1 = points[i];
        const p2 = points[(i + 1) % 4];
        const p0 = points[(i + 3) % 4];

        // arah ke next
        const dx1 = p2.x - p1.x;
        const dy1 = p2.y - p1.y;

        const len1 = Math.sqrt(dx1*dx1 + dy1*dy1);

        // arah ke prev
        const dx0 = p0.x - p1.x;
        const dy0 = p0.y - p1.y;

        const len0 = Math.sqrt(dx0*dx0 + dy0*dy0);

        // garis 1
        ctx.beginPath();

        ctx.moveTo(p1.x, p1.y);

        ctx.lineTo(

            p1.x + (dx1 / len1) * corner,

            p1.y + (dy1 / len1) * corner
        );

        ctx.stroke();

        // garis 2
        ctx.beginPath();

        ctx.moveTo(p1.x, p1.y);

        ctx.lineTo(

            p1.x + (dx0 / len0) * corner,

            p1.y + (dy0 / len0) * corner
        );

        ctx.stroke();
    }

    ctx.shadowBlur = 0;
}


// ==========================
// MAIN
// ==========================

function onResults(results){

    // ==========================
    // CLEAR
    // ==========================

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();

    // mirror camera
    ctx.scale(-1, 1);
    ctx.translate(-canvas.width, 0);


    // ==========================
    // CAMERA
    // ==========================

    ctx.drawImage(
        results.image,
        0,
        0,
        canvas.width,
        canvas.height
    );


    // ==========================
    // CINEMATIC OVERLAY
    // ==========================

    const vignette =
        ctx.createRadialGradient(

            canvas.width / 2,
            canvas.height / 2,
            200,

            canvas.width / 2,
            canvas.height / 2,
            canvas.width
        );

    vignette.addColorStop(
        0,
        "rgba(0,0,0,0)"
    );

    vignette.addColorStop(
        1,
        "rgba(0,0,0,0.45)"
    );

    ctx.fillStyle = vignette;

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    // ==========================
    // GRID BACKGROUND
    // ==========================

    ctx.strokeStyle =
        "rgba(0,255,255,0.03)";

    ctx.lineWidth = 1;

    const gridSize = 40;

    for(let x = 0; x < canvas.width; x += gridSize){

        ctx.beginPath();

        ctx.moveTo(x, 0);

        ctx.lineTo(x, canvas.height);

        ctx.stroke();
    }

    for(let y = 0; y < canvas.height; y += gridSize){

        ctx.beginPath();

        ctx.moveTo(0, y);

        ctx.lineTo(canvas.width, y);

        ctx.stroke();
    }


    let tanganKiri = null;
    let tanganKanan = null;


    // ==========================
    // HAND DETECTION
    // ==========================

    if(results.multiHandLandmarks){

        for(let i = 0; i < results.multiHandLandmarks.length; i++){

            const landmarks =
                results.multiHandLandmarks[i];

            let handtype =
                results.multiHandedness[i].label;

            if(handtype === "Left"){

                handtype = "Kanan";

            }else{

                handtype = "Kiri";
            }


            if(handtype === "Kiri"){

                tanganKiri = landmarks;

            }else{

                tanganKanan = landmarks;
            }


            // ==========================
            // HAND AURA
            // ==========================

            ctx.shadowColor = "#00ffff";
            ctx.shadowBlur = 25;

            drawConnectors(
                ctx,
                landmarks,
                HAND_CONNECTIONS,
                {
                    color: "rgba(0,255,255,0.85)",
                    lineWidth: 2
                }
            );

            ctx.shadowBlur = 0;


            drawLandmarks(
                ctx,
                landmarks,
                {
                    color: "#ffffff",
                    lineWidth: 1
                }
            );
        }


        // ==========================
        // BOTH HANDS
        // ==========================

        if(tanganKiri && tanganKanan){

            const kiriJempol =
                tanganKiri[4];

            const kiriTelunjuk =
                tanganKiri[8];

            const kananJempol =
                tanganKanan[4];

            const kananTelunjuk =
                tanganKanan[8];


            // ==========================
            // CENTER
            // ==========================

            const centerX =

                ((kiriJempol.x + kiriTelunjuk.x) / 2)

                * canvas.width;

            const centerY =

                ((kiriJempol.y + kiriTelunjuk.y) / 2)

                * canvas.height;


            // ==========================
            // ANGLE
            // ==========================

            const angle = Math.atan2(

                kiriTelunjuk.y - kiriJempol.y,

                kiriTelunjuk.x - kiriJempol.x
            );


            // ==========================
            // SIZE
            // ==========================

            const jarak = Math.sqrt(

                Math.pow(
                    kananJempol.x - kananTelunjuk.x,
                    2
                ) +

                Math.pow(
                    kananJempol.y - kananTelunjuk.y,
                    2
                )
            );


            const pulse =
                Math.sin(Date.now() * 0.004) * 20;

            const boxSize =
                Math.max(160, jarak * 2400)
                + pulse;

            const half = boxSize / 2;

            // ==========================
            // DETEKSI KEPAL
            // ==========================

            const rightPalm = tanganKanan[0];

            const rightIndex = tanganKanan[8];
            const rightMiddle = tanganKanan[12];
            const rightRing = tanganKanan[16];
            const rightPinky = tanganKanan[20];


            // hitung jarak ujung jari ke telapak
            const dIndex = Math.hypot(
                rightIndex.x - rightPalm.x,
                rightIndex.y - rightPalm.y
            );

            const dMiddle = Math.hypot(
                rightMiddle.x - rightPalm.x,
                rightMiddle.y - rightPalm.y
            );

            const dRing = Math.hypot(
                rightRing.x - rightPalm.x,
                rightRing.y - rightPalm.y
            );

            const dPinky = Math.hypot(
                rightPinky.x - rightPalm.x,
                rightPinky.y - rightPalm.y
            );


            // jika semua dekat = mengepal
            const isFist =

                dIndex < 0.18 &&
                dMiddle < 0.18 &&
                dRing < 0.18 &&
                dPinky < 0.18;


            // ==========================
            // LOADING UI DI TANGAN KANAN
            // ==========================

            const loadingX =
                kananJempol.x * canvas.width;

            const loadingY =
                kananJempol.y * canvas.height;


            ctx.save();

            ctx.translate(loadingX, loadingY);


            // outer ring
            ctx.beginPath();

            ctx.arc(
                0,
                0,
                45,
                0,
                Math.PI * 2
            );

            ctx.strokeStyle =
                "rgba(255,255,255,0.15)";

            ctx.lineWidth = 5;

            ctx.stroke();


            // animated loading arc
            ctx.beginPath();

            ctx.arc(
                0,
                0,
                45,

                Date.now() * 0.002,

                Date.now() * 0.002 + Math.PI * 1.5
            );

            ctx.strokeStyle = "#00ffff";

            ctx.shadowColor = "cyan";
            ctx.shadowBlur = 25;

            ctx.lineWidth = 5;

            ctx.stroke();


            // loading text
            ctx.shadowBlur = 0;

            ctx.fillStyle =
                "rgba(255,255,255,0.8)";

            ctx.font = "12px monospace";

            ctx.fillText(
                "SCANNING",
                -35,
                70
            );

            ctx.restore();


            // ==========================
            // JIKA MENGEPAL
            // BOX BERUBAH SEGITIGA
            // ==========================

            if(isFist){

                const triangleSize =
                    boxSize * 0.7;

                const triHalf =
                    triangleSize / 2;


                let trianglePoints = [

                    { x: 0, y: -triHalf },

                    { x: triHalf, y: triHalf },

                    { x: -triHalf, y: triHalf }
                ];


                // rotate + translate
                trianglePoints =
                    trianglePoints.map(p => {

                        const r =
                            rotatePoint(
                                p.x,
                                p.y,
                                angle
                            );

                        return {

                            x: r.x + centerX,

                            y: r.y + centerY
                        };
                    });


                // hologram glow
                ctx.beginPath();

                ctx.moveTo(
                    trianglePoints[0].x,
                    trianglePoints[0].y
                );

                ctx.lineTo(
                    trianglePoints[1].x,
                    trianglePoints[1].y
                );

                ctx.lineTo(
                    trianglePoints[2].x,
                    trianglePoints[2].y
                );

                ctx.closePath();


                const triGradient =
                    ctx.createLinearGradient(

                        trianglePoints[0].x,
                        trianglePoints[0].y,

                        trianglePoints[1].x,
                        trianglePoints[1].y
                    );

                triGradient.addColorStop(
                    0,
                    "#00ffff"
                );

                triGradient.addColorStop(
                    1,
                    "#0044ff"
                );

                ctx.strokeStyle =
                    triGradient;

                ctx.lineWidth = 4;

                ctx.shadowColor = "cyan";
                ctx.shadowBlur = 35;

                ctx.stroke();


                // inner glow
                ctx.fillStyle =
                    "rgba(0,255,255,0.08)";

                ctx.fill();


                // rotating energy ring
                ctx.beginPath();

                ctx.arc(
                    centerX,
                    centerY,

                    triangleSize,

                    Date.now() * 0.001,

                    Date.now() * 0.001 + Math.PI
                );

                ctx.strokeStyle =
                    "rgba(0,255,255,0.4)";

                ctx.lineWidth = 2;

                ctx.stroke();


                // center core
                ctx.beginPath();

                ctx.arc(
                    centerX,
                    centerY,
                    8,
                    0,
                    Math.PI * 2
                );

                ctx.fillStyle = "white";

                ctx.shadowBlur = 30;

                ctx.fill();


            }else{

                // ==========================
            // FRONT BOX POINTS
            // ==========================

            let frontPoints = [

                { x: -half, y: -half },
                { x:  half, y: -half },
                { x:  half, y:  half },
                { x: -half, y:  half }
            ];

            frontPoints = frontPoints.map(p => {

                const r =
                    rotatePoint(
                        p.x,
                        p.y,
                        angle
                    );

                return {

                    x: r.x + centerX,

                    y: r.y + centerY
                };
            });


            // ==========================
            // BACK BOX
            // ==========================

            const depth =
                45 +
                Math.sin(Date.now() * 0.003) * 15;

            const backPoints =
                frontPoints.map(p => {

                    return {

                        x: p.x + depth,

                        y: p.y - depth
                    };
                });


            // ==========================
            // OUTER ENERGY RING
            // ==========================

            ctx.beginPath();

            ctx.arc(
                centerX,
                centerY,
                half + 40 +
                Math.sin(Date.now()*0.003)*10,
                0,
                Math.PI * 2
            );

            ctx.strokeStyle =
                "rgba(0,255,255,0.15)";

            ctx.lineWidth = 2;

            ctx.shadowColor = "cyan";
            ctx.shadowBlur = 40;

            ctx.stroke();


            // ==========================
            // GLASS PANEL
            // ==========================

            ctx.save();

            ctx.translate(centerX, centerY);

            ctx.rotate(angle);

            const glass =
                ctx.createLinearGradient(

                    -half,
                    -half,

                    half,
                    half
                );

            glass.addColorStop(
                0,
                "rgba(0,255,255,0.10)"
            );

            glass.addColorStop(
                0.5,
                "rgba(255,255,255,0.02)"
            );

            glass.addColorStop(
                1,
                "rgba(0,100,255,0.05)"
            );

            ctx.fillStyle = glass;

            ctx.fillRect(

                -half,
                -half,

                boxSize,
                boxSize
            );


            // ==========================
            // SCANLINE
            // ==========================

            const scan =
                (Date.now() * 0.35) % boxSize;

            ctx.beginPath();

            ctx.moveTo(
                -half,
                -half + scan
            );

            ctx.lineTo(
                half,
                -half + scan
            );

            ctx.strokeStyle =
                "rgba(0,255,255,0.9)";

            ctx.lineWidth = 3;

            ctx.shadowBlur = 30;

            ctx.stroke();


            // ==========================
            // MINI SCANLINES
            // ==========================

            ctx.strokeStyle =
                "rgba(255,255,255,0.03)";

            ctx.lineWidth = 1;

            for(let y = -half; y < half; y += 12){

                ctx.beginPath();

                ctx.moveTo(-half, y);

                ctx.lineTo(half, y);

                ctx.stroke();
            }

            ctx.restore();


            // ==========================
            // FRONT BOX
            // ==========================

            ctx.beginPath();

            ctx.moveTo(
                frontPoints[0].x,
                frontPoints[0].y
            );

            for(let i = 1; i < 4; i++){

                ctx.lineTo(
                    frontPoints[i].x,
                    frontPoints[i].y
                );
            }

            ctx.closePath();

            const frontGradient =
                ctx.createLinearGradient(

                    frontPoints[0].x,
                    frontPoints[0].y,

                    frontPoints[2].x,
                    frontPoints[2].y
                );

            frontGradient.addColorStop(
                0,
                "#00ffff"
            );

            frontGradient.addColorStop(
                0.5,
                "#ffffff"
            );

            frontGradient.addColorStop(
                1,
                "#0055ff"
            );

            ctx.strokeStyle =
                frontGradient;

            ctx.lineWidth = 3;

            ctx.shadowBlur = 40;

            ctx.stroke();


            // ==========================
            // BACK BOX
            // ==========================

            ctx.beginPath();

            ctx.moveTo(
                backPoints[0].x,
                backPoints[0].y
            );

            for(let i = 1; i < 4; i++){

                ctx.lineTo(
                    backPoints[i].x,
                    backPoints[i].y
                );
            }

            ctx.closePath();

            ctx.strokeStyle =
                "rgba(255,255,255,0.25)";

            ctx.lineWidth = 1;

            ctx.shadowBlur = 10;

            ctx.stroke();


            // ==========================
            // CONNECTOR LINES
            // ==========================

            ctx.beginPath();

            for(let i = 0; i < 4; i++){

                ctx.moveTo(
                    frontPoints[i].x,
                    frontPoints[i].y
                );

                ctx.lineTo(
                    backPoints[i].x,
                    backPoints[i].y
                );
            }

            ctx.strokeStyle =
                "rgba(0,255,255,0.4)";

            ctx.lineWidth = 1.5;

            ctx.stroke();


            // ==========================
            // ENERGY PARTICLES
            // ==========================

            for(let i = 0; i < 12; i++){

                const t =
                    Date.now() * 0.001 +
                    i * 0.5;

                const px =
                    centerX +
                    Math.cos(t) * (half + 60);

                const py =
                    centerY +
                    Math.sin(t) * (half + 60);

                ctx.beginPath();

                ctx.arc(
                    px,
                    py,
                    2 +
                    Math.sin(t * 3) * 2,
                    0,
                    Math.PI * 2
                );

                ctx.fillStyle =
                    "rgba(0,255,255,0.8)";

                ctx.shadowBlur = 20;

                ctx.fill();
            }


            // ==========================
            // CONTROL LINE
            // ==========================

            ctx.beginPath();

            ctx.moveTo(
                kananJempol.x * canvas.width,
                kananJempol.y * canvas.height
            );

            ctx.lineTo(
                kananTelunjuk.x * canvas.width,
                kananTelunjuk.y * canvas.height
            );

            const controlGradient =
                ctx.createLinearGradient(

                    kananJempol.x * canvas.width,
                    kananJempol.y * canvas.height,

                    kananTelunjuk.x * canvas.width,
                    kananTelunjuk.y * canvas.height
                );

            controlGradient.addColorStop(
                0,
                "#ffcc00"
            );

            controlGradient.addColorStop(
                1,
                "#ff6600"
            );

            ctx.strokeStyle =
                controlGradient;

            ctx.lineWidth = 5;

            ctx.shadowColor = "orange";
            ctx.shadowBlur = 30;

            ctx.stroke();


            // ==========================
            // CONTROL ORBS
            // ==========================

            [kananJempol, kananTelunjuk].forEach(p => {

                const x =
                    p.x * canvas.width;

                const y =
                    p.y * canvas.height;


                // outer
                ctx.beginPath();

                ctx.arc(
                    x,
                    y,
                    22,
                    0,
                    Math.PI * 2
                );

                const orbGradient =
                    ctx.createRadialGradient(

                        x,
                        y,
                        2,

                        x,
                        y,
                        22
                    );

                orbGradient.addColorStop(
                    0,
                    "rgba(255,255,255,1)"
                );

                orbGradient.addColorStop(
                    1,
                    "rgba(255,140,0,0)"
                );

                ctx.fillStyle =
                    orbGradient;

                ctx.fill();
            });


            // ==========================
            // HUD TEXT
            // ==========================

            ctx.shadowBlur = 0;

            ctx.font =
                "14px monospace";

            ctx.fillStyle =
                "rgba(0,255,255,0.7)";

            ctx.fillText(

                "NEURAL INTERFACE",

                centerX - 70,

                centerY - half - 40
            );

            ctx.fillText(

                `ENERGY ${Math.floor(boxSize)}`,

                centerX - 60,

                centerY + half + 45
            );


            // ==========================
            // CORNER DOTS
            // ==========================

            frontPoints.forEach(p => {

                ctx.beginPath();

                ctx.arc(
                    p.x,
                    p.y,
                    4,
                    0,
                    Math.PI * 2
                );

                ctx.fillStyle = "#ffffff";

                ctx.shadowColor = "cyan";
                ctx.shadowBlur = 25;

                ctx.fill();
            });
        }
    }
            }
            

    ctx.restore();
}


// ==========================
// MEDIAPIPE
// ==========================

const hands = new Hands({

    locateFile: (file) => {

        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
    }
});


// ==========================
// OPTIONS
// ==========================

hands.setOptions({

    maxNumHands: 2,

    modelComplexity: 1,

    minDetectionConfidence: 0.5,

    minTrackingConfidence: 0.5
});


// ==========================
// RESULTS
// ==========================

hands.onResults(onResults);


// ==========================
// CAMERA
// ==========================

const camera = new Camera(video, {

    onFrame: async () => {

        await hands.send({
            image: video
        });
    },

    width: 1280,
    height: 720
});


// ==========================
// START
// ==========================

camera.start();