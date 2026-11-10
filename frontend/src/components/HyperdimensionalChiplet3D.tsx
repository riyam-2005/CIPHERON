import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface HyperdimensionalChiplet3DProps {
  workloadPct?: number;
  isZeroized?: boolean;
}

export const HyperdimensionalChiplet3D: React.FC<HyperdimensionalChiplet3DProps> = ({
  workloadPct = 75,
  isZeroized = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedLayer, setSelectedLayer] = useState<number | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050914);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(22, 18, 28);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // Ambient & directional lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x00e5ff, 2, 80);
    pointLight.position.set(10, 20, 15);
    scene.add(pointLight);

    const redLight = new THREE.PointLight(0xff0055, 1.5, 60);
    redLight.position.set(-15, -10, -10);
    scene.add(redLight);

    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // 4 Heterogeneous Chiplet Layers
    const layersData = [
      { id: 4, name: 'L4: HDC & Memristor PIM (1T1M HfOx)', color: 0x8b5cf6, y: 4.5 },
      { id: 3, name: 'L3: Photonic TPU MZI Die', color: 0x06b6d4, y: 1.5 },
      { id: 2, name: 'L2: ESP32-S3 CPU & ATECC608A Die', color: 0x10b981, y: -1.5 },
      { id: 1, name: 'L1: CoWoS Base Interposer & HBM3', color: 0x3b82f6, y: -4.5 },
    ];

    const layerMeshes: THREE.Mesh[] = [];

    layersData.forEach((layer) => {
      const geo = new THREE.BoxGeometry(14, 0.6, 14);
      const mat = new THREE.MeshStandardMaterial({
        color: layer.color,
        roughness: 0.3,
        metalness: 0.8,
        transparent: true,
        opacity: isZeroized ? 0.2 : 0.85,
        wireframe: isZeroized,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(0, layer.y, 0);
      mainGroup.add(mesh);
      layerMeshes.push(mesh);

      // Edge wireframe accent
      const wireGeo = new THREE.EdgesGeometry(geo);
      const wireMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.4 });
      const wire = new THREE.LineSegments(wireGeo, wireMat);
      mesh.add(wire);
    });

    // High-Density Micro-Bumps (100,000 Micro-Bumps at 10µm Pitch)
    const bumpGeo = new THREE.CylinderGeometry(0.08, 0.08, 2.4, 6);
    const bumpMat = new THREE.MeshBasicMaterial({
      color: isZeroized ? 0xff3333 : 0xffd700,
      transparent: true,
      opacity: isZeroized ? 0.15 : 0.65,
    });

    const bumpPositions: [number, number, number][] = [];
    for (let x = -6; x <= 6; x += 1.5) {
      for (let z = -6; z <= 6; z += 1.5) {
        bumpPositions.push([x, 3.0, z]);
        bumpPositions.push([x, 0.0, z]);
        bumpPositions.push([x, -3.0, z]);
      }
    }

    const bumpsGroup = new THREE.Group();
    bumpPositions.forEach(([x, y, z]) => {
      const bump = new THREE.Mesh(bumpGeo, bumpMat);
      bump.position.set(x, y, z);
      bumpsGroup.add(bump);
    });
    mainGroup.add(bumpsGroup);

    // 10,000-D Hypervector Swarm Particles around Layer 4
    const particleCount = isZeroized ? 200 : 1200;
    const particleGeo = new THREE.BufferGeometry();
    const posArray = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      posArray[i] = (Math.random() - 0.5) * 16;
      posArray[i + 1] = 4.5 + (Math.random() - 0.5) * 3;
      posArray[i + 2] = (Math.random() - 0.5) * 16;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.15,
      color: isZeroized ? 0xef4444 : 0x00e5ff,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    mainGroup.add(particles);

    // Animation loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (!isZeroized) {
        mainGroup.rotation.y += 0.003;
        particles.rotation.y -= 0.006;
      } else {
        mainGroup.rotation.y += 0.0005;
      }
      renderer.render(scene, camera);
    };
    animate();

    // Resize handler
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
      renderer.dispose();
    };
  }, [workloadPct, isZeroized]);

  return (
    <div className="relative w-full h-96 rounded-xl overflow-hidden border border-[#232B3E] bg-[#050914]">
      {/* HUD Overlay */}
      <div className="absolute top-3 left-4 z-10 font-mono space-y-1">
        <div className="flex items-center space-x-2">
          <span className={`w-2.5 h-2.5 rounded-full ${isZeroized ? 'bg-red-500 animate-ping' : 'bg-[#00E5FF] animate-pulse'}`} />
          <span className="text-xs font-bold text-[#00E5FF] tracking-wider">
            V10.0 OMEGA — 4-LAYER 3D CHIPLET INTERPOSER MESH
          </span>
        </div>
        <div className="text-[11px] text-slate-400">
          BANDWIDTH: <span className="text-emerald-400 font-bold">3.2 Tbps/mm²</span> | MICRO-BUMPS: <span className="text-amber-400">100,000 (10µm Pitch)</span>
        </div>
        <div className="text-[11px] text-slate-400">
          HDC DIMENSION: <span className="text-purple-400 font-bold">10,000-D</span> | QUERY LATENCY: <span className="text-cyan-400">&lt;10 ns</span>
        </div>
      </div>

      {isZeroized && (
        <div className="absolute inset-0 bg-red-950/70 backdrop-blur-sm z-20 flex flex-col items-center justify-center font-mono">
          <span className="text-2xl font-bold text-red-500 tracking-widest animate-pulse">
            ATOMIC ZEROIZATION DETONATED
          </span>
          <p className="text-xs text-red-300 mt-2">
            Interposer silicon lattice vaporized in 68.5 ns (&lt;100ns). System Fail-Closed.
          </p>
        </div>
      )}

      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
    </div>
  );
};
