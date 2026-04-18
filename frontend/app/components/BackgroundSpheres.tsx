'use client';

import { useEffect, useRef } from 'react';

type Sphere = {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    color: string;
};

const COLORS = [
    '#e63946', '#457b9d', '#2a9d8f', '#e9c46a',
    '#f4a261', '#a8dadc', '#6a4c93', '#ffffff',
];
const SPHERE_COUNT = 12;
const MIN_RADIUS = 20;
const MAX_RADIUS = 50;
const SPEED = 2;
const RANDOMNESS = 0.3; // max angle offset in radians applied after each bounce

function randomBetween(a: number, b: number) {
    return a + Math.random() * (b - a);
}

// Returns a small random value in [-RANDOMNESS, RANDOMNESS]
function randomJitter(): number {
    return (Math.random() - 0.5) * 2 * RANDOMNESS;
}

// Spawns spheres without overlapping by retrying placement up to 50 times each
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
                color: COLORS[i % COLORS.length],
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

// Rotates a velocity vector by a given angle (used for post-bounce jitter)
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

    // Separate overlapping spheres evenly
    const overlap = (minDist - dist) / 2;
    a.x -= nx * overlap;
    a.y -= ny * overlap;
    b.x += nx * overlap;
    b.y += ny * overlap;

    // Swap velocity components along the collision normal (equal mass elastic collision)
    const aVnormal = a.vx * nx + a.vy * ny;
    const bVnormal = b.vx * nx + b.vy * ny;

    // Only resolve if moving toward each other
    if (aVnormal - bVnormal <= 0) return;

    // Subtract old normal component, add the other sphere's normal component
    a.vx += (bVnormal - aVnormal) * nx;
    a.vy += (bVnormal - aVnormal) * ny;
    b.vx += (aVnormal - bVnormal) * nx;
    b.vy += (aVnormal - bVnormal) * ny;

    // Add slight jitter to tangential axis so repeated collisions don't lock up
    const jitterA = randomJitter();
    const jitterB = randomJitter();
    ;[a.vx, a.vy] = rotateVelocity(a.vx, a.vy, jitterA);
    ;[b.vx, b.vy] = rotateVelocity(b.vx, b.vy, jitterB);

    // Clamp speed back to SPEED after jitter
    const speedA = Math.sqrt(a.vx * a.vx + a.vy * a.vy);
    const speedB = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
    if (speedA > 0) { a.vx = (a.vx / speedA) * SPEED; a.vy = (a.vy / speedA) * SPEED; }
    if (speedB > 0) { b.vx = (b.vx / speedB) * SPEED; b.vy = (b.vy / speedB) * SPEED; }
}

// Reflects velocity off walls and adds jitter to the parallel axis, then clamps speed back to SPEED
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

    // Clamp speed so jitter doesn't accumulate over time
    const speed = Math.sqrt(sphere.vx * sphere.vx + sphere.vy * sphere.vy);
    if (speed > 0) {
        sphere.vx = (sphere.vx / speed) * SPEED;
        sphere.vy = (sphere.vy / speed) * SPEED;
    }
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

            // Move all spheres then resolve wall bounces
            for (const sphere of spheres) {
                sphere.x += sphere.vx;
                sphere.y += sphere.vy;
                bounceOffWall(sphere, canvas.width, canvas.height);
            }

            // Multiple passes to settle overlaps before drawing
            for (let pass = 0; pass < 3; pass++) {
                for (let i = 0; i < spheres.length; i++) {
                    for (let j = i + 1; j < spheres.length; j++) {
                        resolveCollision(spheres[i], spheres[j]);
                    }
                }
            }

            for (const sphere of spheres) {
                ctx.beginPath();
                ctx.arc(sphere.x, sphere.y, sphere.radius, 0, Math.PI * 2);
                ctx.fillStyle = sphere.color;
                ctx.fill();
            }

            animationId = requestAnimationFrame(draw);
        }
        resize();
        draw();

        // Respawn spheres on resize to fit new dimensions
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