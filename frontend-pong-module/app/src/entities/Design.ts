/* =========================================================
   Design.ts   –   “Dusk-Glow” style module  v3
   • responsive play-field helpers (max 1200×900)
   • glassy appendix bar
   • button hover polish + score flip
   • high-contrast paddle / ball painters
   • fancy dusk gradient bg (vertical scroll intact)
   ========================================================= */

import { CANVAS_HEIGHT, CANVAS_WIDTH, setCanvasSize } from "../component/classic.ts";
import { Player } from "./Player";


/* ---------- palette / fonts ---------- */
/* Design.ts */

export const DESIGN = {
    // a deep, pool-green court you can see through
    fieldColor:    "rgba(173,138,227,0.25)",

    // crisp, slightly translucent white lines
    lineColor:     "rgba(255, 255, 255, 0.8)",
    lineWidth:     20,    // thinner, more realistic court lines

    lineWidth2: 2,
    // a bright tennis-ball yellow accent
    accentColor:   "rgb(255,147,222)",

    // everything else stays white or near-black
    buttonColor:   "#ffffff",
    textColor:     "#231e1e",
    fontFamily:    "'Inter', 'Helvetica Neue', Arial, sans-serif",
};


/* ---------- global page styling ---------- */
(() => {
    const styleId = "dg-page-style";
    if (!document.getElementById(styleId)) {
        const css = document.createElement("style");
        css.id = styleId;
        css.textContent = `
  body {
    /* light pastel base via CSS vars */
    --dg-grad-start: #ffffff;
    --dg-grad-end:   #f7f7f7;

    /* two-layer background: soft radial + linear fade */
    background:
      radial-gradient(circle at 30% 20%, #ffffff 0%, #fcfcfc 50%, #f2f2f2 100%),
      linear-gradient(135deg, var(--dg-grad-start) 0%, var(--dg-grad-end) 100%);
    min-height: 100vh;
    overflow-x: hidden;           /* keep vertical scroll */
    color: ${DESIGN.textColor};
    font-family: ${DESIGN.fontFamily};
  }

  /* light “vignette” glow edges */
  body::before {
    content: "";
    position: fixed;
    inset: 0;
    pointer-events: none;
    background:
      radial-gradient(circle at 50% 110%, transparent 0%, rgba(255, 255, 255, 0.6) 90%);
    mix-blend-mode: overlay;
    z-index: -1;
  }

  /* still hide any stray decorative balls */
  .ball, .bg-ball, .background-ball {
    display: none !important;
  }
`;
        document.head.appendChild(css);
    }

    /* grain overlay (optional aesthetic depth) */
    if (!document.getElementById("ae‑grain")) {
        const   grain = document.createElement("div");
        grain.id = "ae‑grain";
        Object.assign(grain.style, {
            position        : "fixed",
            inset           : "0",
            pointerEvents   : "none",
            zIndex          : "2",
            backgroundImage:
                "url(\"data:image/svg+xml;base64,"
                + "PHN2ZyB3aWR0aD0nMScgaGVpZ2h0PScxJyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnPjxnIGZpbGw9JyMwMDAwMDAnIGZpbGwtb3BhY2l0eT0nLjA0Jz48cmVjdCB3aWR0aD0nMScgaGVpZ2h0PScxJy8+PC9nPjwvc3ZnPg==\")",
            backgroundSize  : "4px 4px",
            mixBlendMode    : "overlay",
            opacity         : ".4",
        } as Partial<CSSStyleDeclaration>);
        document.body.appendChild(grain);
    }

    /* Google font */
    if (!document.getElementById("poppins‑font")) {
        const   link = document.createElement("link");
        link.id  = "poppins‑font";
        link.rel = "stylesheet";
        link.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap";
        document.head.appendChild(link);
    }
})();

/* ---------- structure helpers ---------- */
export function createAppendix(_: number): HTMLDivElement {
    const   bar = document.createElement("div");

    Object.assign(bar.style, {
        width               : `${CANVAS_WIDTH}px`,
        height              : "66px",
        display             : "grid",
        gridTemplateColumns : "repeat(4,1fr)",
        alignItems          : "center",
        fontSize            : "20px",
        fontWeight          : "600",
        color               : DESIGN.textColor,
        backdropFilter      : "blur(12px)",
        borderRadius        : "14px",
        border              : "1px solid rgba(255,255,255,.14)",
        background          : "rgba(255,255,255,.07)",
        boxShadow           : "0 10px 32px rgba(0,0,0,.35)",
    } as Partial<CSSStyleDeclaration>);

    return bar ;
}

export function createGameCanvas(_: Player[]): HTMLCanvasElement {
    /* responsive sizing: up to 1200×900, keep 4:3 aspect */
    const W = Math.min(1200, window.innerWidth * 0.95);
    const H = W * 0.75;
    setCanvasSize(W, H);

    const canvas = document.createElement("canvas");
    canvas.width  = W;
    canvas.height = H;

    Object.assign(canvas.style, {
        width        : `${W}px`,
        height       : `${H}px`,
        display      : "block",
        margin       : "40px auto",
        borderRadius : "14px",
        boxShadow    : "0 14px 36px rgba(0,0,0,.30)",
    } as Partial<CSSStyleDeclaration>);

    return canvas;
}

