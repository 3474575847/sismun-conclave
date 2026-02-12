'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

function ParticleGlobe({ mousePosition }: { mousePosition: { x: number; y: number } }) {
    const pointsRef = useRef<THREE.Points>(null);
    const mouseRef = useRef({ x: 0, y: 0 });

    // Fibonacci Sphere Algorithm for perfectly uniform distribution
    const { particlesPosition, originalPositions } = useMemo(() => {
        const count = 10000;
        const positions = new Float32Array(count * 3);
        const original = new Float32Array(count * 3);
        const radius = 3;
        const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle in radians

        for (let i = 0; i < count; i++) {
            const y = 1 - (i / (count - 1)) * 2; // y goes from 1 to -1
            const r = Math.sqrt(1 - y * y); // radius at y
            const theta = phi * i; // golden angle increment

            const x = Math.cos(theta) * r;
            const z = Math.sin(theta) * r;

            positions[i * 3] = x * radius;
            positions[i * 3 + 1] = y * radius;
            positions[i * 3 + 2] = z * radius;

            original[i * 3] = x * radius;
            original[i * 3 + 1] = y * radius;
            original[i * 3 + 2] = z * radius;
        }

        return { particlesPosition: positions, originalPositions: original };
    }, []);

    useFrame((state) => {
        if (!pointsRef.current) return;

        // Smooth mouse interpolation (slower interpolation for smoother motion)
        mouseRef.current.x += (mousePosition.x - mouseRef.current.x) * 0.03;
        mouseRef.current.y += (mousePosition.y - mouseRef.current.y) * 0.03;

        // Rotate globe
        const time = state.clock.elapsedTime;
        pointsRef.current.rotation.y = time * 0.05;
        pointsRef.current.rotation.x = Math.sin(time * 0.1) * 0.1;

        // Particle magnetic repulsion effect
        const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;

        for (let i = 0; i < positions.length; i += 3) {
            const ox = originalPositions[i];
            const oy = originalPositions[i + 1];
            const oz = originalPositions[i + 2];

            // Convert normalized mouse to 3D Canvas space
            // Account for camera position (z=6) and FOV
            const mx = (mouseRef.current.x - 0.5) * 8;
            const my = -(mouseRef.current.y - 0.5) * 8;

            const dx = ox - mx;
            const dy = oy - my;
            const dist = Math.sqrt(dx * dx + dy * dy);

            const repulsionRadius = 1.8;
            const repulsionStrength = 0.5;

            if (dist < repulsionRadius) {
                // Stronger repulsion near the mouse
                const force = Math.pow(1 - dist / repulsionRadius, 2) * repulsionStrength;
                positions[i] += (dx / dist) * force * 0.2;
                positions[i + 1] += (dy / dist) * force * 0.2;
            } else {
                // Smooth return to original position with subtle breathing drift
                const drift = Math.sin(time * 0.5 + i * 0.01) * 0.01;
                positions[i] += (ox + drift - positions[i]) * 0.1;
                positions[i + 1] += (oy + drift - positions[i + 1]) * 0.1;
                positions[i + 2] += (oz - positions[i + 2]) * 0.1;
            }
        }

        pointsRef.current.geometry.attributes.position.needsUpdate = true;
    });

    return (
        <Points ref={pointsRef} positions={particlesPosition} stride={3} frustumCulled={false}>
            <PointMaterial
                transparent
                color="#0A192F" // Deep Blue for Light Mode
                size={0.02}
                sizeAttenuation={true}
                depthWrite={false}
                opacity={0.6}
            />
        </Points>
    );
}

export default function HeroScene() {
    const mousePosition = useRef({ x: 0.5, y: 0.5 });

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        mousePosition.current = {
            x: (e.clientX - rect.left) / rect.width,
            y: (e.clientY - rect.top) / rect.height,
        };
    };

    return (
        <div
            className="absolute inset-0 w-full h-full"
            onMouseMove={handleMouseMove}
        >
            <Canvas
                camera={{ position: [0, 0, 6], fov: 50 }}
                gl={{
                    antialias: true,
                    alpha: true,
                    powerPreference: 'high-performance',
                }}
            >
                <ambientLight intensity={1} />
                <ParticleGlobe mousePosition={mousePosition.current} />
            </Canvas>
        </div>
    );
}
