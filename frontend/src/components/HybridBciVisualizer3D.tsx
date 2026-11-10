import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface HybridBciVisualizer3DProps {
  intentLocked?: boolean;
  p300AmplitudeUv?: number;
  gazeDirection?: 'CENTER' | 'LEFT' | 'RIGHT' | 'UP' | 'DOWN';
  cognitiveEntropyBits?: number;
  erdBetaRatio?: number;
}

export const HybridBciVisualizer3D: React.FC<HybridBciVisualizer3DProps> = ({
  intentLocked = true,
  p300AmplitudeUv = 18.5,
  gazeDirection = 'RIGHT',
  cognitiveEntropyBits = 7.92,
  erdBetaRatio = 1.48
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const pulseRef = useRef<number>(0);

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight || 384;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617); // Dark cybernetic slate background

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 8, 18);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // BCI Visualizer Root Group
    const bciGroup = new THREE.Group();

    // 1. 3D Brain Mesh Wireframe Representation (Directly adhering to Section 5.3)
    const brainGeo = new THREE.IcosahedronGeometry(4, 2);
    const brainMat = new THREE.MeshBasicMaterial({
      color: intentLocked ? 0xa855f7 : 0x64748b,
      wireframe: true,
      transparent: true,
      opacity: 0.85
    });
    const brainMesh = new THREE.Mesh(brainGeo, brainMat);
    bciGroup.add(brainMesh);

    // 2. Inner Cortical Core Glow
    const innerGeo = new THREE.IcosahedronGeometry(3.2, 1);
    const innerMat = new THREE.MeshBasicMaterial({
      color: intentLocked ? 0xd946ef : 0x475569,
      wireframe: true,
      transparent: true,
      opacity: 0.35
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    bciGroup.add(innerMesh);

    // 3. Synaptic Electrodes (Fz, Cz, Pz, EOG Temples)
    const electrodePoints: { name: string; pos: [number, number, number]; color: number }[] = [
      { name: 'Fz', pos: [0, 3.8, 1.8], color: 0x00e5ff },
      { name: 'Cz', pos: [0, 4.1, 0], color: 0xa855f7 },
      { name: 'Pz', pos: [0, 3.6, -2.0], color: 0xff007f },
      { name: 'EOG_L', pos: [-2.2, 0.5, 3.6], color: 0x10b981 },
      { name: 'EOG_R', pos: [2.2, 0.5, 3.6], color: 0x10b981 }
    ];

    const electrodeGroup = new THREE.Group();
    electrodePoints.forEach((ep) => {
      const geo = new THREE.SphereGeometry(0.28, 16, 16);
      const mat = new THREE.MeshBasicMaterial({ color: ep.color });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(...ep.pos);
      electrodeGroup.add(mesh);

      // Halo ring around each electrode
      const ringGeo = new THREE.RingGeometry(0.35, 0.45, 16);
      const ringMat = new THREE.MeshBasicMaterial({
        color: ep.color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.set(...ep.pos);
      ringMesh.lookAt(0, 0, 0);
      electrodeGroup.add(ringMesh);
    });
    bciGroup.add(electrodeGroup);

    // 4. Gaze Direction Vector Pointer
    const gazeDirVec = new THREE.Vector3(0, 0, 1);
    if (gazeDirection === 'RIGHT') gazeDirVec.set(1.5, 0, 1).normalize();
    else if (gazeDirection === 'LEFT') gazeDirVec.set(-1.5, 0, 1).normalize();
    else if (gazeDirection === 'UP') gazeDirVec.set(0, 1.5, 1).normalize();
    else if (gazeDirection === 'DOWN') gazeDirVec.set(0, -1.5, 1).normalize();

    const gazeArrow = new THREE.ArrowHelper(
      gazeDirVec,
      new THREE.Vector3(0, 0, 4.2),
      5,
      0x00e5ff,
      1.0,
      0.5
    );
    bciGroup.add(gazeArrow);

    // 5. P300 Expanding Cortical Wavefront
    const waveGeo = new THREE.RingGeometry(0.1, 0.3, 32);
    const waveMat = new THREE.MeshBasicMaterial({
      color: 0xff007f,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9
    });
    const waveMesh = new THREE.Mesh(waveGeo, waveMat);
    waveMesh.position.set(0, 3.6, -2.0); // Originating at Pz electrode
    waveMesh.lookAt(0, 10, -2.0);
    bciGroup.add(waveMesh);

    // 6. Ambient Neural Particle Synapses
    const particleCount = 120;
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 4.2 + Math.random() * 2.5;
      particlePositions[i] = r * Math.sin(phi) * Math.cos(theta);
      particlePositions[i + 1] = r * Math.sin(phi) * Math.sin(theta);
      particlePositions[i + 2] = r * Math.cos(phi);
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xc084fc,
      size: 0.12,
      transparent: true,
      opacity: 0.65
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    bciGroup.add(particles);

    scene.add(bciGroup);

    // Animation Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      // Rotation as per specification
      bciGroup.rotation.y += 0.005;
      bciGroup.rotation.x += 0.002;

      // Animate P300 pulse wavefront
      if (intentLocked) {
        pulseRef.current += 0.06;
        const scale = 1.0 + (pulseRef.current % 4.0);
        waveMesh.scale.set(scale, scale, scale);
        (waveMesh.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 1.0 - (scale / 5.0));
      } else {
        waveMesh.scale.set(0.1, 0.1, 0.1);
        (waveMesh.material as THREE.MeshBasicMaterial).opacity = 0;
      }

      particles.rotation.y -= 0.003;
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
      brainGeo.dispose();
      brainMat.dispose();
      innerGeo.dispose();
      innerMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      waveGeo.dispose();
      waveMat.dispose();
    };
  }, [intentLocked, gazeDirection]);

  return (
    <div className="w-full h-96 rounded-xl overflow-hidden border border-purple-500/30 relative bg-slate-950/80 shadow-2xl shadow-purple-950/20">
      {/* Top Left Status HUD */}
      <div className="absolute top-4 left-4 z-10 bg-slate-900/85 backdrop-blur-md px-3 py-2 rounded-lg border border-purple-500/40 text-purple-300 text-xs font-mono shadow-lg flex items-center space-x-3">
        <div className={`w-2.5 h-2.5 rounded-full ${intentLocked ? 'bg-pink-500 animate-ping' : 'bg-slate-500'}`} />
        <span>
          HYBRID BCI V22.0 — EEG P300: {intentLocked ? 'LOCKED' : 'MONITORING'} | EOG TRACKER: {gazeDirection} | COGNITIVE ENTROPY: {cognitiveEntropyBits.toFixed(2)} BITS/SAMPLE
        </span>
      </div>

      {/* Top Right Channel Metrics */}
      <div className="absolute top-4 right-4 z-10 hidden sm:flex items-center space-x-2 bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/60 text-xs font-mono text-slate-300">
        <span className="text-pink-400 font-bold">Pz (GPIO 36): {p300AmplitudeUv.toFixed(1)} &mu;V</span>
        <span className="text-slate-600">|</span>
        <span className="text-cyan-400">ERD &beta;/&alpha;: {erdBetaRatio.toFixed(2)}</span>
      </div>

      {/* 3D Canvas Mount Point */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Bottom Center Legend */}
      <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 z-10 flex items-center space-x-4 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-full border border-slate-800 text-[11px] font-mono text-slate-400">
        <span className="flex items-center space-x-1">
          <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" />
          <span>Fz Frontal</span>
        </span>
        <span className="flex items-center space-x-1">
          <span className="w-2 h-2 rounded-full bg-purple-400 inline-block" />
          <span>Cz Central</span>
        </span>
        <span className="flex items-center space-x-1">
          <span className="w-2 h-2 rounded-full bg-pink-500 inline-block" />
          <span>Pz Parietal (P300)</span>
        </span>
        <span className="flex items-center space-x-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
          <span>EOG Horizontal</span>
        </span>
      </div>
    </div>
  );
};

export default HybridBciVisualizer3D;
