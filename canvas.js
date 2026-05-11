// ==========================
// CANVAS SIZE
// ==========================
const video = document.querySelector(".input_video");
const canvas = document.querySelector(".output_canvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);