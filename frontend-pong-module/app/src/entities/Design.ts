/* =========================================================
   Design.ts   –   “Animated Elegance” full style module
   • 1200×800 playfield helpers
   • glass‑morphic appendix bar
   • button hover polish
   • score flip animation
   • glossy paddle / ball painters
   • global pastel gradient + grain overlay
   ========================================================= */

import { Player } from "./Player";

/* ---------- constants ---------- */
export const CANVAS_WIDTH  = 500;
export const CANVAS_HEIGHT = 500;

/* ---------- palette / fonts ---------- */
export const DESIGN = {
    fieldColor  : "#0d3f77",   // darker blue so glass stands out
    lineColor   : "#ffffff",
    accentColor : "#ff3b30",
    buttonColor : "#ffca28",
    textColor   : "#212121",
    fontFamily  : "Poppins, sans‑serif",
};

/* ---------- global page styling (gradient + grain) ---------- */
(() => {
    /* gradient */
    const styleId = "ae‑page‑style";
    if (!document.getElementById(styleId)) {
        const css = document.createElement("style");
        css.id = styleId;
        css.textContent = `
      body{
        background: radial-gradient(circle at 30% 20%, #f3f8ff 0%, #e9f0ff 45%, #dfe8ff 100%);
        min-height:100vh;
        overflow-x:hidden;
      }
    `;
        document.head.appendChild(css);
    }

    /* grain overlay (optional aesthetic depth) */
    if (!document.getElementById("ae‑grain")) {
        const grain = document.createElement("div");
        grain.id = "ae‑grain";
        Object.assign(grain.style, {
            position     : "fixed",
            inset        : "0",
            pointerEvents: "none",
            zIndex       : "1",
            backgroundImage:
                "url(\"data:image/svg+xml;base64,"
                + "PHN2ZyB3aWR0aD0nMScgaGVpZ2h0PScxJyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnPjxnIGZpbGw9JyMwMDAwMDAnIGZpbGwtb3BhY2l0eT0nLjA0Jz48cmVjdCB3aWR0aD0nMScgaGVpZ2h0PScxJy8+PC9nPjwvc3ZnPg==\")",
            backgroundSize: "4px 4px",
            mixBlendMode  : "overlay",
            opacity       : ".4",
        } as Partial<CSSStyleDeclaration>);
        document.body.appendChild(grain);
    }

    /* Google font */
    if (!document.getElementById("poppins‑font")) {
        const link = document.createElement("link");
        link.id  = "poppins‑font";
        link.rel = "stylesheet";
        link.href = "https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap";
        document.head.appendChild(link);
    }
})();

/* ---------- structure helpers ---------- */
export function createAppendix(): HTMLDivElement {
    const bar = document.createElement("div");
    Object.assign(bar.style, {
        width      : "100%",
        display    : "flex",
        justifyContent : "center",
        gap        : "64px",
        padding    : "18px 0",
        fontFamily : DESIGN.fontFamily,
        fontSize   : "20px",
        fontWeight : "600",
        color      : DESIGN.accentColor,
        borderBottomLeftRadius : "22px",
        borderBottomRightRadius: "22px",
        background : "rgba(255,255,255,0.10)",
        backdropFilter: "blur(10px)",
        border     : "1px solid rgba(255,255,255,0.35)",
        boxShadow  : "0 8px 30px rgba(0,0,0,.08)",
    } as Partial<CSSStyleDeclaration>);
    return bar;
}

export function createGameCanvas(_: Player[]): HTMLCanvasElement {
    const canvas = document.createElement("canvas");
    canvas.width  = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    Object.assign(canvas.style, {
        display     : "block",
        margin      : "40px auto",
        borderRadius: "14px",
        boxShadow   : "0 12px 28px rgba(0,0,0,.12)",
    } as Partial<CSSStyleDeclaration>);
    return canvas;
}

