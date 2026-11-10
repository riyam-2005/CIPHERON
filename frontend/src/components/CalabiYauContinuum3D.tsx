import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface CalabiYauContinuum3DProps {
  eulerCharacteristic?: number;
  ghzLocked?: boolean;
  powerDensity?: number;
  isContinuumZeroized?: boolean;
}

export const CalabiYauContinuum3D: React.FC<CalabiYauContinuum3DProps> = ({
  eulerCharacteristic = 432,
  ghzLocked = true,
  powerDensity = 1.85e18,
  isContinuumZeroized = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth || 800;
    const height = containerRef.current.clientHeight || 400;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x010104);

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 20, 42);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // Dynamic Illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const cyanLight = new THREE.PointLight(0x38bdf8, 3.5, 80);
    cyanLight.position.set(0, 25, 20);
    scene.add(cyanLight);

    const violetLight = new THREE.PointLight(0x818cf8, 3, 60);
    violetLight.position.set(-20, -15, -10);
    scene.add(violetLight);

    const emeraldLight = new THREE.PointLight(0x34d399, 2.5, 50);
    emeraldLight.position.set(20, -10, 15);
    scene.add(emeraldLight);

    const masterGroup = new THREE.Group();
    scene.add(masterGroup);

    // 1. 3D Calabi-Yau 10D Manifold Wireframe (Torus Knot K_10 Projection)
    const cyGroup = new THREE.Group();
    const torusKnotGeo = new THREE.TorusKnotGeometry(10, 3, 120, 24, 2, 3);
    const torusKnotMat = new THREE.MeshStandardMaterial({
      color: isContinuumZeroized ? 0x475569 : 0x38bdf8,
      wireframe: true,
      roughness: 0.15,
      metalness: 0.9,
      emissive: isContinuumZeroized ? 0x0f172a : 0x0284c7,
      emissiveIntensity: isContinuumZeroized ? 0.05 : 0.7,
    });
    const cyMesh = new THREE.Mesh(torusKnotGeo, torusKnotMat);
    cyGroup.add(cyMesh);

    // Inner Secondary Calabi-Yau Compactification Cross-Section
    const innerKnotGeo = new THREE.TorusKnotGeometry(6, 1.8, 80, 16, 3, 5);
    const innerKnotMat = new THREE.MeshBasicMaterial({
      color: isContinuumZeroized ? 0x334155 : 0x818cf8,
      wireframe: true,
      transparent: true,
      opacity: isContinuumZeroized ? 0.1 : 0.5,
    });
    const innerMesh = new THREE.Mesh(innerKnotGeo, innerKnotMat);
    cyGroup.add(innerMesh);

    masterGroup.add(cyGroup);

    // 2. GHZ Non-Local Wavefunction Particle Nodes (16-Particle Entangled Swarm)
    const ghzGroup = new THREE.Group();
    const nodeCount = 16;
    const nodeMeshes: THREE.Mesh[] = [];
    const nodeGeo = new THREE.SphereGeometry(0.55, 12, 12);
    const nodeMat = new THREE.MeshBasicMaterial({
      color: isContinuumZeroized ? 0x64748b : ghzLocked ? 0x34d399 : 0xef4444,
    });

    for (let i = 0; i < nodeCount; i++) {
      const theta = (i / nodeCount) * Math.PI * 2;
      const mesh = new THREE.Mesh(nodeGeo, nodeMat);
      mesh.position.set(Math.cos(theta) * 16, Math.sin(theta * 2) * 5, Math.sin(theta) * 16);
      ghzGroup.add(mesh);
      nodeMeshes.push(mesh);
    }
    masterGroup.add(ghzGroup);

    // 3. Cosmic Vacuum Polarization Energy Flux Ring Halo
    const haloGeo = new THREE.RingGeometry(18, 19.5, 64);
    const haloMat = new THREE.MeshBasicMaterial({
      color: isContinuumZeroized ? 0x1e293b : 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: isContinuumZeroized ? 0.05 : 0.35,
    });
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    haloMesh.rotation.x = Math.PI / 2;
    masterGroup.add(haloMesh);

    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      if (!isContinuumZeroized) {
        cyGroup.rotation.y += 0.004;
        cyGroup.rotation.x += 0.002;
        innerMesh.rotation.y -= 0.006;
        innerMesh.rotation.z += 0.003;
        ghzGroup.rotation.y += 0.003;

        // Wavefunction orbital pulse
        for (let i = 0; i < nodeCount; i++) {
          const mesh = nodeMeshes[i];
          const theta = (i / nodeCount) * Math.PI * 2 + elapsed * 0.4;
          mesh.position.x = Math.cos(theta) * 16;
          mesh.position.y = Math.sin(theta * 3 + elapsed) * 6;
          mesh.position.z = Math.sin(theta) * 16;
        }

        haloMesh.rotation.z += 0.002;
      } else {
        // Post-zeroization freeze & slow decay drift
        cyGroup.rotation.y += 0.0003;
        cyGroup.rotation.x += 0.0002;
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      const newW = containerRef.current.clientWidth;
      const newH = containerRef.current.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      torusKnotGeo.dispose();
      torusKnotMat.dispose();
      innerKnotGeo.dispose();
      innerKnotMat.dispose();
      nodeGeo.dispose();
      nodeMat.dispose();
      haloGeo.dispose();
      haloMat.dispose();
      renderer.dispose();
    };
  }, [eulerCharacteristic, ghzLocked, powerDensity, isContinuumZeroized]);

  return (
    <div className="w-full h-96 rounded-xl overflow-hidden border border-sky-500/30 relative bg-[#010104] shadow-2xl shadow-sky-950/40">
      {/* Top HUD Status Banner directly adhering to suggestion-v14.md Section 6.3 */}
      <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur-md p-2.5 rounded-lg border border-sky-500/20 text-sky-400 text-xs font-mono shadow-lg flex items-center gap-3">
        <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-ping inline-block" />
        <span>
          OMNI-EXISTENTIAL CONTINUUM — CALABI-YAU 10D MANIFOLD K_10 | GHZ STATE LOCK:{' '}
          {isContinuumZeroized ? (
            <span className="text-red-400 font-bold">DECOUPLED</span>
          ) : ghzLocked ? (
            <span className="text-emerald-400 font-bold">ACTIVE (N=16)</span>
          ) : (
            <span className="text-amber-400 font-bold">PERTURBED</span>
          )}{' '}
          | VACUUM POWER: {isContinuumZeroized ? '0.0 W/cm³' : '1.85 × 10¹⁸ W/cm³'}
        </span>
      </div>

      {/* Metric Overlay HUD */}
      <div className="absolute bottom-4 right-4 z-10 bg-slate-900/85 backdrop-blur-md p-3 rounded-lg border border-sky-500/20 text-xs font-mono flex gap-4 text-slate-300">
        <div>
          <span className="text-slate-400 block text-[10px]">EULER INVARIANT:</span>
          <span className="text-sky-300 font-bold">{isContinuumZeroized ? '0' : `χ(K₁₀) = ${eulerCharacteristic}`}</span>
        </div>
        <div>
          <span className="text-slate-400 block text-[10px]">HODGE PAIR:</span>
          <span className="text-indigo-300 font-bold">{isContinuumZeroized ? 'NULL' : '(h¹¹, h²¹) = (217, 1)'}</span>
        </div>
        <div>
          <span className="text-slate-400 block text-[10px]">THERMAL ENTROPY:</span>
          <span className="text-emerald-300 font-bold">ΔS = 0.0 J/K</span>
        </div>
      </div>

      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
    </div>
  );
};

export default CalabiYauContinuum3D;
