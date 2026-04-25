'use client';

import { useEffect, useRef } from 'react';

type Sphere = {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    spriteIndex: number;
};

const SPRITE_COUNT = 7;
const SPRITES: HTMLImageElement[] = [];

// Preload all orb sprites from public/sprites/
function loadSprites(): Promise<void[]> {
    return Promise.all(
        Array.from({ length: SPRITE_COUNT }, (_, i) => {
            return new Promise<void>((resolve) => {
                const img = new Image();
                img.src = `/sprites/orb${i + 1}.svg`;
                img.onload = () => resolve();
                SPRITES[i] = img;
            });
        })
    );
}
const SPHERE_COUNT = 12
const MIN_RADIUS = 20;
const MAX_RADIUS = 50;
const SPEED = 2;
const RANDOMNESS = 0.3; // max angle offset in radians applied after each bounce

function randomBetween(a: number, b: number) {
    return a + Math.random() * (b - a);
}

function randomJitter(): number {
    return (Math.random() - 0.5) * 2 * RANDOMNESS;
}

function createSpheres(width: number, height: number): Sphere[] {
    const spheres: Sphere[] = [];

    for (let i = 0; i < SPHERE_COUNT; i++) {
        let attempts = 0;
        let sphere: Sphere;

        do {
            const radius = randomBetween(MIN_RADIUS, MAX_RADIUS);
            const angle = Math.random() * Math.PI * 2;
            sphere = {
                x: randomBetween(radius, width - radius),
                y: randomBetween(radius, height - radius),
                vx: Math.cos(angle) * SPEED,
                vy: Math.sin(angle) * SPEED,
                radius,
                spriteIndex: i % SPRITE_COUNT,
            };
            attempts++;
        } while (
            attempts < 50 &&
            spheres.some((s) => {
                const dx = s.x - sphere.x;
                const dy = s.y - sphere.y;
                return Math.sqrt(dx * dx + dy * dy) < s.radius + sphere.radius;
            })
            );

        spheres.push(sphere);
    }

    return spheres;
}

function rotateVelocity(vx: number, vy: number, angle: number): [number, number] {
    return [
        vx * Math.cos(angle) - vy * Math.sin(angle),
        vx * Math.sin(angle) + vy * Math.cos(angle),
    ];
}

function resolveCollision(a: Sphere, b: Sphere) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const minDist = a.radius + b.radius;

    if (dist >= minDist || dist === 0) return;

    const nx = dx / dist;
    const ny = dy / dist;

    const overlap = (minDist - dist) / 2;
    a.x -= nx * overlap;
    a.y -= ny * overlap;
    b.x += nx * overlap;
    b.y += ny * overlap;

    const aVnormal = a.vx * nx + a.vy * ny;
    const bVnormal = b.vx * nx + b.vy * ny;

    if (aVnormal - bVnormal <= 0) return;

    a.vx += (bVnormal - aVnormal) * nx;
    a.vy += (bVnormal - aVnormal) * ny;
    b.vx += (aVnormal - bVnormal) * nx;
    b.vy += (aVnormal - bVnormal) * ny;

    const jitterA = randomJitter();
    const jitterB = randomJitter();
    ;[a.vx, a.vy] = rotateVelocity(a.vx, a.vy, jitterA);
    ;[b.vx, b.vy] = rotateVelocity(b.vx, b.vy, jitterB);

    const speedA = Math.sqrt(a.vx * a.vx + a.vy * a.vy);
    const speedB = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
    if (speedA > 0) { a.vx = (a.vx / speedA) * SPEED; a.vy = (a.vy / speedA) * SPEED; }
    if (speedB > 0) { b.vx = (b.vx / speedB) * SPEED; b.vy = (b.vy / speedB) * SPEED; }
}

function bounceOffWall(sphere: Sphere, width: number, height: number) {
    if (sphere.x - sphere.radius <= 0) {
        sphere.x = sphere.radius;
        sphere.vx *= -1;
        sphere.vy += randomJitter();
    } else if (sphere.x + sphere.radius >= width) {
        sphere.x = width - sphere.radius;
        sphere.vx *= -1;
        sphere.vy += randomJitter();
    }

    if (sphere.y - sphere.radius <= 0) {
        sphere.y = sphere.radius;
        sphere.vy *= -1;
        sphere.vx += randomJitter();
    } else if (sphere.y + sphere.radius >= height) {
        sphere.y = height - sphere.radius;
        sphere.vy *= -1;
        sphere.vx += randomJitter();
    }

    const speed = Math.sqrt(sphere.vx * sphere.vx + sphere.vy * sphere.vy);
    if (speed > 0) {
        sphere.vx = (sphere.vx / speed) * SPEED;
        sphere.vy = (sphere.vy / speed) * SPEED;
    }
}