/* ---------- button polish ---------- */
export function styleStartButton(btn: HTMLButtonElement) {
    Object.assign(btn.style, {
        minWidth   : "220px",
        padding    : "14px 28px",
        fontFamily : DESIGN.fontFamily,
        fontSize   : "22px",
        fontWeight : "600",
        background : DESIGN.buttonColor,
        color      : DESIGN.textColor,
        border     : "none",
        borderRadius: "50px",
        cursor     : "pointer",
        boxShadow  : "0 4px 12px rgba(0,0,0,.15)",
        transition : "transform .18s ease, box-shadow .18s ease",
    } as Partial<CSSStyleDeclaration>);
    btn.onmouseenter = () => {
        btn.style.transform = "translateY(-3px)";
        btn.style.boxShadow = "0 8px 18px rgba(0,0,0,.22)";
    };
    btn.onmouseleave = () => {
        btn.style.transform = "translateY(0)";
        btn.style.boxShadow = "0 4px 12px rgba(0,0,0,.15)";
    };
}

/* ---------- score flip micro‑animation ---------- */
let scoreCSSInjected = false;
function ensureScoreCSS() {
    if (scoreCSSInjected) return;
    scoreCSSInjected = true;
    const s = document.createElement("style");
    s.textContent = `
  @keyframes flipUp{
    0%{ transform:translateY(12px) rotateX(90deg); opacity:0 }
    80%{ opacity:1 }
    100%{ transform:translateY(0) rotateX(0deg); }
  }`;
    document.head.appendChild(s);
}
export function animateScore(el: HTMLElement) {
    ensureScoreCSS();
    el.style.animation = "flipUp .4s cubic-bezier(.4,1.4,.6,1)";
}

/* ---------- core drawing helpers ---------- */
export function drawBackground(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = DESIGN.fieldColor;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.strokeStyle = DESIGN.lineColor;
    ctx.lineWidth   = 4;
    ctx.strokeRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.beginPath();
    ctx.moveTo(CANVAS_WIDTH / 2, 0);
    ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
    ctx.stroke();
}

export function drawCountdownFrame(
    ctx: CanvasRenderingContext2D,
    frame: string
) {
    drawBackground(ctx);
    ctx.font = `900 96px ${DESIGN.fontFamily}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    // ctx.fillStyle = '000000';
    ctx.fillStyle = DESIGN.accentColor;
    ctx.fillText(frame, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
}

export function drawPauseIcon(ctx: CanvasRenderingContext2D) {
    const w=16,h=48,gap=12;
    ctx.fillStyle = DESIGN.lineColor;
    ctx.fillRect(CANVAS_WIDTH/2-gap/2-w, CANVAS_HEIGHT-40-h, w, h);
    ctx.fillRect(CANVAS_WIDTH/2+gap/2,   CANVAS_HEIGHT-40-h, w, h);
}

/* paddles & ball (canvas variants) */
export function drawPaddle(
    ctx: CanvasRenderingContext2D,
    x:number,y:number,w:number,h:number
){
    ctx.fillStyle = DESIGN.accentColor;
    ctx.fillRect(x,y,w,h);
}

export function drawBall(
    ctx: CanvasRenderingContext2D, x:number,y:number,r:number
){
    const g = ctx.createRadialGradient(x-r*0.4,y-r*0.4,r*0.1, x,y,r);
    g.addColorStop(0,"#ff768e");
    g.addColorStop(0.55,DESIGN.accentColor);
    g.addColorStop(1,"#4c000d");
    ctx.fillStyle = g;

    ctx.save();
    ctx.filter = "blur(2px)";
    ctx.beginPath();
    ctx.arc(x,y,r,0,Math.PI*2);
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = "rgba(255,255,255,.65)";
    ctx.beginPath();
    ctx.ellipse(x-r*0.35, y-r*0.35, r*0.15, r*0.10, 0, 0, Math.PI*2);
    ctx.fill();
}
