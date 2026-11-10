import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface MultiverseSingularity3DProps {
  alephRank?: string;
  ghzLocked?: boolean;
  powerDensity?: number;
  isTransfiniteZeroized?: boolean;
}

export const MultiverseSingularity3D: React.FC<MultiverseSingularity3DProps> = ({
  alephRank = '0xFFFFFFFFFFFFFFFF',
  ghzLocked = true,
  powerDensity = 2.45e24,
  isTransfiniteZeroized = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth || 800;
    const height = containerRef.current.clientHeight || 400;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x010103);

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 22, 44);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // Dynamic Illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
    scene.add(ambientLight);

    const indigoLight = new THREE.PointLight(0x818cf8, 4.0, 90);
    indigoLight.position.set(0, 25, 20);
    scene.add(indigoLight);

    const fuchsiaLight = new THREE.PointLight(0xd946ef, 3.5, 70);
    fuchsiaLight.position.set(-22, -15, -12);
    scene.add(fuchsiaLight);

    const emeraldLight = new THREE.PointLight(0x10b981, 3.0, 60);
    emeraldLight.position.set(22, -12, 16);
    scene.add(emeraldLight);

    const masterGroup = new THREE.Group();
    scene.add(masterGroup);

    // 1. 3D Trans-Finite Multiverse Torus (M_aleph_0 Hyperspace)
    const mvGroup = new THREE.Group();
    const torusGeo = new THREE.TorusGeometry(12, 4, 32, 200);
    const torusMat = new THREE.MeshStandardMaterial({
      color: isTransfiniteZeroized ? 0x475569 : 0x818cf8,
      wireframe: true,
      roughness: 0.1,
      metalness: 0.95,
      emissive: isTransfiniteZeroized ? 0x0f172a : 0x4338ca,
      emissiveIntensity: isTransfiniteZeroized ? 0.05 : 0.8,
    });
    const mvMesh = new THREE.Mesh(torusGeo, torusMat);
    mvGroup.add(mvMesh);

    // 2. Inner Quantum Singularity Core (QCD Condensate Nucleus)
    const coreGeo = new THREE.IcosahedronGeometry(5.5, 3);
    const coreMat = new THREE.MeshBasicMaterial({
      color: isTransfiniteZeroized ? 0x334155 : 0xd946ef,
      wireframe: true,
      transparent: true,
      opacity: isTransfiniteZeroized ? 0.08 : 0.65,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    mvGroup.add(coreMesh);

    masterGroup.add(mvGroup);

    // 3. Continuous Infinite-Node GHZ-Cluster Particle Ring Swarm
    const clusterGroup = new THREE.Group();
    const particleCount = 24;
    const particleGeo = new THREE.SphereGeometry(0.45, 10, 10);
    const particleMat = new THREE.MeshBasicMaterial({
      color: isTransfiniteZeroized ? 0x64748b : ghzLocked ? 0x10b981 : 0xef4444,
    });

    const particles: THREE.Mesh[] = [];
    for (let i = 0; i < particleCount; i++) {
      const theta = (i / particleCount) * Math.PI * 2;
      const mesh = new THREE.Mesh(particleGeo, particleMat);
      mesh.position.set(Math.cos(theta) * 20, Math.sin(theta * 2) * 6, Math.sin(theta) * 20);
      clusterGroup.add(mesh);
      particles.push(mesh);
    }
    masterGroup.add(clusterGroup);

    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      if (!isTransfiniteZeroized) {
        mvGroup.rotation.y += 0.005;
        mvGroup.rotation.x += 0.003;
        coreMesh.rotation.y -= 0.008;
        coreMesh.rotation.z += 0.004;
        clusterGroup.rotation.y += 0.0025;

        for (let i = 0; i < particleCount; i++) {
          const mesh = particles[i];
          const theta = (i / particleCount) * Math.PI * 2 + elapsed * 0.35;
          mesh.position.x = Math.cos(theta) * 20;
          mesh.position.y = Math.sin(theta * 3 + elapsed) * 7;
          mesh.position.z = Math.sin(theta) * 20;
        }
      } else {
        mvGroup.rotation.y += 0.0003;
        mvGroup.rotation.x += 0.0002;
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
      torusGeo.dispose();
      torusMat.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      renderer.dispose();
    };
  }, [alephRank, ghzLocked, powerDensity, isTransfiniteZeroized]);

  return (
    <div className="w-full h-96 rounded-xl overflow-hidden border border-indigo-500/30 relative bg-[#010103] shadow-2xl shadow-indigo-950/40">
      {/* Top HUD Banner adhering to suggestion-v15.md Section 6.3 */}
      <div className="absolute top-4 left-4 z-10 bg-slate-900/85 backdrop-blur-md p-2.5 rounded-lg border border-indigo-500/20 text-indigo-400 text-xs font-mono shadow-lg flex items-center gap-3">
        <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-ping inline-block" />
        <span>
          OMNI-COSMOLOGICAL CONTINUUM — TRANS-FINITE HILBERT-ALEPH MANIFOLD M_aleph_0 | GHZ-CLUSTER LOCK:{' '}
          {isTransfiniteZeroized ? (
            <span className="text-red-400 font-bold">DECOUPLED</span>
          ) : ghzLocked ? (
            <span className="text-emerald-400 font-bold">ACTIVE (1,000,000 NODES)</span>
          ) : (
            <span className="text-amber-400 font-bold">COLLAPSED</span>
          )}{' '}
          | POWER: {isTransfiniteZeroized ? '0.0 W/cm³' : '2.45 × 10²⁴ W/cm³'}
        </span>
      </div>

      {/* Bottom Metric HUD */}
      <div className="absolute bottom-4 right-4 z-10 bg-slate-900/85 backdrop-blur-md p-3 rounded-lg border border-indigo-500/20 text-xs font-mono flex gap-4 text-slate-300">
        <div>
          <span className="text-slate-400 block text-[10px]">ORDINAL RANK:</span>
          <span className="text-indigo-300 font-bold">{isTransfiniteZeroized ? 'NULL' : 'MAX (ℵ₀)'}</span>
        </div>
        <div>
          <span className="text-slate-400 block text-[10px]">COHOMOLOGY:</span>
          <span className="text-fuchsia-300 font-bold">{isTransfiniteZeroized ? '0.00' : 'H^α = 1.618034'}</span>
        </div>
        <div>
          <span className="text-slate-400 block text-[10px]">QCD CONDENSATE:</span>
          <span className="text-emerald-300 font-bold">{isTransfiniteZeroized ? '0.0 GeV⁴' : '0.012 GeV⁴'}</span>
        </div>
      </div>

      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
    </div>
  );
};

export default MultiverseSingularity3D;
