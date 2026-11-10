import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Orbit, Activity, Radio, Cpu, RefreshCw } from 'lucide-react';

interface VisualizerProps {
  mode?: 'ORBITAL_CONSTELLATION' | 'PHOTONIC_MZI_WAVEGUIDE';
  theta?: number;
  phi?: number;
  fsoThroughputGbps?: number;
}

export const OrbitalPhotonicVisualizer: React.FC<VisualizerProps> = ({
  mode = 'ORBITAL_CONSTELLATION',
  theta = 1.5708,
  phi = 0.7854,
  fsoThroughputGbps = 100
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeMode, setActiveMode] = useState<'ORBITAL_CONSTELLATION' | 'PHOTONIC_MZI_WAVEGUIDE'>(mode);
  const [isRotating, setIsRotating] = useState(true);

  useEffect(() => {
    setActiveMode(mode);
  }, [mode]);

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight || 400;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x02040a);

    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
    camera.position.set(0, 14, 30);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // Ambient and directional lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
    dirLight.position.set(20, 30, 20);
    scene.add(dirLight);

    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    let earthMesh: THREE.Mesh | null = null;
    let satGroup: THREE.Group | null = null;
    let laserLines: THREE.LineSegments | null = null;
    let mziGroup: THREE.Group | null = null;

    if (activeMode === 'ORBITAL_CONSTELLATION') {
      // 1. Central Earth Globe
      const earthGeo = new THREE.SphereGeometry(6.5, 36, 36);
      const earthMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        wireframe: true,
        emissive: 0x0369a1,
        emissiveIntensity: 0.15
      });
      earthMesh = new THREE.Mesh(earthGeo, earthMat);
      rootGroup.add(earthMesh);

      // Atmospheric Rim
      const atmGeo = new THREE.SphereGeometry(6.8, 32, 32);
      const atmMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        wireframe: true,
        transparent: true,
        opacity: 0.12
      });
      const atm = new THREE.Mesh(atmGeo, atmMat);
      rootGroup.add(atm);

      // Ground Station Node
      const groundGeo = new THREE.SphereGeometry(0.5, 16, 16);
      const groundMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, emissive: 0x16a34a, emissiveIntensity: 0.8 });
      const groundStation = new THREE.Mesh(groundGeo, groundMat);
      groundStation.position.set(0, 6.6, 0);
      rootGroup.add(groundStation);

      // 2. Orbital Satellite Mesh & FSO Laser Lines
      satGroup = new THREE.Group();
      const satGeo = new THREE.BoxGeometry(0.7, 0.4, 0.5);
      const satMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.8, roughness: 0.2 });
      const panelGeo = new THREE.BoxGeometry(1.6, 0.05, 0.5);
      const panelMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.9, roughness: 0.1 });

      const satCount = 8;
      const radius = 12.5;
      const positions: THREE.Vector3[] = [];

      for (let i = 0; i < satCount; i++) {
        const angle = (i / satCount) * Math.PI * 2;
        const satNode = new THREE.Group();
        const body = new THREE.Mesh(satGeo, satMat);
        const panel = new THREE.Mesh(panelGeo, panelMat);
        satNode.add(body);
        satNode.add(panel);

        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle * 2) * 2.4;
        const z = Math.sin(angle) * radius;
        satNode.position.set(x, y, z);
        satGroup.add(satNode);
        positions.push(new THREE.Vector3(x, y, z));
      }
      rootGroup.add(satGroup);

      // 3. FSO Laser Ring Beams
      const linePositions: number[] = [];
      for (let i = 0; i < satCount; i++) {
        const next = (i + 1) % satCount;
        linePositions.push(positions[i].x, positions[i].y, positions[i].z);
        linePositions.push(positions[next].x, positions[next].y, positions[next].z);
      }
      // Downlink to ground station
      linePositions.push(positions[0].x, positions[0].y, positions[0].z);
      linePositions.push(groundStation.position.x, groundStation.position.y, groundStation.position.z);

      const lineGeo = new THREE.BufferGeometry();
      lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
      const lineMat = new THREE.LineBasicMaterial({
        color: 0x00f0ff,
        transparent: true,
        opacity: 0.85
      });
      laserLines = new THREE.LineSegments(lineGeo, lineMat);
      satGroup.add(laserLines);

    } else {
      // PHOTONIC MZI WAVEGUIDE MODE
      mziGroup = new THREE.Group();

      // Input waveguide
      const wgMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.4 });
      const wgGeo = new THREE.CylinderGeometry(0.15, 0.15, 8, 16);
      const inputWg = new THREE.Mesh(wgGeo, wgMat);
      inputWg.rotation.z = Math.PI / 2;
      inputWg.position.set(-10, 0, 0);
      mziGroup.add(inputWg);

      // Upper arm (Theta Phase Shifter)
      const upperWg = new THREE.Mesh(wgGeo, wgMat);
      upperWg.rotation.z = Math.PI / 2;
      upperWg.position.set(0, 3, 0);
      mziGroup.add(upperWg);

      const thetaModGeo = new THREE.BoxGeometry(3, 1, 1);
      const thetaModMat = new THREE.MeshStandardMaterial({ color: 0xa855f7, emissive: 0x9333ea, emissiveIntensity: 0.6 });
      const thetaMod = new THREE.Mesh(thetaModGeo, thetaModMat);
      thetaMod.position.set(0, 3, 0);
      mziGroup.add(thetaMod);

      // Lower arm (Phi Phase Shifter)
      const lowerWg = new THREE.Mesh(wgGeo, wgMat);
      lowerWg.rotation.z = Math.PI / 2;
      lowerWg.position.set(0, -3, 0);
      mziGroup.add(lowerWg);

      const phiModGeo = new THREE.BoxGeometry(3, 1, 1);
      const phiModMat = new THREE.MeshStandardMaterial({ color: 0xec4899, emissive: 0xdb2777, emissiveIntensity: 0.6 });
      const phiMod = new THREE.Mesh(phiModGeo, phiModMat);
      phiMod.position.set(0, -3, 0);
      mziGroup.add(phiMod);

      // Output recombining coupler & detector
      const outputWg = new THREE.Mesh(wgGeo, wgMat);
      outputWg.rotation.z = Math.PI / 2;
      outputWg.position.set(10, 0, 0);
      mziGroup.add(outputWg);

      const detectorGeo = new THREE.CylinderGeometry(0.8, 0.8, 1.2, 16);
      const detectorMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, emissive: 0x16a34a, emissiveIntensity: 0.8 });
      const detector = new THREE.Mesh(detectorGeo, detectorMat);
      detector.rotation.z = Math.PI / 2;
      detector.position.set(14.5, 0, 0);
      mziGroup.add(detector);

      rootGroup.add(mziGroup);
    }

    let animationId: number;
    let pulseTime = 0;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      pulseTime += 0.02;

      if (isRotating) {
        if (earthMesh) earthMesh.rotation.y += 0.002;
        if (satGroup) satGroup.rotation.y += 0.005;
        if (mziGroup) mziGroup.rotation.y = Math.sin(pulseTime * 0.3) * 0.15;
      }

      if (laserLines) {
        (laserLines.material as THREE.LineBasicMaterial).opacity = 0.5 + 0.4 * Math.sin(pulseTime * 4.0);
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight || 400;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
      renderer.dispose();
    };
  }, [activeMode, isRotating, theta, phi]);

  return (
    <div className="relative w-full h-[440px] rounded-2xl overflow-hidden border border-sky-500/30 bg-slate-950/80 shadow-2xl backdrop-blur-xl">
      {/* Top Banner Info */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-sky-500/40 text-xs font-mono text-sky-300">
          <Orbit className="w-4 h-4 text-sky-400 animate-spin" style={{ animationDuration: '8s' }} />
          <span>LEO FSO CONSTELLATION: 8 CUBE-SATS</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-emerald-500/40 text-xs font-mono text-emerald-300">
          <Radio className="w-4 h-4 text-emerald-400" />
          <span>FSO LASER: {fsoThroughputGbps} Gbps (1550nm)</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-purple-500/40 text-xs font-mono text-purple-300">
          <Cpu className="w-4 h-4 text-purple-400" />
          <span>P-TPU MZI: &lt;0.1 pJ/op (780ps)</span>
        </div>
      </div>

      {/* Mode Switcher & Controls */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <button
          onClick={() => setActiveMode(activeMode === 'ORBITAL_CONSTELLATION' ? 'PHOTONIC_MZI_WAVEGUIDE' : 'ORBITAL_CONSTELLATION')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-900/70 hover:bg-sky-800 text-sky-200 border border-sky-500/50 text-xs font-mono transition-colors"
        >
          <Activity className="w-3.5 h-3.5" />
          {activeMode === 'ORBITAL_CONSTELLATION' ? 'Switch to Photonic MZI' : 'Switch to Orbital Mesh'}
        </button>
        <button
          onClick={() => setIsRotating(!isRotating)}
          className={`p-2 rounded-lg border text-xs font-mono transition-colors ${
            isRotating ? 'bg-sky-500/20 text-sky-300 border-sky-500/50' : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}
          title="Toggle Rotation"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }} />
        </button>
      </div>

      {/* 3D WebGL Canvas */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Bottom Telemetry Bar */}
      <div className="absolute bottom-3 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-2 px-4 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-mono text-slate-300">
        <div className="flex items-center gap-4">
          <span className="text-slate-400">Mode: <strong className="text-sky-300">{activeMode}</strong></span>
          <span className="text-slate-400">LEO Altitude: <strong className="text-emerald-300">550 - 580 km</strong></span>
          <span className="text-slate-400">Global Orbit Latency: <strong className="text-amber-300">38.4 ms (&lt;50ms)</strong></span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-slate-400">Interferometer Phase: θ = {(theta / Math.PI).toFixed(2)}π, φ = {(phi / Math.PI).toFixed(2)}π</span>
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>
      </div>
    </div>
  );
};

export default OrbitalPhotonicVisualizer;
