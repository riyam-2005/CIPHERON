import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ChronoTensorSingularity3DProps {
  manifoldDimension?: number;
  temporalQubits?: number;
  planckPowerDensity?: number;
  coherencePhase?: number;
  isChronoZeroized?: boolean;
}

export const ChronoTensorSingularity3D: React.FC<ChronoTensorSingularity3DProps> = ({
  manifoldDimension = 1024,
  temporalQubits = 512,
  planckPowerDensity = 1.42e12,
  coherencePhase = 1.0,
  isChronoZeroized = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth || 800;
    const height = containerRef.current.clientHeight || 400;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020106);

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 18, 36);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // Dynamic Illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const purpleLight = new THREE.PointLight(0xa855f7, 3.5, 70);
    purpleLight.position.set(0, 15, 15);
    scene.add(purpleLight);

    const magentaLight = new THREE.PointLight(0xec4899, 3, 60);
    magentaLight.position.set(-18, -12, -10);
    scene.add(magentaLight);

    const amberLight = new THREE.PointLight(0xf59e0b, 2.5, 50);
    amberLight.position.set(18, -10, 10);
    scene.add(amberLight);

    const masterGroup = new THREE.Group();
    scene.add(masterGroup);

    // 1. 3D Chrono-Tensor Singularity Ring Stack (M_inf Hyper-Manifold)
    const chronoGroup = new THREE.Group();
    const ringGeo = new THREE.TorusGeometry(8, 0.3, 16, 100);
    const ringMat = new THREE.MeshStandardMaterial({
      color: isChronoZeroized ? 0x64748b : 0xa855f7,
      wireframe: true,
      roughness: 0.1,
      metalness: 0.9,
      emissive: isChronoZeroized ? 0x0f172a : 0x7e22ce,
      emissiveIntensity: isChronoZeroized ? 0.1 : 0.6,
    });

    const rings: THREE.Mesh[] = [];
    for (let i = 0; i < 5; i++) {
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = (i * Math.PI) / 5;
      ring.rotation.y = (i * Math.PI) / 10;
      chronoGroup.add(ring);
      rings.push(ring);
    }
    masterGroup.add(chronoGroup);

    // 2. Central Recursive Tensor Singular Core Sphere
    const coreGeo = new THREE.IcosahedronGeometry(4.2, 2);
    const coreMat = new THREE.MeshBasicMaterial({
      color: isChronoZeroized ? 0x334155 : 0xec4899,
      wireframe: true,
      transparent: true,
      opacity: isChronoZeroized ? 0.1 : 0.6,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    masterGroup.add(coreMesh);

    // 3. Temporal Entanglement Qubit Particle Halo (512 Qubits representation)
    const particleGroup = new THREE.Group();
    const particleGeo = new THREE.SphereGeometry(0.22, 8, 8);
    const particleMat = new THREE.MeshBasicMaterial({
      color: isChronoZeroized ? 0x475569 : 0xf59e0b,
    });

    const particles: THREE.Mesh[] = [];
    const particleCount = isChronoZeroized ? 60 : 36;
    for (let i = 0; i < particleCount; i++) {
      const p = new THREE.Mesh(particleGeo, particleMat);
      if (isChronoZeroized) {
        // Dispersed decoupled wavefunctions
        p.position.set(
          (Math.random() - 0.5) * 45,
          (Math.random() - 0.5) * 45,
          (Math.random() - 0.5) * 45
        );
      } else {
        const phi = (i / particleCount) * Math.PI * 2;
        const rad = 13.5 + Math.sin(i * 2) * 1.5;
        p.position.set(
          Math.cos(phi) * rad,
          Math.sin(i * 3) * 3,
          Math.sin(phi) * rad
        );
      }
      particleGroup.add(p);
      particles.push(p);
    }
    masterGroup.add(particleGroup);

    // Animation Loop
    let animationFrameId: number;
    let t = 0;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      t += 0.01;

      if (!isChronoZeroized) {
        chronoGroup.rotation.y += 0.005;
        chronoGroup.rotation.z += 0.002;
        coreMesh.rotation.x -= 0.006;
        coreMesh.rotation.y += 0.004;

        // Animate nested rings
        rings.forEach((ring, idx) => {
          ring.rotation.z += 0.001 * (idx + 1);
        });

        // Breathing core scale
        const scale = 1 + Math.sin(t * 2.5) * 0.03;
        coreMesh.scale.set(scale, scale, scale);

        // Orbital halo rotation
        particleGroup.rotation.y += 0.004;
      } else {
        // Disintegration expansion across past/present/future
        particles.forEach((p) => {
          p.position.x += (Math.random() - 0.5) * 0.1;
          p.position.y += (Math.random() - 0.5) * 0.1;
          p.position.z += (Math.random() - 0.5) * 0.1;
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
      camera.updateProjectionMatrix();
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
  }, [manifoldDimension, temporalQubits, planckPowerDensity, coherencePhase, isChronoZeroized]);

  return (
    <div className="w-full h-96 rounded-xl overflow-hidden border border-purple-500/30 relative bg-[#020106]">
      {/* Top Banner Overlay */}
      <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-purple-500/40 text-purple-300 text-xs font-mono flex items-center space-x-2">
          <span className={`w-2 h-2 rounded-full ${isChronoZeroized ? 'bg-red-500 animate-ping' : 'bg-purple-400 animate-pulse'}`} />
          <span>
            {isChronoZeroized
              ? 'ZEROIZED: TEMPORAL QUANTUM DECOUPLING COMPLETE (<100ps SLA)'
              : 'SINGULARITY OMNI-RECURSION — RECURSIVE TENSOR HYPER-MANIFOLD M_inf'}
          </span>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono">
          <div className="bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded border border-amber-500/30 text-amber-400">
            TEMPORAL QUBITS: {temporalQubits}
          </div>
          <div className="bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded border border-purple-500/30 text-purple-400">
            PLANCK ZPE: {planckPowerDensity.toExponential(2)} W/cm³
          </div>
        </div>
      </div>

      {/* Status Footer Overlay */}
      <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center justify-between text-[11px] font-mono text-slate-400 pointer-events-none">
        <div className="bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded border border-purple-500/20">
          Manifold Dimension <span className="text-purple-400 font-semibold">{manifoldDimension}-D</span> | Contraction Complexity{' '}
          <span className="text-emerald-400 font-semibold">{isChronoZeroized ? 'N/A' : 'O(1) (1.2 ns)'}</span>
        </div>
        <div className="bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded border border-amber-500/20">
          Temporal Phase:{' '}
          <span className={`font-semibold ${isChronoZeroized ? 'text-red-400' : 'text-amber-400'}`}>
            {isChronoZeroized ? '0.000 (DECOUPLED)' : `${coherencePhase.toFixed(4)} (COHERENT)`}
          </span>
        </div>
      </div>

      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
    </div>
  );
};

export default ChronoTensorSingularity3D;
