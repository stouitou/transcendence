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
export const DESIGN = {
    fieldColor  : "#171d29",     // deep charcoal-blue
    lineColor   : "#ffffff",
    accentColor : "#00faff",     // vivid aqua
    buttonColor : "#ffffff",
    textColor   : "#472525",     // soft light grey
    fontFamily  : "'Inter', 'Helvetica Neue', Arial, sans-serif",
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
            zIndex          : "1",
            //prevent Content-Security-Policy : ERROR
            //use utf8 encoding instead of base64
            //base64 encoding , XSS vulnerability; less compatible            
            backgroundImage: `url("data:image/svg+xml;utf8,
                <svg xmlns='http://www.w3.org/2000/svg' width='1' height='1'>
                <g fill='#000000' fill-opacity='.04'>
                    <rect width='1' height='1'/>
                </g>
                </svg>")`,
           /*  backgroundImage:
                "url(\"data:image/svg+xml;base64,"
                + "PHN2ZyB3aWR0aD0nMScgaGVpZ2h0PScxJyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnPjxnIGZpbGw9JyMwMDAwMDAnIGZpbGwtb3BhY2l0eT0nLjA0Jz48cmVjdCB3aWR0aD0nMScgaGVpZ2h0PScxJy8+PC9nPjwvc3ZnPg==\")", */
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
export function drawBackground (ctx: CanvasRenderingContext2D | null) {
    if (!ctx)   { return ; }

    ctx.fillStyle = DESIGN.fieldColor;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.strokeStyle = DESIGN.lineColor;
    ctx.lineWidth   = 3;
    ctx.strokeRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.beginPath();
    ctx.setLineDash([10, 10]);
    ctx.strokeStyle = "#b0b9c9";
    ctx.moveTo(CANVAS_WIDTH / 2, 0);
    ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
    ctx.stroke();
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
    ctx.fillStyle   = DESIGN.accentColor;
    ctx.shadowColor = "rgba(0,0,0,.50)";
    ctx.shadowBlur  = 8;
    ctx.fillRect(x, y, w, h);
    ctx.shadowBlur  = 0;
}

export function drawBall(
    ctx: CanvasRenderingContext2D,
    x: number, y: number, r: number
) {
    if (x + r < 0 || x - r > CANVAS_WIDTH || y + r < 0 || y - r > CANVAS_HEIGHT)
        return;

    const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
    g.addColorStop(0,   "#ffffff");
    g.addColorStop(0.4, "#c4c4c4");
    g.addColorStop(1,   "#7a7a7a");
    ctx.fillStyle = g;

    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
}
