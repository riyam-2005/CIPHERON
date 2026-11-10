import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Dna, Atom, Layers, RotateCw, Pause, Play, Sparkles } from 'lucide-react';

interface QuantumDnaVisualizerProps {
  dnaSequence?: string;
  chshValue?: number;
  mode?: 'DNA_HELIX' | 'QUANTUM_BLOCH';
}

export const QuantumDnaVisualizer: React.FC<QuantumDnaVisualizerProps> = ({
  dnaSequence = 'ACGTACGTGCAATGCTAGCTAGCTAGCTAGCT',
  chshValue = 2.828,
  mode: initialMode = 'DNA_HELIX'
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [activeVisualMode, setActiveVisualMode] = useState<'DNA_HELIX' | 'QUANTUM_BLOCH'>(initialMode);
  const [isRotating, setIsRotating] = useState(true);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight || 380;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x05070f);

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 4, 18);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.innerHTML = '';
    mountRef.current.appendChild(renderer.domElement);

    // Ambient and Directional Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x38bdf8, 1.5);
    dirLight1.position.set(10, 15, 10);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xa855f7, 1.2);
    dirLight2.position.set(-10, -10, -10);
    scene.add(dirLight2);

    const masterGroup = new THREE.Group();
    scene.add(masterGroup);

    if (activeVisualMode === 'DNA_HELIX') {
      // 1. Build DNA Double Helix
      const sphereGeo = new THREE.SphereGeometry(0.35, 16, 16);
      const bondGeo = new THREE.CylinderGeometry(0.06, 0.06, 1, 8);

      // Nucleotide materials: A=Blue, T=Red, C=Green, G=Amber
      const matA = new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.2, metalness: 0.8, emissive: 0x1d4ed8, emissiveIntensity: 0.3 });
      const matT = new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.2, metalness: 0.8, emissive: 0xbe123c, emissiveIntensity: 0.3 });
      const matC = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.2, metalness: 0.8, emissive: 0x047857, emissiveIntensity: 0.3 });
      const matG = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.2, metalness: 0.8, emissive: 0xb45309, emissiveIntensity: 0.3 });
      const bondMat = new THREE.MeshBasicMaterial({ color: 0x64748b, transparent: true, opacity: 0.6 });

      const count = Math.min(Math.max(dnaSequence.length, 30), 50);
      for (let i = 0; i < count; i++) {
        const char = dnaSequence[i % dnaSequence.length] || 'A';
        const angle = i * 0.35;
        const y = (i - count / 2) * 0.45;
        const radius = 3.2;

        const x1 = Math.cos(angle) * radius;
        const z1 = Math.sin(angle) * radius;
        const x2 = Math.cos(angle + Math.PI) * radius;
        const z2 = Math.sin(angle + Math.PI) * radius;

        // Base 1
        const mat1 = char === 'A' ? matA : char === 'T' ? matT : char === 'C' ? matC : matG;
        const mesh1 = new THREE.Mesh(sphereGeo, mat1);
        mesh1.position.set(x1, y, z1);
        masterGroup.add(mesh1);

        // Complementary Base 2: A-T, C-G
        const compChar = char === 'A' ? 'T' : char === 'T' ? 'A' : char === 'C' ? 'G' : 'C';
        const mat2 = compChar === 'A' ? matA : compChar === 'T' ? matT : compChar === 'C' ? matC : matG;
        const mesh2 = new THREE.Mesh(sphereGeo, mat2);
        mesh2.position.set(x2, y, z2);
        masterGroup.add(mesh2);

        // Hydrogen Bond Rung between base pairs
        const p1 = new THREE.Vector3(x1, y, z1);
        const p2 = new THREE.Vector3(x2, y, z2);
        const bondMesh = new THREE.Mesh(bondGeo, bondMat);
        bondMesh.position.copy(p1).add(p2).multiplyScalar(0.5);
        bondMesh.scale.set(1, p1.distanceTo(p2), 1);
        bondMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), p2.clone().sub(p1).normalize());
        masterGroup.add(bondMesh);
      }
    } else {
      // 2. Build Quantum Photonic Bloch Sphere & Entanglement Wireframe
      const sphereWireGeo = new THREE.SphereGeometry(4.5, 24, 24);
      const wireMat = new THREE.MeshBasicMaterial({ color: 0x0284c7, wireframe: true, transparent: true, opacity: 0.35 });
      const sphereMesh = new THREE.Mesh(sphereWireGeo, wireMat);
      masterGroup.add(sphereMesh);

      // Coordinate axes
      const axesGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-6, 0, 0), new THREE.Vector3(6, 0, 0),
        new THREE.Vector3(0, -6, 0), new THREE.Vector3(0, 6, 0),
        new THREE.Vector3(0, 0, -6), new THREE.Vector3(0, 0, 6)
      ]);
      const axesMat = new THREE.LineBasicMaterial({ color: 0x475569, transparent: true, opacity: 0.5 });
      const axesLine = new THREE.LineSegments(axesGeo, axesMat);
      masterGroup.add(axesLine);

      // Entangled Twin Photon Vectors (Alice & Bob)
      const photonGeo = new THREE.SphereGeometry(0.4, 16, 16);
      const photonMatA = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.8 });
      const photonMatB = new THREE.MeshStandardMaterial({ color: 0xa855f7, emissive: 0x7e22ce, emissiveIntensity: 0.8 });

      const photonA = new THREE.Mesh(photonGeo, photonMatA);
      photonA.position.set(2.8, 3.2, 1.5);
      masterGroup.add(photonA);

      const photonB = new THREE.Mesh(photonGeo, photonMatB);
      photonB.position.set(-2.8, -3.2, -1.5);
      masterGroup.add(photonB);

      // Entanglement Bell Link Line
      const bellLineGeo = new THREE.BufferGeometry().setFromPoints([photonA.position, photonB.position]);
      const bellLineMat = new THREE.LineBasicMaterial({ color: 0x00e5ff, linewidth: 2 });
      const bellLine = new THREE.Line(bellLineGeo, bellLineMat);
      masterGroup.add(bellLine);
    }

    // Animation Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (isRotating) {
        masterGroup.rotation.y += 0.008;
        if (activeVisualMode === 'QUANTUM_BLOCH') {
          masterGroup.rotation.x += 0.003;
        }
      }
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight || 380;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
      renderer.dispose();
      if (mountRef.current) {
        mountRef.current.innerHTML = '';
      }
    };
  }, [dnaSequence, chshValue, activeVisualMode, isRotating]);

  return (
    <div className="relative w-full h-[400px] bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      {/* 3D WebGL Canvas */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Banner Overlay */}
      <div className="absolute top-3 left-3 flex items-center space-x-2 bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/60 text-xs font-mono">
        {activeVisualMode === 'DNA_HELIX' ? (
          <>
            <Dna className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-slate-300">DNA Provenance Archive</span>
            <span className="text-slate-500">|</span>
            <span className="text-emerald-400 font-bold">215 PB / gram</span>
          </>
        ) : (
          <>
            <Atom className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-300">QKD Photonic Bloch Sphere</span>
            <span className="text-slate-500">|</span>
            <span className="text-cyan-400 font-bold">S = {chshValue.toFixed(3)}</span>
          </>
        )}
      </div>

      {/* Top Controls */}
      <div className="absolute top-3 right-3 flex items-center space-x-2">
        <button
          onClick={() => setActiveVisualMode(activeVisualMode === 'DNA_HELIX' ? 'QUANTUM_BLOCH' : 'DNA_HELIX')}
          className="px-3 py-1 text-xs font-mono rounded-lg border bg-slate-900/80 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/20 transition-all flex items-center gap-1.5"
        >
          {activeVisualMode === 'DNA_HELIX' ? <Atom className="w-3.5 h-3.5" /> : <Dna className="w-3.5 h-3.5" />}
          <span>{activeVisualMode === 'DNA_HELIX' ? 'Switch to QKD Bloch' : 'Switch to DNA Helix'}</span>
        </button>

        <button
          onClick={() => setIsRotating(!isRotating)}
          className={`p-1.5 rounded-lg border text-xs transition-all ${
            isRotating
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/30'
              : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
          }`}
          title={isRotating ? 'Pause Rotation' : 'Resume Rotation'}
        >
          {isRotating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Bottom Legend */}
      <div className="absolute bottom-3 left-3 flex flex-wrap items-center gap-3 bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-mono">
        {activeVisualMode === 'DNA_HELIX' ? (
          <>
            <div className="flex items-center space-x-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span className="text-slate-300">Adenine (00)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span className="text-slate-300">Thymine (11)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-slate-300">Cytosine (01)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="text-slate-300">Guanine (10)</span>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center space-x-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              <span className="text-slate-300">Photon A (Alice)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-purple-400" />
              <span className="text-slate-300">Photon B (Bob)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <div className="w-3 h-0.5 bg-cyan-400" />
              <span className="text-emerald-400 font-bold">Bell State |Phi+&gt;</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default QuantumDnaVisualizer;