/* ---------- button polish ---------- */
export function styleStartButton(btn: HTMLButtonElement) {
    Object.assign(btn.style, {
        minWidth     : "180px",
        height       : "40px",
        margin       : "6px",
        padding      : "6px 26px",
        fontFamily   : DESIGN.fontFamily,
        fontSize     : "20px",
        fontWeight   : "600",
        background   : DESIGN.buttonColor,
        color        : DESIGN.fieldColor,
        border       : "2px solid transparent",
        borderRadius : "8px",
        cursor       : "pointer",
        transition   : "background .2s ease, color .2s ease, transform .15s ease",
    } as Partial<CSSStyleDeclaration>);

    btn.onmouseenter = () => {
        btn.style.background  = "transparent";
        btn.style.color       = DESIGN.buttonColor;
        btn.style.borderColor = DESIGN.buttonColor;
        btn.style.transform   = "translateY(-2px)";
    };
    btn.onmouseleave = () => {
        btn.style.background  = DESIGN.buttonColor;
        btn.style.color       = DESIGN.fieldColor;
        btn.style.borderColor = "transparent";
        btn.style.transform   = "translateY(0)";
    };
}

/* ---------- score flip micro-animation ---------- */
let scoreCSSInjected = false;
function ensureScoreCSS() {
    if (scoreCSSInjected) return;
    scoreCSSInjected = true;
    const s = document.createElement("style");
    s.textContent = `
    @keyframes flipUp{
      0%   { transform:translateY(12px) rotateX(90deg); opacity:0 }
      80%  { opacity:1 }
      100% { transform:translateY(0)   rotateX(0deg);  }
    }`;
    document.head.appendChild(s);
}
export function animateScore(el: HTMLElement) {
    ensureScoreCSS();
    el.style.animation = "flipUp .4s cubic-bezier(.4,1.4,.6,1)";
}

/* ---------- core drawing helpers ---------- */
export function drawBackground(ctx: CanvasRenderingContext2D | null) {
    if (!ctx)   { return ; }

    // 1) Court fill
    ctx.fillStyle = DESIGN.fieldColor;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // 2) Outer border
    ctx.strokeStyle =  "rgba(255,195,123,0.41)";
    ctx.lineWidth   = DESIGN.lineWidth;   // e.g. 30px
    ctx.setLineDash([]);                  // solid
    ctx.strokeRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // 3) Center “net” line
    ctx.beginPath();
    ctx.strokeStyle = DESIGN.lineColor;   // can reuse same color
    ctx.lineWidth   =  2, // e.g. 30px * 0.3 = 9px
    ctx.setLineDash([10, 10]);            // dashed
    ctx.moveTo(CANVAS_WIDTH / 2, 0);
    ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
    ctx.stroke();

    // 4) Reset dash for anything else you draw later
    ctx.setLineDash([]);
}



export function drawCountdownFrame(
    ctx: CanvasRenderingContext2D,
    frame: string
) {
    drawBackground(ctx);
    ctx.font         = `1000 96px ${DESIGN.fontFamily}`;
    ctx.textAlign    = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle    = DESIGN.accentColor;
    ctx.fillText(frame, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
}

export function drawPauseIcon(ctx: CanvasRenderingContext2D) {
    const w = 16, h = 48, gap = 12;
    ctx.fillStyle = DESIGN.lineColor;
    ctx.fillRect(CANVAS_WIDTH / 2 - gap / 2 - w, CANVAS_HEIGHT - 40 - h, w, h);
    ctx.fillRect(CANVAS_WIDTH / 2 + gap / 2,   CANVAS_HEIGHT - 40 - h, w, h);
}

/* ---------- paddles & ball ---------- */
export function drawPaddle(
    ctx: CanvasRenderingContext2D,
    x: number, y: number, w: number, h: number
) {
    const radius = 6;  // corner rounding

    ctx.save();

    // 1) subtle drop-shadow behind the paddle
    ctx.shadowColor    = "rgba(0,0,0,0.3)";
    ctx.shadowBlur     = 6;
    ctx.shadowOffsetX  = 2;
    ctx.shadowOffsetY  = 2;

    // 2) build a rounded-rect path
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + w - radius, y);
    ctx.arcTo(x + w, y,     x + w, y + radius, radius);
    ctx.lineTo(x + w, y + h - radius);
    ctx.arcTo(x + w, y + h, x + w - radius, y + h, radius);
    ctx.lineTo(x + radius, y + h);
    ctx.arcTo(x,     y + h, x,           y + h - radius, radius);
    ctx.lineTo(x,     y + radius);
    ctx.arcTo(x,     y,     x + radius,  y,            radius);
    ctx.closePath();

    // 3) vertical gradient fill (lighter at top)
    const grad = ctx.createLinearGradient(x, y, x, y + h);
    grad.addColorStop(0, "rgba(243,7,7,0.3)");
    grad.addColorStop(1, DESIGN.accentColor);
    ctx.fillStyle = grad;
    ctx.fill();

    // 4) turn off shadow for the stroke
    ctx.shadowColor   = "transparent";
    ctx.shadowBlur    = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // 5) subtle highlight outline
    ctx.lineWidth   = 2;
    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.stroke();

    ctx.restore();
}

// /* ---------- scoreboard cell helper ---------- */
const style = document.createElement("style");
style.textContent = `
  .score-cell{
    margin: 56px;
    color:${DESIGN.accentColor};
    text-align:center;
    white-space:nowrap;
    overflow:visible;
    text-overflow:clip;
    width:100%;
    line-height: 34px;
  }`;
document.head.appendChild(style);
// >>>>>>> origin
