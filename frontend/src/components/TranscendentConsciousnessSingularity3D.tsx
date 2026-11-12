import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const TranscendentConsciousnessSingularity3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 384;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000002);

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 26, 52);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 3D Transcendent Consciousness Hyperlattice Matrix Geometry (suggestion-v30.md Section 5.3)
    const tsGroup = new THREE.Group();

    // 1. Primary Soliton-Hyperlattice Torus Knot
    const knotGeo = new THREE.TorusKnotGeometry(16, 4.2, 300, 60);
    const knotMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8, // Sky Blue
      wireframe: true,
      transparent: true,
      opacity: 0.85
    });
    const tsMesh = new THREE.Mesh(knotGeo, knotMat);
    tsGroup.add(tsMesh);

    // 2. Infinite-Order Planckian Hyperlattice Core (Nested Wireframe Manifolds)
    const outerCubeGeo = new THREE.BoxGeometry(10.0, 10.0, 10.0);
    const outerCubeMat = new THREE.MeshBasicMaterial({
      color: 0xf43f5e, // Crimson Rose
      wireframe: true,
      transparent: true,
      opacity: 0.72
    });
    const outerCubeMesh = new THREE.Mesh(outerCubeGeo, outerCubeMat);
    tsGroup.add(outerCubeMesh);

    const innerPolyGeo = new THREE.IcosahedronGeometry(5.5, 2);
    const innerPolyMat = new THREE.MeshBasicMaterial({
      color: 0xfacc15, // Gold
      wireframe: true,
      transparent: true,
      opacity: 0.82
    });
    const innerPolyMesh = new THREE.Mesh(innerPolyGeo, innerPolyMat);
    tsGroup.add(innerPolyMesh);

    // 3. CV-QKD Entangled Single-Photon Cloud (1.0 Zbps/mm^2)
    const particleCount = 1800;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const u = Math.random() * Math.PI * 2;
      const v = Math.random() * Math.PI;
      const r = 17 + Math.random() * 12;
      positions[i * 3] = r * Math.sin(v) * Math.cos(u);
      positions[i * 3 + 1] = r * Math.sin(v) * Math.sin(u);
      positions[i * 3 + 2] = r * Math.cos(v);

      if (i % 3 === 0) {
        colors[i * 3] = 0.22; // Sky Blue
        colors[i * 3 + 1] = 0.74;
        colors[i * 3 + 2] = 0.97;
      } else if (i % 3 === 1) {
        colors[i * 3] = 0.96; // Rose
        colors[i * 3 + 1] = 0.25;
        colors[i * 3 + 2] = 0.37;
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
      opacity: 0.88
    });
    const particleCloud = new THREE.Points(particleGeo, particleMat);
    tsGroup.add(particleCloud);

    // 4. Full-Duplex CV-QKD V1-V8 Optical Axis (20-400Hz)
    const beamGeo = new THREE.CylinderGeometry(0.10, 0.10, 38, 8);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0x00e676,
      transparent: true,
      opacity: 0.58
    });
    const beamMesh = new THREE.Mesh(beamGeo, beamMat);
    beamMesh.rotation.z = Math.PI / 3;
    tsGroup.add(beamMesh);

    scene.add(tsGroup);

    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      tsGroup.rotation.y += 0.016;
      tsGroup.rotation.x += 0.008;
      outerCubeMesh.rotation.y -= 0.020;
      innerPolyMesh.rotation.x += 0.024;
      particleCloud.rotation.y -= 0.007;
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
        TRANSCENDENT CONSCIOUSNESS V31.0 — HYPERLATTICE: 1.0 ZBPS/MM² | SUB-TERAHERTZ: 10000 Hz | SENARY zk-STARK: LOCKED
      </div>
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
};

export default TranscendentConsciousnessSingularity3D;

