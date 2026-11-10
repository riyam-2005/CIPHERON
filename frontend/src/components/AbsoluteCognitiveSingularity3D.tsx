import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const AbsoluteCognitiveSingularity3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 384;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x010004);

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 16, 32);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 3D Bio-Quantum Trans-Recursive Singularity & Quantum Lattice
    const trGroup = new THREE.Group();

    // 1. Primary Torus Knot Geometry (suggestion-v25.md Section 5.3)
    const knotGeo = new THREE.TorusKnotGeometry(8, 2.5, 160, 32);
    const knotMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8, // Sky Blue
      wireframe: true,
      transparent: true,
      opacity: 0.85
    });
    const trMesh = new THREE.Mesh(knotGeo, knotMat);
    trGroup.add(trMesh);

    // 2. Absolute Singularity Core (Inner Icosahedron)
    const coreGeo = new THREE.IcosahedronGeometry(3.5, 2);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0xa855f7, // Purple / Ultraviolet
      wireframe: true,
      transparent: true,
      opacity: 0.65
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    trGroup.add(coreMesh);

    // 3. Sub-Planckian Quantum-Plasmonic Particle Cloud (10.0 Pbps/mm^2)
    const particleCount = 600;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const u = Math.random() * Math.PI * 2;
      const v = Math.random() * Math.PI;
      const r = 10 + Math.random() * 7;
      positions[i * 3] = r * Math.sin(v) * Math.cos(u);
      positions[i * 3 + 1] = r * Math.sin(v) * Math.sin(u);
      positions[i * 3 + 2] = r * Math.cos(v);

      if (i % 3 === 0) {
        colors[i * 3] = 0.22; // Sky blue
        colors[i * 3 + 1] = 0.74;
        colors[i * 3 + 2] = 0.97;
      } else if (i % 3 === 1) {
        colors[i * 3] = 0.66; // Purple
        colors[i * 3 + 1] = 0.33;
        colors[i * 3 + 2] = 0.97;
      } else {
        colors[i * 3] = 0.0;  // Emerald
        colors[i * 3 + 1] = 0.9;
        colors[i * 3 + 2] = 0.46;
      }
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.26,
      vertexColors: true,
      transparent: true,
      opacity: 0.85
    });
    const particleCloud = new THREE.Points(particleGeo, particleMat);
    trGroup.add(particleCloud);

    // 4. Multi-Spectral Trans-Foveal Gaze Vector Axis (20-120Hz)
    const beamGeo = new THREE.CylinderGeometry(0.06, 0.06, 24, 8);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0x00e676, // Neon Emerald
      transparent: true,
      opacity: 0.55
    });
    const beamMesh = new THREE.Mesh(beamGeo, beamMat);
    beamMesh.rotation.z = Math.PI / 3;
    trGroup.add(beamMesh);

    scene.add(trGroup);

    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      trGroup.rotation.y += 0.009;
      trGroup.rotation.x += 0.005;
      particleCloud.rotation.y -= 0.004;
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container) container.innerHTML = '';
    };
  }, []);

  return (
    <div className="w-full h-96 rounded-xl overflow-hidden border border-sky-500/30 relative">
      <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur-md p-2 rounded-lg border border-sky-500/40 text-sky-300 text-xs font-mono shadow-lg">
        ABSOLUTE OMNI-COGNITIVE V26.0 — QUANTUM-PLASMONIC: 10.0 PBPS/MM² | HIGH-GAMMA: 250 Hz | zk-STARK: LOCKED
      </div>
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
};

export default AbsoluteCognitiveSingularity3D;
