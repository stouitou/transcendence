import { BaseComponent } from "../../frameworks/base-component.ts";
import {
  Engine,
  Scene,
  FreeCamera,
  Vector3,
  HemisphericLight,
  MeshBuilder,
  StandardMaterial,
  Color3,
  Color4,
  Camera,
  Mesh,
} from "babylonjs";

export const getThemeColor = (): 'light' | 'dark' => {
  const theme = localStorage.getItem('color-theme');
  return theme === 'dark' ? 'dark' : 'light';
};

export class BackgroundCanvas extends BaseComponent {
  private engine: Engine | null = null;
  private scene: Scene | null = null;
  private camera: FreeCamera | null = null;
  private canvas: HTMLCanvasElement | null = null;

  disconnectedCallback() {
    this.cleanup();
  }

  render() {
    this.cleanup();
    this.innerHTML = `
  <div id="canvasContainer" class="fixed top-0 left-0 w-full h-full z-0"
       style="
         background-image:
           linear-gradient(rgba(255,255,255,0.8), rgba(255,255,255,0.8)),
           url('/uploads/bg10.png');
         background-size: cover;
         background-position: center;
       ">
      <canvas id="canvasContent" class="absolute top-0 left-0 w-full h-full"></canvas>
  </div>
`;

    const container = this.querySelector('#canvasContainer')! as HTMLDivElement;
    const canvas = this.querySelector('#canvasContent')! as HTMLCanvasElement;
    this.canvas = canvas;
    this.initBackground(container, canvas);
  }

