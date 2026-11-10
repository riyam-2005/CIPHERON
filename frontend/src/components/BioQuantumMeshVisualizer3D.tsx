import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface BioQuantumMeshVisualizer3DProps {
  quantumLocked?: boolean;
  photonicIntensityMv?: number;
  saccadeFreqHz?: number;
  membranePotentialMv?: number;
  dnaCodonStrand?: string;
}

export const BioQuantumMeshVisualizer3D: React.FC<BioQuantumMeshVisualizer3DProps> = ({
  quantumLocked = true,
  photonicIntensityMv = 1650.0,
  saccadeFreqHz = 42.0,
  membranePotentialMv = -25.0,
  dnaCodonStrand = 'ACGTACGT'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const quiverRef = useRef<number>(0);

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight || 384;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x02040a); // Deep bio-quantum dark space

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 10, 22);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // 3D Bio-Quantum Neural Mesh & DNA Lattice Root Group
    const bqGroup = new THREE.Group();

    // 1. 3D Bio-Quantum Outer Icosahedron Mesh (Directly adhering to Section 5.3)
    const meshGeo = new THREE.IcosahedronGeometry(5, 3);
    const meshMat = new THREE.MeshBasicMaterial({
      color: quantumLocked ? 0x06b6d4 : 0x475569,
      wireframe: true,
      transparent: true,
      opacity: 0.85
    });
    const meshSphere = new THREE.Mesh(meshGeo, meshMat);
    bqGroup.add(meshSphere);

    // 2. Inner Quantum Dot Optoelectronic Core
    const coreGeo = new THREE.IcosahedronGeometry(3.6, 2);
    const coreMat = new THREE.MeshBasicMaterial({
      color: quantumLocked ? 0x10b981 : 0x334155,
      wireframe: true,
      transparent: true,
      opacity: 0.4
    });
    const coreSphere = new THREE.Mesh(coreGeo, coreMat);
    bqGroup.add(coreSphere);

    // 3. Central Double-Helix DNA Synaptic Lattice
    const dnaGroup = new THREE.Group();
    const dnaSteps = 40;
    const helixRadius = 1.6;
    const helixHeight = 7.0;

    for (let i = 0; i < dnaSteps; i++) {
      const t = (i / dnaSteps) * Math.PI * 4;
      const y = ((i / dnaSteps) - 0.5) * helixHeight;
      const x1 = Math.cos(t) * helixRadius;
      const z1 = Math.sin(t) * helixRadius;
      const x2 = Math.cos(t + Math.PI) * helixRadius;
      const z2 = Math.sin(t + Math.PI) * helixRadius;

      // Base pair nodes
      const n1Geo = new THREE.SphereGeometry(0.12, 8, 8);
      const n1Mat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
      const n1 = new THREE.Mesh(n1Geo, n1Mat);
      n1.position.set(x1, y, z1);
      dnaGroup.add(n1);

      const n2Geo = new THREE.SphereGeometry(0.12, 8, 8);
      const n2Mat = new THREE.MeshBasicMaterial({ color: 0xf43f5e });
      const n2 = new THREE.Mesh(n2Geo, n2Mat);
      n2.position.set(x2, y, z2);
      dnaGroup.add(n2);

      // Hydrogen bond rung connector
      if (i % 2 === 0) {
        const lineGeo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(x1, y, z1),
          new THREE.Vector3(x2, y, z2)
        ]);
        const lineMat = new THREE.LineBasicMaterial({
          color: 0x67e8f9,
          transparent: true,
          opacity: 0.6
        });
        const rung = new THREE.Line(lineGeo, lineMat);
        dnaGroup.add(rung);
      }
    }
    bqGroup.add(dnaGroup);

    // 4. Quantum Dot Optical Resonator Luminescent Emitters (CdSe/ZnS ~ 525nm)
    const qdCount = 90;
    const qdPos = new Float32Array(qdCount * 3);
    for (let i = 0; i < qdCount * 3; i += 3) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 5.2 + Math.random() * 2.0;
      qdPos[i] = r * Math.sin(phi) * Math.cos(theta);
      qdPos[i + 1] = r * Math.sin(phi) * Math.sin(theta);
      qdPos[i + 2] = r * Math.cos(phi);
    }
    const qdGeo = new THREE.BufferGeometry();
    qdGeo.setAttribute('position', new THREE.BufferAttribute(qdPos, 3));
    const qdMat = new THREE.PointsMaterial({
      color: 0x34d399,
      size: 0.16,
      transparent: true,
      opacity: 0.75
    });
    const qdPoints = new THREE.Points(qdGeo, qdMat);
    bqGroup.add(qdPoints);

    // 5. Micro-Saccade Quiver Wavefront Indicator
    const saccadeRingGeo = new THREE.RingGeometry(0.2, 0.45, 32);
    const saccadeRingMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8
    });
    const saccadeRing = new THREE.Mesh(saccadeRingGeo, saccadeRingMat);
    saccadeRing.position.set(0, 0, 5.2);
    bqGroup.add(saccadeRing);

    scene.add(bqGroup);

    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      // Section 5.3 specifications: rotation speeds
      bqGroup.rotation.y += 0.006;
      bqGroup.rotation.x += 0.003;

      // Rotate DNA double helix around vertical axis
      dnaGroup.rotation.y += 0.015;

      // Micro-saccadic quiver oscillation (20-60 Hz simulation)
      quiverRef.current += 0.08;
      const quiverAmp = Math.sin(quiverRef.current * (saccadeFreqHz / 10.0)) * 0.08;
      meshSphere.position.x = quiverAmp;

      // Expanding micro-saccade optical ripple
      const ringScale = 1.0 + (quiverRef.current % 3.0);
      saccadeRing.scale.set(ringScale, ringScale, ringScale);
      (saccadeRing.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 1.0 - (ringScale / 3.5));

      qdPoints.rotation.y -= 0.002;
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight || 384;
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
      meshGeo.dispose();
      meshMat.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      qdGeo.dispose();
      qdMat.dispose();
      saccadeRingGeo.dispose();
      saccadeRingMat.dispose();
    };
  }, [quantumLocked, saccadeFreqHz]);

  return (
    <div className="w-full h-96 rounded-xl overflow-hidden border border-cyan-500/30 relative bg-[#02040a] shadow-2xl shadow-cyan-950/20">
      {/* Top Left HUD Status (Directly adhering to Section 5.3) */}
      <div className="absolute top-4 left-4 z-10 bg-slate-900/85 backdrop-blur-md px-3 py-2 rounded-lg border border-cyan-500/40 text-cyan-400 text-xs font-mono shadow-lg flex items-center space-x-3">
        <div className={`w-2.5 h-2.5 rounded-full ${quantumLocked ? 'bg-cyan-400 animate-ping' : 'bg-slate-500'}`} />
        <span>
          BIO-QUANTUM MESH V23.0 — QUANTUM DOTS: {quantumLocked ? 'ACTIVE' : 'IDLE'} | DNA CODON DENSITY: 215 PB/G | SACCADE FREQ: {saccadeFreqHz.toFixed(0)} Hz
        </span>
      </div>

      {/* Top Right Channel Metrics */}
      <div className="absolute top-4 right-4 z-10 hidden sm:flex items-center space-x-2 bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/60 text-xs font-mono text-slate-300">
        <span className="text-emerald-400 font-bold">QD Emission: 525 nm</span>
        <span className="text-slate-600">|</span>
        <span className="text-cyan-300">Photonic: {photonicIntensityMv.toFixed(1)} mV</span>
        <span className="text-slate-600">|</span>
        <span className="text-pink-400">V_membrane: {membranePotentialMv.toFixed(1)} mV</span>
      </div>

      {/* 3D Canvas Mount Point */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Bottom Center Legend */}
      <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 z-10 flex items-center space-x-4 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-full border border-slate-800 text-[11px] font-mono text-slate-400">
        <span className="flex items-center space-x-1">
          <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" />
          <span>Icosahedron Mesh (5,3)</span>
        </span>
        <span className="flex items-center space-x-1">
          <span className="w-2 h-2 rounded-full bg-pink-500 inline-block" />
          <span>DNA Double-Helix</span>
        </span>
        <span className="flex items-center space-x-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
          <span>CdSe/ZnS Quantum Dots</span>
        </span>
        <span className="flex items-center space-x-1">
          <span className="w-2 h-2 rounded-full bg-sky-400 inline-block" />
          <span>20-60Hz Quiver Carrier</span>
        </span>
      </div>
    </div>
  );
};

export default BioQuantumMeshVisualizer3D;
