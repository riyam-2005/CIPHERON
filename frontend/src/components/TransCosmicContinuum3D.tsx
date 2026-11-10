import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const TransCosmicContinuum3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth || 800;
    const height = containerRef.current.clientHeight || 384;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x010102);

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 24, 48);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // 3D Trans-Cosmic Continuum Wireframe Group
    const tcGroup = new THREE.Group();

    // Hyper-Continuum Torus Knot Geometry per Section 6.3
    const torusKnotGeo = new THREE.TorusKnotGeometry(12, 4, 120, 20);
    const torusKnotMat = new THREE.MeshBasicMaterial({
      color: 0x6366f1,
      wireframe: true,
      transparent: true,
      opacity: 0.85
    });
    const tcMesh = new THREE.Mesh(torusKnotGeo, torusKnotMat);
    tcGroup.add(tcMesh);

    // Inner glowing singularity core
    const coreGeo = new THREE.SphereGeometry(3.5, 32, 32);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      wireframe: true,
      transparent: true,
      opacity: 0.95
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    tcGroup.add(coreMesh);

    // Multi-Verse 10,000,000 Grid Anchor Particle Cloud
    const particleCount = 200;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const radius = 22 + (Math.random() - 0.5) * 5;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 6;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.8,
      transparent: true,
      opacity: 0.9
    });
    const particlePoints = new THREE.Points(particleGeo, particleMat);
    tcGroup.add(particlePoints);

    scene.add(tcGroup);

    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      tcGroup.rotation.y += 0.006;
      tcGroup.rotation.x += 0.003;

      particlePoints.rotation.y -= 0.004;

      // Pulse core scale to reflect electroweak singularity flux
      const pulse = 1.0 + Math.sin(elapsedTime * 3) * 0.12;
      coreMesh.scale.set(pulse, pulse, pulse);

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
      torusKnotGeo.dispose();
      torusKnotMat.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div className="w-full h-96 rounded-xl overflow-hidden border border-indigo-500/30 relative shadow-2xl bg-slate-950">
      <div className="absolute top-4 left-4 z-10 bg-slate-900/90 backdrop-blur border border-indigo-500/40 p-2.5 rounded-lg text-indigo-300 text-xs font-mono shadow-lg flex items-center space-x-2">
        <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
        <span>ABSOLUTE UNIFIED CONTINUUM — HYPER-CONTINUUM M_inf_aleph_inf | MULTI-VERSE LOCK: ACTIVE | POWER: &gt;10^30 W/cm³</span>
      </div>
      <div className="absolute bottom-4 right-4 z-10 bg-slate-900/80 backdrop-blur border border-slate-700/50 px-3 py-1.5 rounded text-xs font-mono text-slate-400">
        HOMOTOPY INVARIANT: e ≈ 2.718282 | ZEROIZATION: &lt;10ps FAIL-CLOSED
      </div>
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
    </div>
  );
};

export default TransCosmicContinuum3D;
