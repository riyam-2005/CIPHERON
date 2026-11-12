import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const OmniExistentialSingularity3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 384;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000002);

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 24, 48);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 3D Quantum Gravitational Soliton-Hypercube Geometry (suggestion-v29.md Section 5.3)
    const oeGroup = new THREE.Group();

    // 1. Primary Soliton-Hypercube Torus Knot Lattice
    const knotGeo = new THREE.TorusKnotGeometry(14, 3.8, 260, 52);
    const knotMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8, // Sky Blue
      wireframe: true,
      transparent: true,
      opacity: 0.85
    });
    const oeMesh = new THREE.Mesh(knotGeo, knotMat);
    oeGroup.add(oeMesh);

    // 2. Planckian Hypercube Core Projection (4D/8D Wireframe Lattice)
    const cubeGeo = new THREE.BoxGeometry(8.5, 8.5, 8.5);
    const cubeMat = new THREE.MeshBasicMaterial({
      color: 0xfacc15, // Amber Gold
      wireframe: true,
      transparent: true,
      opacity: 0.72
    });
    const cubeMesh = new THREE.Mesh(cubeGeo, cubeMat);
    oeGroup.add(cubeMesh);

    const innerCubeGeo = new THREE.BoxGeometry(5.0, 5.0, 5.0);
    const innerCubeMat = new THREE.MeshBasicMaterial({
      color: 0xa855f7, // Ultraviolet
      wireframe: true,
      transparent: true,
      opacity: 0.80
    });
    const innerCubeMesh = new THREE.Mesh(innerCubeGeo, innerCubeMat);
    oeGroup.add(innerCubeMesh);

    // 3. Macroscopic EPR Entangled Pan-Retinal Photon Cloud (100.0 Ebps/mm^2)
    const particleCount = 1400;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const u = Math.random() * Math.PI * 2;
      const v = Math.random() * Math.PI;
      const r = 15 + Math.random() * 11;
      positions[i * 3] = r * Math.sin(v) * Math.cos(u);
      positions[i * 3 + 1] = r * Math.sin(v) * Math.sin(u);
      positions[i * 3 + 2] = r * Math.cos(v);

      if (i % 3 === 0) {
        colors[i * 3] = 0.22; // Sky Blue
        colors[i * 3 + 1] = 0.74;
        colors[i * 3 + 2] = 0.97;
      } else if (i % 3 === 1) {
        colors[i * 3] = 0.98; // Gold
        colors[i * 3 + 1] = 0.80;
        colors[i * 3 + 2] = 0.08;
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
    oeGroup.add(particleCloud);

    // 4. Full-Duplex EPR Pan-Retinal V1-V6 Axis (20-300Hz)
    const beamGeo = new THREE.CylinderGeometry(0.09, 0.09, 34, 8);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0x00e676,
      transparent: true,
      opacity: 0.55
    });
    const beamMesh = new THREE.Mesh(beamGeo, beamMat);
    beamMesh.rotation.z = Math.PI / 3;
    oeGroup.add(beamMesh);

    scene.add(oeGroup);

    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      oeGroup.rotation.y += 0.015;
      oeGroup.rotation.x += 0.008;
      cubeMesh.rotation.y -= 0.018;
      innerCubeMesh.rotation.x += 0.022;
      particleCloud.rotation.y -= 0.006;
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
        OMNI-EXISTENTIAL CONSCIOUSNESS V30.0 — HYPERCUBE: 100.0 EBPS/MM² | GIGAHERTZ BURST: 5000 Hz | QUINARY zk-STARK: LOCKED
      </div>
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
};

export default OmniExistentialSingularity3D;

