import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface QuantumGraphMofVisualizerProps {
  pressurePsi?: number;
  knotClass?: string;
  isDigested?: boolean;
}

export const QuantumGraphMofVisualizer: React.FC<QuantumGraphMofVisualizerProps> = ({
  pressurePsi = 24.5,
  knotClass = 'TREFOIL_3_1',
  isDigested = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x030712);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 16, 26);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const emeraldLight = new THREE.PointLight(0x10b981, 2.5, 60);
    emeraldLight.position.set(12, 16, 12);
    scene.add(emeraldLight);

    const purpleLight = new THREE.PointLight(0xa855f7, 2, 60);
    purpleLight.position.set(-12, -10, -10);
    scene.add(purpleLight);

    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // 1. MOF-5 / ZIF-8 Molecular Framework Lattice
    const mofGroup = new THREE.Group();
    const nodeGeo = new THREE.SphereGeometry(0.45, 16, 16);
    const nodeMat = new THREE.MeshStandardMaterial({
      color: isDigested ? 0x64748b : 0x10b981,
      roughness: 0.2,
      metalness: 0.6,
      transparent: true,
      opacity: isDigested ? 0.2 : 0.9,
    });

    const cylinderMat = new THREE.MeshBasicMaterial({
      color: isDigested ? 0x475569 : 0x059669,
      transparent: true,
      opacity: isDigested ? 0.1 : 0.4,
    });

    const spacing = 3.2;
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          const sphere = new THREE.Mesh(nodeGeo, nodeMat);
          sphere.position.set(x * spacing, y * spacing, z * spacing);
          mofGroup.add(sphere);

          // X-link
          if (x < 1) {
            const linkGeo = new THREE.CylinderGeometry(0.08, 0.08, spacing, 8);
            const link = new THREE.Mesh(linkGeo, cylinderMat);
            link.rotation.z = Math.PI / 2;
            link.position.set((x + 0.5) * spacing, y * spacing, z * spacing);
            mofGroup.add(link);
          }
          // Y-link
          if (y < 1) {
            const linkGeo = new THREE.CylinderGeometry(0.08, 0.08, spacing, 8);
            const link = new THREE.Mesh(linkGeo, cylinderMat);
            link.position.set(x * spacing, (y + 0.5) * spacing, z * spacing);
            mofGroup.add(link);
          }
          // Z-link
          if (z < 1) {
            const linkGeo = new THREE.CylinderGeometry(0.08, 0.08, spacing, 8);
            const link = new THREE.Mesh(linkGeo, cylinderMat);
            link.rotation.x = Math.PI / 2;
            link.position.set(x * spacing, y * spacing, (z + 0.5) * spacing);
            mofGroup.add(link);
          }
        }
      }
    }
    rootGroup.add(mofGroup);

    // 2. QGNN Topological Knot Invariant Braid Curve (Trefoil Knot 3_1 Tube)
    if (!isDigested) {
      class TrefoilCurve extends THREE.Curve<THREE.Vector3> {
        scale: number;
        constructor(scale = 2.2) {
          super();
          this.scale = scale;
        }
        getPoint(t: number, optionalTarget = new THREE.Vector3()) {
          const tau = 2 * Math.PI * t;
          const x = Math.sin(tau) + 2 * Math.sin(2 * tau);
          const y = Math.cos(tau) - 2 * Math.cos(2 * tau);
          const z = -Math.sin(3 * tau);
          return optionalTarget.set(x, y, z).multiplyScalar(this.scale);
        }
      }

      const knotCurve = new TrefoilCurve(1.6);
      const knotGeo = new THREE.TubeGeometry(knotCurve, 128, 0.28, 12, true);
      const knotMat = new THREE.MeshStandardMaterial({
        color: 0xa855f7,
        emissive: 0x6b21a8,
        emissiveIntensity: 0.8,
        roughness: 0.1,
        metalness: 0.9,
      });
      const knotMesh = new THREE.Mesh(knotGeo, knotMat);
      rootGroup.add(knotMesh);
    }

    // 3. Gas-Phase Sorption Pressure Particle Swarm
    const gasParticlesCount = isDigested ? 50 : Math.min(800, Math.floor(pressurePsi * 25));
    const gasGeo = new THREE.BufferGeometry();
    const gasPos = new Float32Array(gasParticlesCount * 3);

    for (let i = 0; i < gasParticlesCount * 3; i += 3) {
      gasPos[i] = (Math.random() - 0.5) * 8;
      gasPos[i + 1] = (Math.random() - 0.5) * 8;
      gasPos[i + 2] = (Math.random() - 0.5) * 8;
    }
    gasGeo.setAttribute('position', new THREE.BufferAttribute(gasPos, 3));

    const gasMat = new THREE.PointsMaterial({
      size: 0.12,
      color: isDigested ? 0x94a3b8 : 0x34d399,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const gasPoints = new THREE.Points(gasGeo, gasMat);
    rootGroup.add(gasPoints);

    // Animation Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (!isDigested) {
        rootGroup.rotation.y += 0.004;
        rootGroup.rotation.x += 0.002;
        gasPoints.rotation.y -= 0.005;
      } else {
        rootGroup.rotation.y += 0.0005;
      }
      renderer.render(scene, camera);
    };
    animate();

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
  }, [pressurePsi, knotClass, isDigested]);

  return (
    <div className="relative w-full h-96 rounded-xl overflow-hidden border border-[#232B3E] bg-[#030712]">
      {/* HUD Header */}
      <div className="absolute top-3 left-4 z-10 font-mono space-y-1">
        <div className="flex items-center space-x-2">
          <span className={`w-2.5 h-2.5 rounded-full ${isDigested ? 'bg-amber-500' : 'bg-emerald-400 animate-pulse'}`} />
          <span className="text-xs font-bold text-emerald-400 tracking-wider">
            V11.0 TRANSCENDENCE — MOF-5/ZIF-8 GAS LATTICE &amp; QGNN KNOT
          </span>
        </div>
        <div className="text-[11px] text-slate-400">
          SURFACE AREA: <span className="text-emerald-400 font-bold">2,000 m²/g</span> | PRESSURE: <span className="text-cyan-400 font-bold">{pressurePsi.toFixed(2)} PSI</span> | EM LEAK: <span className="text-emerald-400">-150 dBm</span>
        </div>
        <div className="text-[11px] text-slate-400">
          QGNN KNOT INVARIANT: <span className="text-purple-400 font-bold">{knotClass}</span> | JONES V(t=-1): <span className="text-purple-300 font-bold">2.828</span> | MATCH: <span className="text-emerald-400">&lt;5.0 ms</span>
        </div>
      </div>

      {isDigested && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center font-mono">
          <span className="text-xl font-bold text-amber-400 tracking-widest">
            BIOLOGICAL SUBSTRATE DIGESTION COMPLETE
          </span>
          <p className="text-xs text-slate-400 mt-2">
            Silicon metabolized to inert silicic acid Si(OH)₄. Zero reconstructible remnants.
          </p>
        </div>
      )}

      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
    </div>
  );
};
