import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const OmniCognitiveSingularity3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 384;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x010106);

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 14, 28);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 3D Bio-Quantum Omni-Cognitive Singularity & Plasmonic Lattice
    const ocGroup = new THREE.Group();

    // 1. Primary Torus Knot Geometry (suggestion-v24.md Section 5.3)
    const knotGeo = new THREE.TorusKnotGeometry(7, 2.2, 140, 28);
    const knotMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8, // Sky Blue
      wireframe: true,
      transparent: true,
      opacity: 0.85
    });
    const ocMesh = new THREE.Mesh(knotGeo, knotMat);
    ocGroup.add(ocMesh);

    // 2. Singularity Core (Inner Icosahedron)
    const coreGeo = new THREE.IcosahedronGeometry(3.0, 2);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x818cf8, // Indigo
      wireframe: true,
      transparent: true,
      opacity: 0.6
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    ocGroup.add(coreMesh);

    // 3. Plasmonic-Photonic Interposer Particle Cloud (1.0 Pbps/mm^2)
    const particleCount = 500;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const u = Math.random() * Math.PI * 2;
      const v = Math.random() * Math.PI;
      const r = 9 + Math.random() * 6;
      positions[i * 3] = r * Math.sin(v) * Math.cos(u);
      positions[i * 3 + 1] = r * Math.sin(v) * Math.sin(u);
      positions[i * 3 + 2] = r * Math.cos(v);

      if (i % 2 === 0) {
        colors[i * 3] = 0.22; // Sky blue
        colors[i * 3 + 1] = 0.74;
        colors[i * 3 + 2] = 0.97;
      } else {
        colors[i * 3] = 0.50; // Indigo
        colors[i * 3 + 1] = 0.55;
        colors[i * 3 + 2] = 0.97;
      }
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.25,
      vertexColors: true,
      transparent: true,
      opacity: 0.8
    });
    const particleCloud = new THREE.Points(particleGeo, particleMat);
    ocGroup.add(particleCloud);

    // 4. Trans-Foveal Gaze Vector Beam
    const beamGeo = new THREE.CylinderGeometry(0.05, 0.05, 20, 8);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0x34d399, // Emerald / Green
      transparent: true,
      opacity: 0.5
    });
    const beamMesh = new THREE.Mesh(beamGeo, beamMat);
    beamMesh.rotation.z = Math.PI / 3;
    ocGroup.add(beamMesh);

    scene.add(ocGroup);

    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      ocGroup.rotation.y += 0.008;
      ocGroup.rotation.x += 0.004;
      particleCloud.rotation.y -= 0.003;
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
        OMNI-COGNITIVE SINGULARITY V25.0 — PLASMONIC INTERPOSER: 1.0 PBPS/MM² | TRANS-SPECTRAL GAMMA: 120 Hz | zk-STARK: LOCKED
      </div>
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
};

export default OmniCognitiveSingularity3D;