  initBackground(container: HTMLElement, canvas: HTMLCanvasElement) {
    if (!container || !canvas) return;

    // Babylon engine & scene (with alpha framebuffer)
    this.engine = new Engine(canvas, true, {
      antialias:            true,
      preserveDrawingBuffer: true,
      stencil:               true,
      alpha:                 true,
    });
    this.scene = new Scene(this.engine);

    // Transparent clear so background shows through
    const lightClear = new Color4(1, 1, 1, 0);
    const darkClear  = new Color4(0.1, 0.1, 0.1, 1);
    this.scene.clearColor = getThemeColor() === 'light' ? lightClear : darkClear;

    // Ensure the <canvas> itself is transparent in CSS
    canvas.style.backgroundColor = 'transparent';

    // Orthographic camera
    this.camera = new FreeCamera("camera", new Vector3(0, 0, 50), this.scene);
    this.camera.setTarget(Vector3.Zero());
    this.camera.mode = Camera.ORTHOGRAPHIC_CAMERA;

    // Resize logic
    const updateCameraOrtho = () => {
      if (!this.engine || !this.camera) return;
      const rect = this.engine.getRenderingCanvasClientRect();
      if (!rect) return;
      const aspect = rect.width / rect.height;
      this.camera.orthoTop    = 30;
      this.camera.orthoBottom = -30;
      this.camera.orthoLeft   = -30 * aspect;
      this.camera.orthoRight  = 30 * aspect;
    };
    updateCameraOrtho();
    window.addEventListener("resize", () => {
      this.engine?.resize();
      updateCameraOrtho();
    });

    // Simple hemispheric light
    const light = new HemisphericLight("light", new Vector3(0, 1, 0), this.scene);
    light.intensity = 0.9;

    // Create spheres
    this.spawnBalls(30, 1.0);

    // Listen for theme changes to adjust clear color & materials
    const themeObserver = new MutationObserver(() => {
      this.scene!.clearColor = getThemeColor() === 'light' ? lightClear : darkClear;
      this.updateMaterials();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    // Render loop
    this.engine.runRenderLoop(() => {
      this.scene?.render();
    });
  }

  spawnBalls(count: number, sphereRadius: number) {
    if (!this.scene || !this.camera) return;

    const materials = this.createDefaultMaterials(this.scene);
    const balls: { mesh: Mesh; vx: number; vy: number; radius: number }[] = [];

    for (let i = 0; i < count; i++) {
      const sphere = MeshBuilder.CreateSphere(
          `sphere_${i}`,
          { diameter: sphereRadius * 2, segments: 24 },
          this.scene
      );
      const randomMat = materials[Math.floor(Math.random() * materials.length)];
      sphere.material = randomMat;

      const { left, right, top, bottom } = this.getCameraBounds(this.camera);
      sphere.position.x = this.randomRange(left + sphereRadius, right - sphereRadius);
      sphere.position.y = this.randomRange(bottom + sphereRadius, top - sphereRadius);
      sphere.position.z = 0;

      const vx = this.randomRange(-0.2, 0.2);
      const vy = this.randomRange(-0.2, 0.2);

      balls.push({ mesh: sphere, vx, vy, radius: sphereRadius });
    }

    this.scene.onBeforeRenderObservable.add(() => {
      const dt = (this.engine!.getDeltaTime()! * 0.001) * 60;
      const { left, right, top, bottom } = this.getCameraBounds(this.camera!);

      for (const b of balls) {
        b.mesh.position.x += b.vx * dt;
        b.mesh.position.y += b.vy * dt;

        if (b.mesh.position.x > right - b.radius || b.mesh.position.x < left + b.radius) b.vx *= -1;
        if (b.mesh.position.y > top - b.radius   || b.mesh.position.y < bottom + b.radius) b.vy *= -1;
      }

      for (let i = 0; i < balls.length; i++) {
        for (let j = i + 1; j < balls.length; j++) {
          resolveCollision2D(balls[i], balls[j]);
        }
      }
    });
  }

  createDefaultMaterials(scene: Scene): StandardMaterial[] {
    const colors = getThemeColor() === 'light'
        ? ["#ff0063", "#ff0000", "#00ffa1", "#0032ff", "#d7b5ff", "#FFD1BA"]
        : ["#ff0063", "#ff0000", "#00ffa1", "#0032ff", "#d7b5ff", "#FFD1BA"];
    return colors.map((color, index) => {
      const mat = new StandardMaterial(`mat${index}`, scene);
      mat.diffuseColor  = Color3.FromHexString(color);
      mat.specularColor = new Color3(0.3, 0.3, 0.3);
      return mat;
    });
  }

  updateMaterials() {
    if (!this.scene) return;
    const newMats = this.createDefaultMaterials(this.scene);
    this.scene.meshes.forEach((mesh) => {
      if (mesh.name.startsWith('sphere_')) {
        (mesh as Mesh).material = newMats[Math.floor(Math.random() * newMats.length)];
      }
    });
  }

  getCameraBounds(camera: FreeCamera) {
    return {
      left:   camera.orthoLeft!,
      right:  camera.orthoRight!,
      top:    camera.orthoTop!,
      bottom: camera.orthoBottom!,
    };
  }

  randomRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  cleanup() {
    if (this.engine) {
      this.engine.stopRenderLoop();
      this.scene?.dispose();
      this.engine.dispose();
      this.engine = null;
    }
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
    this.canvas = null;
    this.scene  = null;
    this.camera = null;
  }
}

function resolveCollision2D(
    a: { mesh: Mesh; vx: number; vy: number; radius: number },
    b: { mesh: Mesh; vx: number; vy: number; radius: number }
) {
  const dx = b.mesh.position.x - a.mesh.position.x;
  const dy = b.mesh.position.y - a.mesh.position.y;
  const distSq = dx * dx + dy * dy;
  const radiusSum = a.radius + b.radius;

  if (distSq <= radiusSum * radiusSum) {
    const dist = Math.sqrt(distSq) || 0.00001;
    const nx = dx / dist;
    const ny = dy / dist;

    const vaDot = a.vx * nx + a.vy * ny;
    const vbDot = b.vx * nx + b.vy * ny;
    const aFactor = vbDot - vaDot;
    const bFactor = vaDot - vbDot;

    a.vx += aFactor * nx;
    a.vy += aFactor * ny;
    b.vx += bFactor * nx;
    b.vy += bFactor * ny;

    const overlap = radiusSum - dist;
    a.mesh.position.x -= (overlap * 0.5) * nx;
    a.mesh.position.y -= (overlap * 0.5) * ny;
    b.mesh.position.x += (overlap * 0.5) * nx;
    b.mesh.position.y += (overlap * 0.5) * ny;
  }
}
