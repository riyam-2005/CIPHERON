import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const TranscendentRealitySingularity3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 384;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000004);

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 20, 40);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 3D Bio-Quantum Transcendent Reality Singularity Mesh (suggestion-v27.md Section 5.3)
    const tsGroup = new THREE.Group();

    // 1. Primary Trans-Planckian Resonator Torus Knot
    const knotGeo = new THREE.TorusKnotGeometry(10, 3.2, 200, 40);
    const knotMat = new THREE.MeshBasicMaterial({
      color: 0x818cf8, // Indigo
      wireframe: true,
      transparent: true,
      opacity: 0.85
    });
    const tsMesh = new THREE.Mesh(knotGeo, knotMat);
    tsGroup.add(tsMesh);

    // 2. Ternary-Field Recursive Core (Goldilocks + BabyBear + Mersenne-31)
    const coreGeo = new THREE.DodecahedronGeometry(4.4, 1);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8, // Sky Cyan
      wireframe: true,
      transparent: true,
      opacity: 0.72
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    tsGroup.add(coreMesh);

    // 3. Entangled Quantum Vacuum Photon Cloud (1.0 Ebps/mm^2)
    const particleCount = 900;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const u = Math.random() * Math.PI * 2;
      const v = Math.random() * Math.PI;
      const r = 12 + Math.random() * 9;
      positions[i * 3] = r * Math.sin(v) * Math.cos(u);
      positions[i * 3 + 1] = r * Math.sin(v) * Math.sin(u);
      positions[i * 3 + 2] = r * Math.cos(v);

      if (i % 3 === 0) {
        colors[i * 3] = 0.50; // Indigo
        colors[i * 3 + 1] = 0.55;
        colors[i * 3 + 2] = 0.97;
      } else if (i % 3 === 1) {
        colors[i * 3] = 0.22; // Sky blue
        colors[i * 3 + 1] = 0.74;
        colors[i * 3 + 2] = 0.97;
      } else {
        colors[i * 3] = 0.0;  // Emerald
        colors[i * 3 + 1] = 0.90;
        colors[i * 3 + 2] = 0.46;
      }
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.24,
      vertexColors: true,
      transparent: true,
      opacity: 0.85
    });
    const particleCloud = new THREE.Points(particleGeo, particleMat);
    tsGroup.add(particleCloud);

    // 4. Entangled Retinal-Cortical V1/V2 Axis (20-200Hz)
    const beamGeo = new THREE.CylinderGeometry(0.08, 0.08, 28, 8);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0x00e676,
      transparent: true,
      opacity: 0.55
    });
    const beamMesh = new THREE.Mesh(beamGeo, beamMat);
    beamMesh.rotation.z = Math.PI / 3;
    tsGroup.add(beamMesh);

    scene.add(tsGroup);

    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      tsGroup.rotation.y += 0.012;
      tsGroup.rotation.x += 0.006;
      coreMesh.rotation.y -= 0.015;
      particleCloud.rotation.y -= 0.005;
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
    <div className="w-full h-96 rounded-xl overflow-hidden border border-indigo-500/30 relative">
      <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur-md p-2 rounded-lg border border-indigo-500/40 text-indigo-300 text-xs font-mono shadow-lg">
        TRANSCENDENT SINGULARITY V28.0 — OPTICAL RESONATOR: 1.0 EBPS/MM² | BURST BAND: 1000 Hz | TERNARY zk-STARK: LOCKED
      </div>
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
};

export default TranscendentRealitySingularity3D;

