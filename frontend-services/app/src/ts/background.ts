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
    Camera
} from 'babylonjs';

export interface BallsBackgroundOptions {
    numSpheres?: number;
    sphereRadius?: number;
    backgroundColor?: Color4;
    baseOrthoSize?: number;
    materials?: StandardMaterial[];
}

/**
 * Initializes a Babylon.js scene with bouncing pastel spheres in orthographic view.
 * Attaches to `container` by creating a <canvas> and returning references
 * so you can handle disposal or additional logic if you want.
 */
export function initBallsBackground(
    container: HTMLElement,
    {
        numSpheres = 30,
        sphereRadius = 1.0,
        backgroundColor = new Color4(1, 1, 1, 1),
        baseOrthoSize = 30,
        materials
    }: BallsBackgroundOptions = {}
) {
    // Create a canvas for the background
    const canvas = document.createElement('canvas');
    canvas.className = 'absolute top-0 left-0 w-full h-full block';
    container.appendChild(canvas);

    // Babylon engine & scene
    const engine = new Engine(canvas, true);
    const scene = new Scene(engine);
    scene.clearColor = backgroundColor;

    // Orthographic camera
    const camera = new FreeCamera('camera', new Vector3(0, 0, 50), scene);
    camera.setTarget(Vector3.Zero());
    camera.mode = Camera.ORTHOGRAPHIC_CAMERA;

    // Resize logic
    function updateCameraOrtho() {
        const rect = engine.getRenderingCanvasClientRect();
        const aspect = rect.width / rect.height;
        camera.orthoTop = baseOrthoSize;
        camera.orthoBottom = -baseOrthoSize;
        camera.orthoLeft = -baseOrthoSize * aspect;
        camera.orthoRight = baseOrthoSize * aspect;
    }
    updateCameraOrtho();
    window.addEventListener('resize', () => {
        engine.resize();
        updateCameraOrtho();
    });

    // Simple hemispheric light
    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);
    light.intensity = 0.9;

    // If no materials array was provided, define some default ones
    let ballMaterials: StandardMaterial[];
    if (materials && materials.length > 0) {
        ballMaterials = materials;
    } else {
        // Example: default pastel materials
        const mat1 = new StandardMaterial('mat1', scene);
        mat1.diffuseColor = Color3.FromHexString('#ff0063');
        mat1.specularColor = new Color3(0.3, 0.3, 0.3);

        const mat2 = new StandardMaterial('mat2', scene);
        mat2.diffuseColor = Color3.FromHexString('#ff0000');
        mat2.specularColor = new Color3(0.3, 0.3, 0.3);

        const mat3 = new StandardMaterial('mat3', scene);
        mat3.diffuseColor = Color3.FromHexString('#00ffa1');
        mat3.specularColor = new Color3(0.3, 0.3, 0.3);

        const mat4 = new StandardMaterial('mat4', scene);
        mat4.diffuseColor = Color3.FromHexString('#0032ff');
        mat4.specularColor = new Color3(0.3, 0.3, 0.3);

        const mat5 = new StandardMaterial('mat5', scene);
        mat5.diffuseColor = Color3.FromHexString('#d7b5ff');
        mat5.specularColor = new Color3(0.3, 0.3, 0.3);

        const mat6 = new StandardMaterial('mat6', scene);
        mat6.diffuseColor = Color3.FromHexString('#FFD1BA');
        mat6.specularColor = new Color3(0.3, 0.3, 0.3);

        ballMaterials = [mat1, mat2, mat3, mat4, mat5, mat6];
    }

    // The sphere objects
    interface Ball {
        mesh: BABYLON.Mesh;
        vx: number;
        vy: number;
        radius: number;
    }
    const balls: Ball[] = [];

    // Create N spheres with random velocity
    function spawnBalls(count: number) {
        for (let i = 0; i < count; i++) {
            const sphere = MeshBuilder.CreateSphere(
                `sphere_${i}`,
                { diameter: sphereRadius * 2, segments: 24 },
                scene
            );
            const randomMat = ballMaterials[Math.floor(Math.random() * ballMaterials.length)];
            sphere.material = randomMat;

            const { left, right, top, bottom } = getCameraBounds(camera);
            sphere.position.x = randomRange(left + sphereRadius, right - sphereRadius);
            sphere.position.y = randomRange(bottom + sphereRadius, top - sphereRadius);
            sphere.position.z = 0;

            const vx = randomRange(-0.2, 0.2);
            const vy = randomRange(-0.2, 0.2);

            balls.push({ mesh: sphere, vx, vy, radius: sphereRadius });
        }
    }
    spawnBalls(numSpheres);

    // Animate collisions, bounces, etc.
    scene.onBeforeRenderObservable.add(() => {
        const dt = engine.getDeltaTime() * 0.001;
        const { left, right, top, bottom } = getCameraBounds(camera);

        for (const b of balls) {
            b.mesh.position.x += b.vx * dt * 60;
            b.mesh.position.y += b.vy * dt * 60;

            // Bounce checks
            if (b.mesh.position.x > right - b.radius) {
                b.mesh.position.x = right - b.radius;
                b.vx *= -1;
            } else if (b.mesh.position.x < left + b.radius) {
                b.mesh.position.x = left + b.radius;
                b.vx *= -1;
            }
            if (b.mesh.position.y > top - b.radius) {
                b.mesh.position.y = top - b.radius;
                b.vy *= -1;
            } else if (b.mesh.position.y < bottom + b.radius) {
                b.mesh.position.y = bottom + b.radius;
                b.vy *= -1;
            }
        }

        // Ball-ball collisions (2D)
        for (let i = 0; i < balls.length; i++) {
            for (let j = i + 1; j < balls.length; j++) {
                resolveCollision2D(balls[i], balls[j]);
            }
        }
    });

    // Render loop
    engine.runRenderLoop(() => {
        scene.render();
    });

    // Return references for optional future usage (cleanup, etc.)
    return {
        engine,
        scene,
        camera,
        canvas,
        dispose: () => {
            // If you ever want to remove the background, call this
            engine.stopRenderLoop();
            scene.dispose();
            engine.dispose();
            if (canvas.parentNode) {
                canvas.parentNode.removeChild(canvas);
            }
        }
    };
}

// Helper functions

function getCameraBounds(camera: FreeCamera) {
    return {
        left: camera.orthoLeft,
        right: camera.orthoRight,
        top: camera.orthoTop,
        bottom: camera.orthoBottom
    };
}

function randomRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
}

function resolveCollision2D(a: { mesh: BABYLON.Mesh; vx: number; vy: number; radius: number }, b: { mesh: BABYLON.Mesh; vx: number; vy: number; radius: number }) {
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

        // Slight separation
        const overlap = radiusSum - dist;
        a.mesh.position.x -= (overlap * 0.5) * nx;
        a.mesh.position.y -= (overlap * 0.5) * ny;
        b.mesh.position.x += (overlap * 0.5) * nx;
        b.mesh.position.y += (overlap * 0.5) * ny;
    }
}