// Reads all .orb-barrier elements and bounces spheres off their bounding boxes
function bounceOffBarriers(sphere: Sphere) {
    const barriers = document.querySelectorAll('.orb-barrier');

    barriers.forEach((el) => {
        const rect = el.getBoundingClientRect();

        // Expand rect by sphere radius so we treat the sphere as a point
        const left = rect.left + sphere.radius;
        const right = rect.right - sphere.radius;
        const top = rect.top + sphere.radius;
        const bottom = rect.bottom - sphere.radius;

        // Check if sphere center is inside the expanded rect
        if (sphere.x < rect.left - sphere.radius || sphere.x > rect.right + sphere.radius) return;
        if (sphere.y < rect.top - sphere.radius || sphere.y > rect.bottom + sphere.radius) return;

        const closestX = Math.max(rect.left, Math.min(sphere.x, rect.right));
        const closestY = Math.max(rect.top, Math.min(sphere.y, rect.bottom));

        const dx = sphere.x - closestX;
        const dy = sphere.y - closestY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist >= sphere.radius || dist === 0) {
            // Sphere center is inside the rect — find nearest edge and eject
            const distLeft = Math.abs(sphere.x - rect.left);
            const distRight = Math.abs(sphere.x - rect.right);
            const distTop = Math.abs(sphere.y - rect.top);
            const distBottom = Math.abs(sphere.y - rect.bottom);
            const minDist = Math.min(distLeft, distRight, distTop, distBottom);

            if (minDist === distLeft) {
                sphere.x = rect.left - sphere.radius;
                sphere.vx = -Math.abs(sphere.vx);
            } else if (minDist === distRight) {
                sphere.x = rect.right + sphere.radius;
                sphere.vx = Math.abs(sphere.vx);
            } else if (minDist === distTop) {
                sphere.y = rect.top - sphere.radius;
                sphere.vy = -Math.abs(sphere.vy);
            } else {
                sphere.y = rect.bottom + sphere.radius;
                sphere.vy = Math.abs(sphere.vy);
            }
            return;
        }

        // Normal case — push sphere out along collision normal
        const nx = dx / dist;
        const ny = dy / dist;
        const overlap = sphere.radius - dist;

        sphere.x += nx * overlap;
        sphere.y += ny * overlap;

        const dot = sphere.vx * nx + sphere.vy * ny;
        sphere.vx -= 2 * dot * nx;
        sphere.vy -= 2 * dot * ny;

        sphere.vx += randomJitter();
        sphere.vy += randomJitter();

        const speed = Math.sqrt(sphere.vx * sphere.vx + sphere.vy * sphere.vy);
        if (speed > 0) {
            sphere.vx = (sphere.vx / speed) * SPEED;
            sphere.vy = (sphere.vy / speed) * SPEED;
        }
    });
}

export default function BouncingSpheres() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationId: number;
        let spheres: Sphere[] = [];

        function resize() {
            if (!canvas) return;
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            spheres = createSpheres(canvas.width, canvas.height);
        }

        function draw() {
            if (!canvas || !ctx) return;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (const sphere of spheres) {
                sphere.x += sphere.vx;
                sphere.y += sphere.vy;
                bounceOffWall(sphere, canvas.width, canvas.height);
                bounceOffBarriers(sphere);
            }

            for (let pass = 0; pass < 3; pass++) {
                for (let i = 0; i < spheres.length; i++) {
                    for (let j = i + 1; j < spheres.length; j++) {
                        resolveCollision(spheres[i], spheres[j]);
                    }
                }
            }

            for (const sphere of spheres) {
                const img = SPRITES[sphere.spriteIndex];
                const d = sphere.radius * 2;
                ctx.drawImage(img, sphere.x - sphere.radius, sphere.y - sphere.radius, d, d);
            }

            animationId = requestAnimationFrame(draw);
        }

        loadSprites().then(() => {
            resize();
            draw();
        });

        window.addEventListener('resize', resize);
        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: -1,
                pointerEvents: 'none',
            }}
        />
    );
}