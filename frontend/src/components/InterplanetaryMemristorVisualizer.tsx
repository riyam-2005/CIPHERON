import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface VisualizerProps {
  activeView?: 'dual' | 'interplanetary' | 'memristor';
  currentWordlineVoltages?: number[];
  currentBitlineCurrents?: number[];
  isZeroized?: boolean;
}

export const InterplanetaryMemristorVisualizer: React.FC<VisualizerProps> = ({
  activeView = 'dual',
  currentWordlineVoltages = [1.2, 0.8, 1.5, 0.4],
  currentBitlineCurrents = [1.45, 1.82, 2.15, 0.94],
  isZeroized = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<'dual' | 'interplanetary' | 'memristor'>(activeView);
  const [isRotating, setIsRotating] = useState<boolean>(true);
  const [activeHop, setActiveHop] = useState<string>('Earth Ground -> L1 Lagrange -> Mars Orbit');

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight || 420;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x02040a);
    scene.fog = new THREE.FogExp2(0x02040a, 0.008);

    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
    camera.position.set(0, 16, 38);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 2. Starfield Background
    const starCount = 600;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPos[i] = (Math.random() - 0.5) * 160;
      starPos[i + 1] = (Math.random() - 0.5) * 160;
      starPos[i + 2] = (Math.random() - 0.5) * 160;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({ color: 0x94a3b8, size: 0.8, transparent: true, opacity: 0.6 });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // 3. Interplanetary DTN Mesh Group
    const spaceMeshGroup = new THREE.Group();

    // Earth Sphere & Atmospheric Shell
    const earthGeo = new THREE.SphereGeometry(3.2, 32, 32);
    const earthMat = new THREE.MeshBasicMaterial({ color: 0x3b82f6, wireframe: true, transparent: true, opacity: 0.85 });
    const earth = new THREE.Mesh(earthGeo, earthMat);
    earth.position.set(-16, 4, 0);

    const earthAuraGeo = new THREE.SphereGeometry(3.6, 24, 24);
    const earthAuraMat = new THREE.MeshBasicMaterial({ color: 0x60a5fa, wireframe: true, transparent: true, opacity: 0.2 });
    const earthAura = new THREE.Mesh(earthAuraGeo, earthAuraMat);
    earth.add(earthAura);
    spaceMeshGroup.add(earth);

    // Moon & Lunar Gateway
    const moonGeo = new THREE.SphereGeometry(1.0, 16, 16);
    const moonMat = new THREE.MeshBasicMaterial({ color: 0xe2e8f0, wireframe: true, transparent: true, opacity: 0.7 });
    const moon = new THREE.Mesh(moonGeo, moonMat);
    moon.position.set(-11, 8, 4);
    spaceMeshGroup.add(moon);

    // Mars Sphere & Atmospheric Shell
    const marsGeo = new THREE.SphereGeometry(2.4, 32, 32);
    const marsMat = new THREE.MeshBasicMaterial({ color: 0xef4444, wireframe: true, transparent: true, opacity: 0.85 });
    const mars = new THREE.Mesh(marsGeo, marsMat);
    mars.position.set(16, 4, 0);

    const marsAuraGeo = new THREE.SphereGeometry(2.7, 24, 24);
    const marsAuraMat = new THREE.MeshBasicMaterial({ color: 0xf87171, wireframe: true, transparent: true, opacity: 0.2 });
    const marsAura = new THREE.Mesh(marsAuraGeo, marsAuraMat);
    mars.add(marsAura);
    spaceMeshGroup.add(mars);

    // Lagrange Relays (L1, L2, L4, L5)
    const lagrangePositions = [
      { name: 'L1', pos: new THREE.Vector3(-8, 3, 0), color: 0xfbbf24 },
      { name: 'L2', pos: new THREE.Vector3(-22, 5, -2), color: 0xf59e0b },
      { name: 'L4', pos: new THREE.Vector3(0, 9, 8), color: 0x10b981 },
      { name: 'L5', pos: new THREE.Vector3(0, -1, -8), color: 0x10b981 },
      { name: 'Mars-Ares', pos: new THREE.Vector3(12, 7, 2), color: 0xf97316 }
    ];

    const lagrangeMeshes: THREE.Mesh[] = [];
    lagrangePositions.forEach(lp => {
      const octGeo = new THREE.OctahedronGeometry(0.7, 0);
      const octMat = new THREE.MeshBasicMaterial({ color: lp.color, wireframe: true });
      const octMesh = new THREE.Mesh(octGeo, octMat);
      octMesh.position.copy(lp.pos);
      spaceMeshGroup.add(octMesh);
      lagrangeMeshes.push(octMesh);
    });

    // 1550nm Laser Connection Path
    const laserPoints = [
      earth.position,
      lagrangePositions[0].pos, // L1
      lagrangePositions[2].pos, // L4
      lagrangePositions[4].pos, // Mars Ares
      mars.position
    ];
    const laserCurve = new THREE.CatmullRomCurve3(laserPoints);
    const tubeGeo = new THREE.TubeGeometry(laserCurve, 64, 0.08, 8, false);
    const laserMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.85
    });
    const laserTube = new THREE.Mesh(tubeGeo, laserMat);
    spaceMeshGroup.add(laserTube);

    // Pulsing Photon Packets along Laser
    const photonCount = 12;
    const photons: THREE.Mesh[] = [];
    const photonGeo = new THREE.SphereGeometry(0.25, 8, 8);
    const photonMat = new THREE.MeshBasicMaterial({ color: 0x34d399 });
    for (let i = 0; i < photonCount; i++) {
      const photon = new THREE.Mesh(photonGeo, photonMat);
      spaceMeshGroup.add(photon);
      photons.push(photon);
    }

    scene.add(spaceMeshGroup);

    // 4. 1T1M Nanoscale Memristor Crossbar Array Group
    const crossbarGroup = new THREE.Group();
    crossbarGroup.position.set(0, -9, 0);

    const gridSize = 4;
    const spacing = 2.2;
    const offset = ((gridSize - 1) * spacing) / 2;

    // Wordline Conductors (Horizontal Amber/Gold Bars)
    const wordlineMeshes: THREE.Mesh[] = [];
    for (let r = 0; r < gridSize; r++) {
      const wlGeo = new THREE.CylinderGeometry(0.12, 0.12, gridSize * spacing + 1.5, 16);
      const wlMat = new THREE.MeshBasicMaterial({
        color: isZeroized ? 0x475569 : 0xf59e0b,
        transparent: true,
        opacity: isZeroized ? 0.3 : 0.8
      });
      const wl = new THREE.Mesh(wlGeo, wlMat);
      wl.rotation.z = Math.PI / 2;
      wl.position.set(0, (r * spacing) - offset, 0.4);
      crossbarGroup.add(wl);
      wordlineMeshes.push(wl);
    }

    // Bitline Conductors (Vertical Cyan/Blue Bars)
    const bitlineMeshes: THREE.Mesh[] = [];
    for (let c = 0; c < gridSize; c++) {
      const blGeo = new THREE.CylinderGeometry(0.12, 0.12, gridSize * spacing + 1.5, 16);
      const blMat = new THREE.MeshBasicMaterial({
        color: isZeroized ? 0x334155 : 0x06b6d4,
        transparent: true,
        opacity: isZeroized ? 0.3 : 0.8
      });
      const bl = new THREE.Mesh(blGeo, blMat);
      bl.position.set((c * spacing) - offset, 0, -0.4);
      crossbarGroup.add(bl);
      bitlineMeshes.push(bl);
    }

    // 1T1M Nanoscale HfOx Junction Cells (16 Crossbar Points)
    const junctionMeshes: THREE.Mesh[] = [];
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        const juncGeo = new THREE.BoxGeometry(0.45, 0.45, 0.8);
        const juncColor = isZeroized ? 0x1e293b : 0xa855f7;
        const juncMat = new THREE.MeshBasicMaterial({
          color: juncColor,
          wireframe: true,
          transparent: true,
          opacity: isZeroized ? 0.2 : 0.9
        });
        const junc = new THREE.Mesh(juncGeo, juncMat);
        junc.position.set((c * spacing) - offset, (r * spacing) - offset, 0);
        crossbarGroup.add(junc);
        junctionMeshes.push(junc);
      }
    }

    // Microfluidic Active Channels (Etched beneath silicon substrate)
    const microfluidicGeo = new THREE.PlaneGeometry(gridSize * spacing + 2.5, gridSize * spacing + 2.5);
    const microfluidicMat = new THREE.MeshBasicMaterial({
      color: isZeroized ? 0x991b1b : 0x0284c7,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide
    });
    const microfluidicPlate = new THREE.Mesh(microfluidicGeo, microfluidicMat);
    microfluidicPlate.position.set(0, 0, -1.2);
    crossbarGroup.add(microfluidicPlate);

    scene.add(crossbarGroup);

    // 5. Visibility and Camera Layout based on View Mode
    if (viewMode === 'interplanetary') {
      spaceMeshGroup.visible = true;
      crossbarGroup.visible = false;
      spaceMeshGroup.position.set(0, 0, 0);
      camera.position.set(0, 8, 36);
    } else if (viewMode === 'memristor') {
      spaceMeshGroup.visible = false;
      crossbarGroup.visible = true;
      crossbarGroup.position.set(0, 0, 0);
      crossbarGroup.rotation.x = -0.4;
      camera.position.set(0, 4, 20);
    } else {
      // Dual View
      spaceMeshGroup.visible = true;
      crossbarGroup.visible = true;
      spaceMeshGroup.position.set(0, 5, 0);
      crossbarGroup.position.set(0, -8, 0);
      crossbarGroup.rotation.x = -0.3;
      camera.position.set(0, 4, 38);
    }

    // 6. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Orbital rotations
      earth.rotation.y += 0.003;
      mars.rotation.y += 0.0025;
      moon.rotation.y += 0.005;

      // Rotate Lagrange octahedrons
      lagrangeMeshes.forEach((mesh, idx) => {
        mesh.rotation.x += 0.01 * (idx + 1);
        mesh.rotation.y += 0.012;
      });

      // Animate laser photon pulses along interplanetary trajectory
      photons.forEach((photon, idx) => {
        const offsetProg = ((elapsed * 0.15) + (idx / photonCount)) % 1.0;
        const pos = laserCurve.getPointAt(offsetProg);
        photon.position.copy(pos);
      });

      // Pulse memristive junction filaments with simulated VMM current flow
      if (!isZeroized) {
        junctionMeshes.forEach((junc, idx) => {
          const row = Math.floor(idx / gridSize);
          const col = idx % gridSize;
          const v = currentWordlineVoltages[row] || 1.0;
          const i = currentBitlineCurrents[col] || 1.0;
          const scale = 1.0 + Math.sin(elapsed * 4 + idx) * 0.12 * (v * i * 0.3);
          junc.scale.set(scale, scale, scale);
        });
      }

      // Gentle global rotation when enabled
      if (isRotating) {
        if (viewMode === 'interplanetary' || viewMode === 'dual') {
          spaceMeshGroup.rotation.y = Math.sin(elapsed * 0.15) * 0.12;
        }
        if (viewMode === 'memristor' || viewMode === 'dual') {
          crossbarGroup.rotation.y = Math.sin(elapsed * 0.2) * 0.15;
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // 7. Resize Observer
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight || 420;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [viewMode, isRotating, isZeroized, currentWordlineVoltages, currentBitlineCurrents]);

  return (
    <div className="w-full rounded-2xl overflow-hidden border border-emerald-500/30 bg-slate-950 shadow-2xl relative">
      {/* Visualizer HUD Bar */}
      <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 bg-slate-900/85 backdrop-blur-md px-4 py-2.5 rounded-xl border border-slate-700/60 shadow-lg text-xs font-mono">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${isZeroized ? 'bg-red-500 animate-ping' : 'bg-emerald-400 animate-pulse'}`} />
            <span className="font-bold text-slate-100 tracking-wider">
              {isZeroized ? 'SILICON ZEROIZED (<500ns)' : 'DEEP SPACE DTN & 1T1M MEMRISTOR'}
            </span>
          </div>
          <span className="text-slate-500">|</span>
          <span className="text-emerald-400">
            FSO: 1550nm (Margin &ge; 6.0 dB)
          </span>
          <span className="text-slate-500 hidden sm:inline">|</span>
          <span className="text-purple-400 hidden sm:inline">
            PIM: 100 TOPS/W (1T1M HfO<sub>x</sub>)
          </span>
        </div>

        {/* View Mode Controls */}
        <div className="flex items-center space-x-2">
          <div className="inline-flex rounded-lg bg-slate-800 p-0.5 border border-slate-700">
            <button
              onClick={() => setViewMode('dual')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition ${viewMode === 'dual' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Dual View
            </button>
            <button
              onClick={() => setViewMode('interplanetary')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition ${viewMode === 'interplanetary' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Deep Space Mesh
            </button>
            <button
              onClick={() => setViewMode('memristor')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition ${viewMode === 'memristor' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              1T1M Memristor PIM
            </button>
          </div>

          <button
            onClick={() => setIsRotating(!isRotating)}
            className="px-2 py-1 rounded-md bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 transition"
            title="Toggle rotation"
          >
            {isRotating ? 'Pause' : 'Rotate'}
          </button>
        </div>
      </div>

      {/* Main 3D Canvas */}
      <div ref={containerRef} className="w-full h-[420px]" />

      {/* Bottom Telemetry Overlay */}
      <div className="absolute bottom-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 bg-slate-900/80 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-700/50 text-xs font-mono text-slate-300">
        <div className="flex items-center space-x-4">
          <span className="text-amber-400 font-semibold">Active Hop: {activeHop}</span>
          <span className="text-slate-400 hidden md:inline">Propagation Delay: ~3.0 to 22.3 min (T=d/c)</span>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-cyan-400">Wordlines: 4 (GPIO 25/26 DAC)</span>
          <span className="text-emerald-400">Bitlines: 4 (High-Speed ADC)</span>
          <span className="text-pink-400">Exothermic Reaction: &lt;500ns</span>
        </div>
      </div>
    </div>
  );
};

export default InterplanetaryMemristorVisualizer;
