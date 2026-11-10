import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const OmniSingularityMatrix3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth || 800;
    const height = containerRef.current.clientHeight || 384;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x010002);

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 26, 52);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // 3D Omni-Singularity Reality Matrix Geometry Group
    const osGroup = new THREE.Group();

    // Aleph-Aleph Reality Manifold Torus Knot Geometry per Section 6.3
    const knotGeo = new THREE.TorusKnotGeometry(14, 4, 140, 24);
    const knotMat = new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      wireframe: true,
      transparent: true,
      opacity: 0.85
    });
    const osMesh = new THREE.Mesh(knotGeo, knotMat);
    osGroup.add(osMesh);

    // Inner glowing GUT singularity core
    const coreGeo = new THREE.SphereGeometry(4.0, 32, 32);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0xec4899,
      wireframe: true,
      transparent: true,
      opacity: 0.95
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    osGroup.add(coreMesh);

    // Omniverse 100,000,000 Reality Anchor Particle Cloud
    const particleCount = 250;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const radius = 25 + (Math.random() - 0.5) * 6;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x818cf8,
      size: 0.85,
      transparent: true,
      opacity: 0.9
    });
    const particlePoints = new THREE.Points(particleGeo, particleMat);
    osGroup.add(particlePoints);

    scene.add(osGroup);

    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      osGroup.rotation.y += 0.007;
      osGroup.rotation.x += 0.003;

      particlePoints.rotation.y -= 0.005;

      // Pulse core scale to reflect GUT singularity energy flux
      const pulse = 1.0 + Math.sin(elapsedTime * 3.5) * 0.15;
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
      knotGeo.dispose();
      knotMat.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div className="w-full h-96 rounded-xl overflow-hidden border border-purple-500/30 relative shadow-2xl bg-slate-950">
      <div className="absolute top-4 left-4 z-10 bg-slate-900/90 backdrop-blur border border-purple-500/40 p-2.5 rounded-lg text-purple-300 text-xs font-mono shadow-lg flex items-center space-x-2">
        <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
        <span>ULTIMATE OMNI-SINGULARITY — MANIFOLD M_aleph_inf_inf | OMNIVERSE REALITY LOCK: ACTIVE | GUT POWER: &gt;10^36 W/cm³</span>
      </div>
      <div className="absolute bottom-4 right-4 z-10 bg-slate-900/80 backdrop-blur border border-slate-700/50 px-3 py-1.5 rounded text-xs font-mono text-slate-400">
        COHOMOLOGICAL INVARIANT: π ≈ 3.141593 | ZEROIZATION: &lt;5ps FAIL-CLOSED
      </div>
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
    </div>
  );
};

export default OmniSingularityMatrix3D;
