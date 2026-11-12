import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const OmnipotentRealitySingularity3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 384;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000004);

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 22, 44);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 3D Quantum Gravitational Soliton-Lattice Geometry (suggestion-v28.md Section 5.3)
    const opGroup = new THREE.Group();

    // 1. Primary Gravitational Soliton Torus Knot Lattice
    const knotGeo = new THREE.TorusKnotGeometry(12, 3.4, 220, 44);
    const knotMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8, // Sky Blue
      wireframe: true,
      transparent: true,
      opacity: 0.85
    });
    const opMesh = new THREE.Mesh(knotGeo, knotMat);
    opGroup.add(opMesh);

    // 2. Quaternary-Field Singularity Core (Goldilocks+BabyBear+Mersenne31+KoalaBear)
    const coreGeo = new THREE.IcosahedronGeometry(5.0, 2);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0xf472b6, // Rose Pink / Quantum Singularity
      wireframe: true,
      transparent: true,
      opacity: 0.72
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    opGroup.add(coreMesh);

    // 3. Squeezed-State Gravitational Photon Cloud (10.0 Ebps/mm^2)
    const particleCount = 1100;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const u = Math.random() * Math.PI * 2;
      const v = Math.random() * Math.PI;
      const r = 13 + Math.random() * 10;
      positions[i * 3] = r * Math.sin(v) * Math.cos(u);
      positions[i * 3 + 1] = r * Math.sin(v) * Math.sin(u);
      positions[i * 3 + 2] = r * Math.cos(v);

      if (i % 3 === 0) {
        colors[i * 3] = 0.22; // Sky Blue
        colors[i * 3 + 1] = 0.74;
        colors[i * 3 + 2] = 0.97;
      } else if (i % 3 === 1) {
        colors[i * 3] = 0.96; // Rose Pink
        colors[i * 3 + 1] = 0.45;
        colors[i * 3 + 2] = 0.71;
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
    opGroup.add(particleCloud);

    // 4. Full-Duplex Squeezed Retinal-Cortical V1/V2/V4 Axis (20-250Hz)
    const beamGeo = new THREE.CylinderGeometry(0.08, 0.08, 30, 8);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0x00e676,
      transparent: true,
      opacity: 0.55
    });
    const beamMesh = new THREE.Mesh(beamGeo, beamMat);
    beamMesh.rotation.z = Math.PI / 3;
    opGroup.add(beamMesh);

    scene.add(opGroup);

    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      opGroup.rotation.y += 0.012;
      opGroup.rotation.x += 0.006;
      coreMesh.rotation.y -= 0.016;
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
    <div className="w-full h-96 rounded-xl overflow-hidden border border-sky-500/30 relative">
      <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur-md p-2 rounded-lg border border-sky-500/40 text-sky-300 text-xs font-mono shadow-lg">
        OMNIPOTENT BIO-QUANTUM V29.0 — SOLITON-LATTICE: 10.0 EBPS/MM² | ULTRA-BURST: 2500 Hz | QUATERNARY zk-STARK: LOCKED
      </div>
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
};

export default OmnipotentRealitySingularity3D;

