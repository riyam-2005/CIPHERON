import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface HolographicSingularity3DProps {
  conformalDimension?: number;
  monomerCount?: number;
  casimirPowerDensity?: number;
  isVacuumDecayed?: boolean;
}

export const HolographicSingularity3D: React.FC<HolographicSingularity3DProps> = ({
  conformalDimension = 4.0,
  monomerCount = 1000000,
  casimirPowerDensity = 52.4,
  isVacuumDecayed = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth || 800;
    const height = containerRef.current.clientHeight || 400;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x010103);

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 16, 32);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // Dynamic Illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const cyanPointLight = new THREE.PointLight(0x06b6d4, 3, 70);
    cyanPointLight.position.set(0, 14, 14);
    scene.add(cyanPointLight);

    const violetPointLight = new THREE.PointLight(0xa855f7, 2.5, 60);
    violetPointLight.position.set(-18, -10, -12);
    scene.add(violetPointLight);

    const masterGroup = new THREE.Group();
    scene.add(masterGroup);

    // 1. 3D Holographic Boundary Singularity Sphere (AdS5 -> CFT4 Projection)
    const holoGroup = new THREE.Group();
    const sphereGeo = new THREE.IcosahedronGeometry(8.5, 3);
    const sphereMat = new THREE.MeshStandardMaterial({
      color: isVacuumDecayed ? 0x94a3b8 : 0x06b6d4,
      wireframe: true,
      roughness: 0.1,
      metalness: 0.9,
      emissive: isVacuumDecayed ? 0x0f172a : 0x0891b2,
      emissiveIntensity: isVacuumDecayed ? 0.1 : 0.6,
      transparent: true,
      opacity: isVacuumDecayed ? 0.2 : 0.85,
    });
    const singularityMesh = new THREE.Mesh(sphereGeo, sphereMat);
    holoGroup.add(singularityMesh);

    // Internal 5D Bulk Core
    const innerGeo = new THREE.SphereGeometry(3.5, 16, 16);
    const innerMat = new THREE.MeshBasicMaterial({
      color: isVacuumDecayed ? 0x334155 : 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: isVacuumDecayed ? 0.05 : 0.4,
    });
    const innerCore = new THREE.Mesh(innerGeo, innerMat);
    holoGroup.add(innerCore);

    masterGroup.add(holoGroup);

    // 2. Synthetic Bio-Molecular Peptide-Nanotube Crystalline Matrix
    const bioGroup = new THREE.Group();
    const peptideNodes: THREE.Mesh[] = [];
    const nodeGeo = new THREE.SphereGeometry(0.3, 10, 10);
    const nodeMat = new THREE.MeshStandardMaterial({
      color: isVacuumDecayed ? 0x475569 : 0x10b981,
      emissive: isVacuumDecayed ? 0x0f172a : 0x059669,
      emissiveIntensity: 0.5,
    });

    const peptideCount = isVacuumDecayed ? 50 : 28;
    for (let i = 0; i < peptideCount; i++) {
      const node = new THREE.Mesh(nodeGeo, nodeMat);
      if (isVacuumDecayed) {
        // Dispersed photon radiation
        node.position.set(
          (Math.random() - 0.5) * 40,
          (Math.random() - 0.5) * 35,
          (Math.random() - 0.5) * 40
        );
      } else {
        const theta = (i / peptideCount) * Math.PI * 2;
        const radius = 12.5 + Math.sin(i * 1.5) * 2;
        node.position.set(
          Math.cos(theta) * radius,
          (Math.sin(i * 3) - 0.5) * 5,
          Math.sin(theta) * radius
        );
      }
      bioGroup.add(node);
      peptideNodes.push(node);
    }
    masterGroup.add(bioGroup);

    // 3. Casimir Zero-Point Vacuum Fluctuation Standing Waves
    const casimirGroup = new THREE.Group();
    const ringGeo = new THREE.TorusGeometry(10.5, 0.08, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({
      color: isVacuumDecayed ? 0x334155 : 0xe0e7ff,
      transparent: true,
      opacity: isVacuumDecayed ? 0.05 : 0.7,
    });
    const ring1 = new THREE.Mesh(ringGeo, ringMat);
    ring1.rotation.x = Math.PI / 3;
    casimirGroup.add(ring1);

    const ring2 = new THREE.Mesh(ringGeo, ringMat);
    ring2.rotation.y = Math.PI / 4;
    casimirGroup.add(ring2);

    masterGroup.add(casimirGroup);

    // Animation Loop
    let animationFrameId: number;
    let t = 0;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      t += 0.01;

      if (!isVacuumDecayed) {
        holoGroup.rotation.y += 0.004;
        holoGroup.rotation.x += 0.002;
        innerCore.rotation.y -= 0.006;
        bioGroup.rotation.y += 0.003;
        ring1.rotation.z += 0.005;
        ring2.rotation.x += 0.004;

        // Pulse breathing effect
        const scale = 1 + Math.sin(t * 2) * 0.02;
        singularityMesh.scale.set(scale, scale, scale);
      } else {
        // Disintegration expansion into gamma background photons
        peptideNodes.forEach((node) => {
          node.position.x += (Math.random() - 0.5) * 0.08;
          node.position.y += (Math.random() - 0.5) * 0.08;
          node.position.z += (Math.random() - 0.5) * 0.08;
        });
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix;
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
      renderer.dispose();
    };
  }, [conformalDimension, monomerCount, casimirPowerDensity, isVacuumDecayed]);

  return (
    <div className="w-full h-96 rounded-xl overflow-hidden border border-cyan-500/30 relative bg-[#010103]">
      {/* Top Banner Overlay */}
      <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-cyan-500/40 text-cyan-300 text-xs font-mono flex items-center space-x-2">
          <span className={`w-2 h-2 rounded-full ${isVacuumDecayed ? 'bg-red-500 animate-ping' : 'bg-cyan-400 animate-pulse'}`} />
          <span>
            {isVacuumDecayed
              ? 'ZEROIZED: LOCAL QUANTUM VACUUM DECAY COMPLETE (<1ns MATTER DISSOLUTION)'
              : 'COSMIC OMNIPRESENCE — ADS/CFT HOLOGRAPHIC BOUNDARY COMPUTING (4D CFT)'}
          </span>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono">
          <div className="bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded border border-emerald-500/30 text-emerald-400">
            PEPTIDE MONOMERS: {monomerCount.toLocaleString()}
          </div>
          <div className="bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded border border-indigo-500/30 text-indigo-400">
            CASIMIR ZPE: {casimirPowerDensity.toFixed(1)} kW/cm³
          </div>
        </div>
      </div>

      {/* Status Footer Overlay */}
      <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center justify-between text-[11px] font-mono text-slate-400 pointer-events-none">
        <div className="bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded border border-cyan-500/20">
          AdS/CFT Boundary <span className="text-cyan-400 font-semibold">Δ = {conformalDimension.toFixed(1)}</span> | Non-Local Latency{' '}
          <span className="text-emerald-400 font-semibold">{isVacuumDecayed ? 'N/A' : '1.8 ns'}</span>
        </div>
        <div className="bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded border border-emerald-500/20">
          Substrate:{' '}
          <span className={`font-semibold ${isVacuumDecayed ? 'text-red-400' : 'text-emerald-400'}`}>
            {isVacuumDecayed ? 'VAPORIZED (0.0% RESIDUAL)' : 'SELF-ASSEMBLING PEPTIDE-NANOTUBE'}
          </span>
        </div>
      </div>

      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
    </div>
  );
};

export default HolographicSingularity3D;
